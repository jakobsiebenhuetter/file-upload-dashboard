import express from 'express';

import OpenAI from 'openai';
import {PDFParse} from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

import multer from 'multer';
import crypto from 'crypto';

import {exec} from 'child_process';

import {StorageInterface} from './StorageInterface.js';

import { TPageData } from '../shared-types/Types.js';

import {validateInput} from './util';


const storage = new StorageInterface('json');

const PORT = process.env.PORT || 2000;
const url = process.env.MAIN_URL || `http://localhost:${PORT}`;

const app = express();
app.use(cors());
app.use(express.json());

const jsonPath = '../data/data.json';
const folderPath = './data/Folders';
const tnPath = './data/Thumbnails';

// Statische Dateien aus dem dist-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '../../..', 'dist')));
app.use('/data', express.static(path.join(__dirname, '../..', 'data')));

// Hier noch überprüfen,ob die Datenstruktur existiert, wenn nicht, dann erstellen
if (!fs.existsSync(jsonPath)) {
    const folders = {
        folders: []
    }
    console.log('File exisitiert nicht, es wird ein neues erstellt')
    fs.writeFileSync(jsonPath, JSON.stringify(folders, null, 2), 'utf-8')
}

if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

if(!fs.existsSync(folderPath)){
    fs.mkdirSync(folderPath);
}

if(!fs.existsSync(tnPath)){
    fs.mkdirSync(tnPath);
}

let mcpClient;
let mcpTools = [];
const globalPrompt = [
    {
        role: 'USER',
        parts: [
            {
                text: `Du bist ein hilfreicher Assistent, der dabei hilft Informationen über Dokumente zu geben. Du bekommst den Inhalt eines Dokuments und eine Frage dazu, beantworte die Frage so gut wie möglich auf Basis des Inhalts. Wenn du die Frage nicht beantworten kannst, sage das auch. Antworte immer in einem vollständigen Satz. Bitte berücksichtige den gesamten Chatverlauf, um die Frage zu beantworten. Verwende die bereitgestellten Tools, wenn nötig, die Ergebnisse verwende aber nicht als Output sondern verwende deinen Output`
            }
        ]
    }
];

