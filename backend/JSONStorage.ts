import fs from 'fs';
import crypto from 'crypto';

import {generateTN} from './Middlewares/thumbnailGenerator.js';

import {TFile, TFolder} from './StorageInterface.js';

const jsonPath = '../data/data.json';
const tnPath = './data/Thumbnails';

export class JSONStorage {
    
    getData() {
        const file = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(file);
        return data;
    }

    saveFolder(folderObj: TFolder) {
        const data = this.getData();
        data.folders.push(folderObj);
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
        return data;
    }

    async saveFiles(files: Express.Multer.File[], folderId: string, date: string) {
        const data = this.getData();
        
         for (let folder of data.folders) {
            if (folder.id === folderId) {
                for (const file of files) {
                    const uuid = crypto.randomUUID();
                    const title = file.originalname;
                    let thumbnailPath = await generateTN(file);
                    folder.files.push({ id: uuid, title: title, path: file.path, thumbnailPath: thumbnailPath, date: date });
                }
            }
        }
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
        return data;
    }



    deleteFile(folderId: string, fileId: string): {filesForPage: TFile[], maxPages: number} {
        // Hier nur die Daten für den einen Ordner holen, damit nicht das ganze Objekt durchlaufen werden muss
        const data = this.getData();
         for (const folder of data.folders) {
            if (folder.id === folderId) {
                for (const file of folder.files) {
                    if (fileId === file.id) {
                        try {
                            fs.rmSync(file.thumbnailPath);
                            fs.rmSync(file.path);
                            const fileIndex = folder.files.findIndex((file: TFile) => { return file.id === fileId });
                            folder.files.splice(fileIndex, 1);
                            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
                            
                        } catch (error) {
                                console.log(error);
                            }
                        }
                    }
                }
            }
        
        return this.getFiles(folderId); 
    }

    deleteFolder(folderId: string) {
        const data = this.getData();
        for (const folder of data.folders) {

            if (folder.id === folderId) {
                const newObj = {
                    folders: null,
                };
                
                newObj.folders = data.folders.filter((f: TFolder) => f !== folder);
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

    getFiles(folderId: string, page = 1): {filesForPage: TFile[], maxPages: number} {
        // ... hier weiter machen
        let files = [];
        let maxPages = 1;
         try {
            const data = this.getData();
            files = data.folders.find((folder: TFolder) => folder.id === folderId) || {files: []};
        } catch (error) {
            console.error('Error reading data:', error);
        }

        let firstFile = (page - 1) * 4;
        let lastFile = firstFile + 4;


        maxPages = files.files.length ? Math.ceil(files.files.length / 4)  : 1;
        
        if(files.files.length < lastFile + 1) {
            lastFile = files.files.length;
        }
        
        let filesForPage = files.files.slice(firstFile, lastFile);
        return {filesForPage, maxPages};
    }

    getFolders() {
        let folders = [];
        try {
            const data = this.getData();
            folders = data.folders;
        } catch (error) {
            console.error('Error reading data:', error);
        }
        return folders;
    }

    getFilteredFiles(folderId: string, char: string, page = 1) {
        // Maxpages mit prev und nextPage hier berechnen
        // !!!! genauso wie bei getFiles, nur dass hier vorher, und hier eventuell auch den state setzen, muss aber noch überlegt werden
        
        let files = [];
        let maxPages = 1;
        console.log(folderId, char, page);

        try {
            const data = this.getData();
            const folder = data.folders.filter((folder: TFolder) => folder.id === folderId);
            if(folder.length) {
              console.log('Gefundener Ordner: ', folder);
                files = folder[0].files;
                if(files.length) {
                    files = files.filter((file: TFile) => file.title.includes(char));
                }
            }
        } catch (error) {
            console.error('Error reading data:', error);
        }

        maxPages = files.length ? Math.ceil(files.length / 4) : 1;
        let firstFile = (page - 1) * 4;
        let lastFile = firstFile + 4;
        let filesForPage = files.slice(firstFile, lastFile);
        return {filesForPage, maxPages};
    }

    getFile(folderId: string, fileId: string) {
        const data = this.getData();
        const folder = data.folders.filter((folder: TFolder) => folder.id === folderId);
        let file = null;
        if(folder.length) {
            file = folder[0].files.filter((file: TFile) => file.id === fileId);
        }

        if(file.length) {
            return file[0];
        }
    }
}
