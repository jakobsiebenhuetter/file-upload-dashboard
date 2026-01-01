const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');

const puppeteer = require('puppeteer');

const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = require('ffprobe-static');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

const app = express();
app.use(cors());
app.use(express.json());

const jsonPath = '../data/data.json';
const folderPath = './data/Folders';
const tnPath = './data/Thumbnails';

// Statische Dateien aus dem dist-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use('/data', express.static(path.join(__dirname, 'data')));

async function startPuppeteerBrowser(filePath) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Read and escape file content to avoid accidental HTML injection

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const escapeHtml = (str) =>
        str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escaped = escapeHtml(fileContent);
    const htmlContent = `
    <!doctype html>
    <html lang="de">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Thumbnail</title>
        <style>
            .container {
                max-width: 960px;
                margin: 24px auto;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>Datei: ${path.basename(filePath)}</header>
            <pre>${escaped}</pre>
        </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    const tnImage = await page.screenshot();
    const uuid = crypto.randomUUID();
    const newthumbnailPath = `${tnPath}/${uuid}.png`;

    fs.writeFileSync(newthumbnailPath, tnImage);
    await browser.close();

    return newthumbnailPath;
};

function createVideoThumbnail(videoPath, tnPath, fileName) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .on('end', resolve)
            .on('error', reject)
            .screenshots({
                count: 1,
                filename: fileName,
                folder: tnPath,
                size: '320x240'
            });
    });
}

async function pdfConverter(pdfPath) {
    const { pdf } = await import('pdf-to-img');
    const uuid = crypto.randomUUID();
    const newthumbnailPath = `${tnPath}/${uuid}.png`;
    const document = await pdf(pdfPath);
    const pageBuffer = await document.getPage(1);

    fs.writeFileSync(newthumbnailPath, pageBuffer);
    return newthumbnailPath;
};



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

app.get('/getJson', async (req, res) => {
    const file = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(file);
    const { folders } = data;
    for (const da of folders) {
        if (da.files.length) {
            for (const file of da.files) {
                // da.tn = await pdfConverter(file);

            }
        }
    }

    res.json(data);
});

app.post('/delete-file', async (req, res) => {
    const { fileId, folderId } = req.body;
    const file = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(file);
    // Hier die Datei aus dem Dateisystem löschen
    for (const folder of data.folders) {
        if (folder.id === folderId) {
            for (const file of folder.files) {
                console.log(fileId, file.id);
                if (fileId === file.id) {
                    try {
                        fs.rmSync(file.thumbnailPath);
                        fs.rmSync(file.path);
                        const fileIndex = folder.files.findIndex((file) => { return file.id === fileId });
                        folder.files.splice(fileIndex, 1);
                        fs.writeFileSync(jsonPath, JSON.stringify(data), 'utf-8');
                    } catch (error) {
                        console.log('Fehler aus Zeile 84: ' + error)
                    }
                }
            }
        }
    }

    res.json(data);
});

app.post('/create-folder', (req, res) => {
    // Hier noch die richtige id übergeben
    const { text, id } = req.body;
    let file = fs.readFileSync(jsonPath, 'utf-8');
    file = JSON.parse(file);

    if (file.folders.length >= 4) {
        const message = {
            info: 'Maximale Anzahl an Ordnern erreicht'
        };
        return res.json(message);
        ;
    }
    const uuidFolderName = crypto.randomUUID();
    const newFolderPath = path.join(folderPath, uuidFolderName);

    // Das hier in eine seperate Funktion auslagern
    if (fs.existsSync(newFolderPath)) {
        const message = {
            info: 'Folder existiert bereits'
        };
        return res.json(message);
    }

    fs.mkdirSync(newFolderPath, { recursive: true });

    const uuid = crypto.randomUUID();
    const folderObj = {
        id: uuid,
        folderName: text,
        path: newFolderPath,
        files: [],
    };


    file.folders.push(folderObj);
    fs.writeFileSync(jsonPath, JSON.stringify(file, null, 2), 'utf-8');
    // Hier wird der Fokus dynamisch gesetzt und nicht gespeichert

    const { folders } = file;
    folders[folders.length - 1].focus = true;

    res.json(file);
});

app.post('/upload', (req, res) => {

    let newPath = null;
    const datetime = new Date(); // Hier weiter machen
    let date = `${datetime.getDate()}.${datetime.getMonth() + 1}.${datetime.getFullYear()}`;
    const storage = multer.diskStorage({

        // Es muss zuerst der focus im frontend in den body gesetzt werden sonst funktioniert das nicht
        destination: (req, file, cb) => {
            let content = fs.readFileSync(jsonPath, 'utf-8');
            const { folders } = JSON.parse(content);
            const dest = req.body.focus;

            for (const folder of folders) {
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

    const upload = multer({ storage }).array('file');

    upload(req, res, async (err) => {
        let focus = req.body.focus;
        let content = fs.readFileSync(jsonPath, 'utf-8');
        const { folders } = JSON.parse(content);

        for (let folder of folders) {
            if (folder.id === focus) {
                for (const f of req.files) {

                    for (const filePath of folder.files) {
                        if (filePath.path === f.path) {
                            // Dieser Befehl ist nur für das data.json gedacht, es wird das file ja mit dem gleichen Namen überschrieben, dewegen braucht man das
                            console.log('Datei existiert bereits, wird übersprungen');
                            continue;
                        };
                    };

                    // Thumbnail generieren und speichern
                    const uuid = crypto.randomUUID();

                    if (path.extname(f.path) === '.pdf') {

                        const title = f.originalname;
                        const fPath = await pdfConverter(f.path);

                        folder.files.push({ id: uuid, title: title, path: f.path, thumbnailPath: fPath, date: date });


                    } else if (path.extname(f.path) === '.mp4') {

                        const title = f.originalname;
                        const fileName = path.basename(f.path);
                        var rr = '';
                        for (const n of fileName) {

                            if (n === '.') {
                                break;
                            }
                            rr += n;
                        }

                        rr += '.png';
                        const targetTnPath = path.join(tnPath, rr);

                        console.log(targetTnPath);
                        console.log(f.path);

                        // ffmpeg(f.path).screenshots({
                        //     count: 1,
                        //     filename: rr,
                        //     folder: tnPath,
                        //     size: '320x240'
                        // });

                        await createVideoThumbnail(f.path, tnPath, rr).then(() => {
                            folder.files.push({ id: uuid, title: title, path: f.path, thumbnailPath: targetTnPath, date: date });
                        });



                    } else if (path.extname(f.path) === '.txt') {

                        const title = f.originalname;

                        const newthumbnailPath = await startPuppeteerBrowser(f.path);

                        folder.files.push({ id: uuid, title: title, path: f.path, thumbnailPath: newthumbnailPath, date: date });

                    } else {
                        const title = f.originalname;
                        const fileName = path.basename(f.path);
                        const targetTnPath = path.join(tnPath, fileName);
                        fs.copyFileSync(f.path, targetTnPath);

                        folder.files.push({ id: uuid, title: title, path: f.path, thumbnailPath: targetTnPath, date: date });
                    };
                };
            };
        };

        if (err) {
            return res.status(500).json({ error: err.message });
        };

        fs.writeFileSync(jsonPath, JSON.stringify({ folders }, null, 2), 'utf-8')


        const message = {
            message: 'Erfolgreich upgeloadet'
        };

        res.json(message);
    })
});


app.post('/delete-folder', (req, res) => {
    const { id } = req.body;
    const filedata = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(filedata);
    for (const folder of data.folders) {
        if (folder.id === id) {
            const newObj = {
                folders: null,
            }
            newObj.folders = data.folders.filter((f) => f !== folder);

            fs.writeFileSync(jsonPath, JSON.stringify(newObj, null, 2), 'utf-8');
            fs.rmSync(folder.path, { recursive: true, force: true });
            if (folder.files.length) {
                for (const paths of folder.files) {
                    fs.rmSync(paths.thumbnailPath);
                }
            }
            break;
        }
    }

    const message = {
        info: 'Folder entfernt'
    }
    console.log(message);
    res.json(message);
})

app.listen(2000, () => console.log('Server listen on Port 2000'));