async function initMcp() {
    const mcpTransport = new StdioClientTransport({
        command: 'node',
        args: [path.join(__dirname, 'MCP', 'MCP-Server.js')],
    });

    mcpClient = new Client(
        { name: 'MCP Client host', version: '1.0.0' },
        { capabilities: {} }
    );

    await mcpClient.connect(mcpTransport);

    const { tools } = await mcpClient.listTools();
    mcpTools = [
        {
            functionDeclarations: tools.map(tool => ({  
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
            })),
        }
    ];

    console.log(`MCP verbunden, ${mcpTools[0].functionDeclarations.length} Tools verfügbar.`);
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Hier weiter machen mit den Typen für die Endpoints
app.get('/getData', async (req, res) => {
    const data = storage.getData();
    res.json(data);
});

app.get('/get-folders', (req, res) => {
    // const user?
    let msg = {
        message: '',
        type: 'info',
        folders: []
    }

    try {
        msg.folders = storage.getFolders();
        msg.type = 'success';
        msg.message = 'Ordner erfolgreich geladen';
    } catch (error) {
        msg.message = `Fehler beim laden der Ordner: ${error}`;
        msg.type = 'error';
    }
    res.json(msg);
});


app.post('/get-files', (req, res) => {
    // Hier prev und next bestimmen
    let { folderId, page } = req.body;
    page = parseInt(page);
    let msg: TPageData = {
        message: '',
        type: 'info',
        files: [],
        currentPage: 1,
        maxPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        state: 'no-filter',
        info: ''
    };

    if(page < 1) {
        msg.message = 'Ungültige Seitennummer';
        msg.type = 'error';
        return res.json(msg);
    }
    
    try {
        const { filesForPage, maxPages } = storage.getFiles(folderId, page);
        
        msg.currentPage = page;

        if(page > maxPages) {
            msg.message = 'Ungültige Seitennummer';
            msg.type = 'error';
            return res.json(msg);
        }

        if(page > 1) {
            msg.hasPreviousPage = true;
        }

        if(page < maxPages) {
            msg.hasNextPage = true;
        }

        msg.files = filesForPage;
        msg.maxPages = maxPages;
        msg.type = 'success';
        msg.message = 'Dateien erfolgreich geladen';
    } catch (error) {
        msg.message = `Error getting files: ${error}`;
        msg.type = 'error';
    }
    res.json(msg);
});

app.post('/delete-file', async (req, res) => {
    const { fileId, folderId } = req.body;
    let msg = {
        data: {},
        type: '',
        message: ''
    };
    try {
        msg.data = storage.deleteFile(folderId, fileId);
        msg.type = 'success';
        msg.message = 'File erfolgreich gelöscht';
    } catch(error) {
        msg.type = 'error';
        msg.message = `Error deleting file: ${error}`;
    }
    res.json(msg);
});


app.post('/create-folder', (req, res) => {
    // Hier noch die richtige id übergeben
    // Ordnernamen übergeben? Gibt es den Namen schon?
    const { text } = req.body;
    let data = storage.getData();

    if(!validateInput(text)) {
        const msg = {
            info: 'Ungültiger Ordnername',
            data: data
        };
        return res.json(msg);
    }

    for(const folder of data.folders) {
        if(folder.folderName === text.trim()) {
            const msg = {
                info: 'Ordnername existiert bereits',
                data: data
            };
            return res.json(msg);
        }
    }

    const uuidFolderName = crypto.randomUUID();
    const uuid = crypto.randomUUID();
    const newFolderPath = path.join(folderPath, uuidFolderName);
    
        if (data.folders.length >= 4) {
            const msg = {
                info: 'Maximale Anzahl an Ordnern erreicht',
                data: data
            };
            return res.json(msg);
        }

    fs.mkdirSync(newFolderPath, { recursive: true });

    const folderObj = {
        id: uuid,
        folderName: text,
        path: newFolderPath,
        files: [],
    };
    
    // Hier ist ein Bug
    data = storage.saveFolder(folderObj);
    // Hier wird der Fokus dynamisch gesetzt und nicht gespeichert  
    data.folders[data.folders.length - 1].focus = true;
    const msg = {
        info: 'Ordner erstellt',
        data: data
    };

    res.json(msg);
});

app.post('/upload', async (req, res) => {
    // nur bestimmte Dateitypen erlauben, am besten mit einem Filter in multer
    // Hier alles abchecken
    let msg = {
        type: 'info',
        message: '',
        data: null
    };

    let newPath = '';
    const datetime = new Date(); // Hier weiter machen
    let date = `${datetime.getDate()}.${datetime.getMonth() + 1}.${datetime.getFullYear()}`;
    const uploadStorage = multer.diskStorage({

        // Es muss zuerst der focus im frontend in den body gesetzt werden sonst funktioniert das nicht
        destination: (req, file, cb) => {
            const data = storage.getData();
            const dest = req.body.focus;

            for (const folder of data.folders) {
                if (folder.id === dest) {
                    newPath = folder.path;
                    break;
                };
            };

            cb(null, newPath);
        },

        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    });

    const upload = multer({ storage: uploadStorage }).array('file');

    upload(req, res, async (err) => {
        let focus = req.body.focus;
        try {
            const data = await storage.saveFiles(req.files, focus, date);
            msg.message = 'Erfolgreich upgeloadet';
            msg.type = 'success';
            msg.data = data;

        } catch (error) {
            msg.message = `Fehler beim speichern ${error}`;
            msg.type = 'error';
        }
        res.json(msg);
    })
});


app.post('/delete-folder', (req, res) => {
    const { id } = req.body;
    storage.deleteFolder(id);

    const message = {
        info: 'Folder entfernt'
    };
    res.json(message);
})

app.post('/get-filtered-files', (req, res) => {
    let { folderId, char, pageNumber } = req.body;
    let page = parseInt(pageNumber);

    
    let msg: TPageData = {
        info: '',
        message: '',
        type: 'info',
        files: [],
        currentPage: 1,
        filesPerPage: [],
        maxPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        state: 'filter'
    };

    if(!validateInput(folderId)) {
        msg.info = 'Ungültige OrdnerId';
        msg.files = [];
        msg.type = 'error';
        return res.json(msg);
    }
    
     const unfilteredFiles = storage.getFiles(folderId);

    if(char.trim() === '') {      
        msg.info = 'Kein Suchbegriff';
        msg.maxPages = unfilteredFiles.maxPages;
        msg.currentPage = 1;
        msg.filesPerPage = unfilteredFiles.filesForPage;
        msg.hasNextPage = false;
        msg.hasPreviousPage = false;
        msg.type = 'info';
        msg.state = 'no-filter';
        return res.json(msg);
    }
    
    const {filesForPage, maxPages} = storage.getFilteredFiles(folderId, char, page);
      let previous = false;
      let nextPage = false;

      if(page < maxPages) {
        nextPage = true;
      }

      if(page > 1) {
        previous = true;
      }

     msg = {
        message: 'Gefilterte Dateien erfolgreich geladen',
        info: 'Gefilterte Dateien',
        files: filesForPage,
        maxPages: maxPages,
        currentPage: page,
        hasPreviousPage: previous,
        hasNextPage: nextPage,
        type: 'success',
        state: 'filter'
    };
    res.json(msg);
})


app.post('/ai-request', async(req, res) => {
    const { prompt, fileId, folderId } = req.body;

    const fileData = storage.getFile(folderId, fileId);

    const parser = new PDFParse({url: fileData.path});

    const text = await parser.getText();

        if(apiKey === undefined) {
            return res.json({
                answer: 'AI API Key oder URL nicht definiert'
            });
        }
        
        const googleClient = new GoogleGenAI({
            apiKey: apiKey,
        });
        
        globalPrompt.push(
            {
                role: 'USER',
                parts: [
                    {
                        text: `FolderId = ${folderId}; FileId = ${fileId}; User:  ${prompt}`
                    }
                ]
            });

        const response = await googleClient.models.generateContent({
            model: "gemini-3-flash-preview",
            // model: "gemini-2.5-flash",
            // model: "gemini-2.5-flash-lite",
            contents: globalPrompt,
            config: {
                tools: [
                    mcpTools
                    // {googleSearch: {}}
                    // {codeExecution: {}} 
                ] 
            }
        });
        
        console.dir(response.functionCalls);
        
        if(response.functionCalls) {
            const toolResponse = await mcpClient.callTool({
                name: response.functionCalls[0].name,
                arguments: response.functionCalls[0].args
            });
            console.log('Tool Response:', toolResponse);
        }

        const modelResponse = {
            role: 'MODEL',
            parts: []
        };

        if(response.text) {
            modelResponse.parts.push({
                text: response.text
            });
        } else if(response.functionCalls) {
            modelResponse.parts.push(
                {
                    text: `Tool ${response.functionCalls[0].name} wurde aufgerufen mit den Argumenten
                    ${JSON.stringify(response.functionCalls[0].args)}
                    und hat die folgende Antwort zurückgegeben: ${toolResponse.content[0].text}`
                }
            );
        }

        globalPrompt.push(modelResponse);

        } catch (error) {
            console.error('Error handling AI request:', error);
            return res.json({
                answer: 'Fehler bei der Verarbeitung der AI-Anfrage'
            });
        }

    console.dir(globalPrompt);

    res.json({
        answer: response.output_text
    });

});


app.listen(PORT, () => {
    console.log(`Server listen on Port ${PORT}`);
    console.log(process.platform);
    exec(`start ${url}`);
});
