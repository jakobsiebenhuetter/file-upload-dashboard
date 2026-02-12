const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');

const StorageInterface = require('./StorageInterface');
const {validateInput} = require('./util');
const { type } = require('os');
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.get('/getData', async (req, res) => {
    const data = storage.getData();
    res.json(data);
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
        type: 'default',
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
            msg.data = data;

        } catch (error) {
            msg.message = `Fehler beim speichern ${error}`;
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
    const { folderId, char } = req.body;
    
    if(!validateInput(folderId)) {
        const msg = {
            info: 'Ungültige OrdnerId',
            files: [],
            type: 'error'
        };
        return res.json(msg);
    }

    if(char.trim() === '') {
        const data = storage.getFiles(folderId);
        const msg = {
            info: 'Kein Suchbegriff',
            files: data,
            type: 'info'
        };
        return res.json(msg);
    }
    
    const files = storage.getFilteredFiles(folderId, char);
    const msg = {
        info: 'Gefilterte Dateien',
        files: files,
        type: 'success'
    };
    res.json(msg);
})

app.listen(2000, () => console.log('Server listen on Port 2000'));
