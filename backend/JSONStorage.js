const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const TNGenerator = require('./Middlewares/thumbnailGenerator');

const jsonPath = '../data/data.json';
const tnPath = './data/Thumbnails';

class JSONStorage {
 
    saveFolder(folderObj) {
        const data = this.getData();
        data.folders.push(folderObj);
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
        return data;
    }

    async saveFiles(files, folderId, date) {
        const data = this.getData();
        
         for (let folder of data.folders) {
            if (folder.id === folderId) {
                for (const f of files) {
                     const uuid = crypto.randomUUID();
                     const extname = path.extname(f.path);
                     
                    // UUID für jede Datei an den Namen anhängen, sonst überschreiben sich gleiche Dateinamen
                     switch(extname) {
                        case '.pdf': {
                            const title = f.originalname;
                            const thumbnailPath = await TNGenerator.pdfConverter(f.path);
                            folder.files.push({ id: uuid, title: title, path: f.path, thumbnailPath: thumbnailPath, date: date });
                            break;
                        }

                        case '.mp4': {
                             const title = f.originalname;
                             let fileName = path.basename(f.path);
                             fileName = fileName.split('.')[0] + '.png';
                             const targetTnPath = path.join(tnPath, fileName);
                            
                            await TNGenerator.createVideoThumbnail(f.path, tnPath, fileName)
                            folder.files.push({ id: uuid, title: title, path: f.path, thumbnailPath: targetTnPath, date: date})
                            break;
                        }

                        case '.txt': {
                            const title = f.originalname;
                            const thumbnailPath = await TNGenerator.startPuppeteerBrowser(f.path);
                            folder.files.push({ id: uuid, title: title, path: f.path, thumbnailPath: thumbnailPath, date: date });
                            
                            break;
                        }

                        default: {                        
                            const title = f.originalname;
                            const fileName = path.basename(f.path);
                            const thumbnailPath = path.join(tnPath, fileName);
                            fs.copyFileSync(f.path, thumbnailPath);
                            folder.files.push({ id: uuid, title: title, path: f.path, thumbnailPath: thumbnailPath, date: date });
                            
                            break;
                     }
                }
            }
         }
    }
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
    return data;
}

    getData() {
        const file = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(file);
        return data;
    }

    getFolders() {
        // ...
    }

    getFiles() {
        // ...
    }

    deleteFile(folderId, fileId) {
        const data = this.getData();
         for (const folder of data.folders) {
            if (folder.id === folderId) {
                for (const file of folder.files) {
                    if (fileId === file.id) {
                        try {
                            fs.rmSync(file.thumbnailPath);
                            fs.rmSync(file.path);
                            const fileIndex = folder.files.findIndex((file) => { return file.id === fileId });
                            folder.files.splice(fileIndex, 1);
                            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
                            
                        } catch (error) {
                                console.log(error);
                            }
                        }
                    }
                }
            }
        
        return data; 
    }

    deleteFolder(folderId) {
        const data = this.getData();
        for (const folder of data.folders) {

            if (folder.id === folderId) {
                const newObj = {
                    folders: null,
                };
                
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
    }
}

module.exports = JSONStorage;