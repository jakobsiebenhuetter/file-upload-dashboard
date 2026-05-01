const express = require('express');
const OpenAI = require('openai');
// const Grok = require('grok-sdk');
const { GoogleGenAI } = require('@google/genai');

const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

const { PDFParse } = require('pdf-parse');

const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');

const StorageInterface = require('./StorageInterface');
const {validateInput} = require('./util');
const { extractPDFText } = require('./Middlewares/PDFExtractor.js');
const storage = new StorageInterface('json');


const app = express();
app.use(cors());
app.use(express.json());

const jsonPath = '../data/data.json';
const folderPath = './data/Folders';
const tnPath = './data/Thumbnails';

// Statische Dateien aus dem dist-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use('/data', express.static(path.join(__dirname, 'data')));

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
                text: `Du bist ein hilfreicher Assistent, der dabei hilft Informationen über Dokumente zu geben. Du bekommst den Inhalt eines Dokuments und eine Frage dazu, beantworte die Frage so gut wie möglich auf Basis des Inhalts. Wenn du die Frage nicht beantworten kannst, sage das auch. Antworte immer in einem vollständigen Satz. Bitte berücksichtige den gesamten Chatverlauf, um die Frage zu beantworten.`
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
    let msg = {
        message: '',
        type: 'info',
        files: [],
        currentPage: 1,
        maxPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        state: 'no-filter'
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
        data: [],
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
    const { text, id } = req.body;
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

    let newPath = null;
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
            data = await storage.saveFiles(req.files, focus, date);
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

    let msg = {
        message: '',
        type: 'info',
        files: [],
        currentPage: 1,
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
        msg.filesForPage = unfilteredFiles.filesForPage;
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
    const apiKey = process.env.API_AI_GOOGLE_KEY

    try {

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
                        text: `FolderId = ${folderId}; FileId = ${fileId} ${prompt}`
                    }
                ]
            });

        const response = await googleClient.models.generateContent({
            // model: "gemini-3-flash-preview",
            model: "gemini-2.5-flash",
            contents: globalPrompt,
            config: {
                tools: [
                    mcpTools,
                    // {googleSearch: {}}
                ] 
            }
        });
        
        console.log('AI Response:', response.functionCalls);
        
        if(response.functionCalls) {
            const toolResponse = await mcpClient.callTool({
                name: response.functionCalls[0].name,
                arguments: response.functionCalls[0].args
            });
            console.log('Tool Response:', toolResponse);
        }

 
        globalPrompt.push(
            {
                role: 'MODEL',
                parts: [
                    {
                        text: response.text
                    }
                ]
            });

        } catch (error) {
            console.error('Error handling AI request:', error);
            return res.json({
                answer: 'Fehler bei der Verarbeitung der AI-Anfrage'
            });
        }
    console.dir(globalPrompt);
    res.json({
        answer: globalPrompt[globalPrompt.length - 1].parts[0].text
    });

});


async function handleGoogleGenAI(prompt = "Explain how AI works in a few words") {
    
    const googleClient = new GoogleGenAI({
        apiKey: process.env.API_AI_GOOGLE_KEY,
    });
    
    const response = await googleClient.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    tools: [
        //...
    ]
  });

  return response.text;
}

app.listen(2000, () => {
    console.log('Server listen on Port 2000');
    initMcp().catch(err => {
        console.error('MCP-Init fehlgeschlagen:', err);
        process.exit(1);
    });
});
