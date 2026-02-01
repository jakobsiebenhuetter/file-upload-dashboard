const crypto = require('crypto');
const fs = require('fs');

const Database = require('better-sqlite3');
const TNGenerator = require('./Middlewares/thumbnailGenerator');
const db = new Database('../data/file-upload-dashboard.db');

class DatabaseStorage {

    constructor() {
        try {
            db.prepare(`CREATE TABLE IF NOT EXISTS folders ( id INTEGER PRIMARY KEY, folderId TEXT, folderName TEXT, path TEXT)`).run();
            db.prepare(`CREATE TABLE IF NOT EXISTS files ( id INTEGER PRIMARY KEY, fileId TEXT, folderId TEXT, fileName TEXT, path TEXT, thumbnailPath TEXT, date TEXT)`).run();
        } catch(error) {
            console.error('Error creating folders table:', error);
        };
    }

    getData() {
        try {
            const folders = db.prepare(`SELECT * FROM folders`).all();
            const files = db.prepare(`SELECT * FROM files`).all();

            const data = {
                folders: folders.map(folder => ({
                    id:folder.folderId,
                    folderName: folder.folderName,
                    path: folder.path,
                    files: files
                    .filter(file => file.folderId === folder.folderId)
                    .map(file => ({
                        id: file.fileId,
                        title: file.fileName,
                        path: file.path,
                        thumbnailPath: file.thumbnailPath,
                        date: file.date
                    }))
                }))
            }
            
            return data;
        } catch (error) {
            console.error('Error getting data:', error);
            return { folders: [] };
        }
    }

    saveFolder(folderObj) {
        try {
            db.prepare(`INSERT INTO folders (folderId, folderName, path) VALUES (?, ?, ?)`).run(folderObj.id, folderObj.folderName, folderObj.path);
         } catch (error) {
            console.error('Error saving folder:', error);
        }
        return this.getData();
    }

    // Next Step: Hier weiter machen
    async saveFiles(files, folderId, date) {
        for (const file of files) {
            const uuid = crypto.randomUUID();
            const fileName = file.originalname;
          
            let thumbnailPath = await TNGenerator.generateTN(file);
           
            try {
                db.prepare('INSERT INTO files (fileId, folderId, fileName, path, thumbnailPath, date) VALUES (?, ?, ?, ?, ?, ?)').run(uuid, folderId, fileName, file.path, thumbnailPath, date);
            } catch (error) {
                console.error('Error saving file:', error);
            }
        }

        return this.getData();
    }

    
    deleteFile(folderId, fileId) {
        try {
            const file = db.prepare(`SELECT * FROM files WHERE fileId = ? AND folderId = ?`).get(fileId, folderId);
            if(file) {
                fs.rmSync(file.thumbnailPath);
                fs.rmSync(file.path);
            }
        } catch (error) {
            console.error('Error deleting file from filesystem:', error);
        }

        try {
            db.prepare(`DELETE FROM files WHERE fileId = ?`).run(fileId);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    deleteFolder(folderId) {
        try {
           const files = db.prepare('SELECT * FROM files WHERE folderId = ?').all(folderId);
           const folder = db.prepare('SELECT * FROM folders WHERE folderId = ?').get(folderId);
           if(folder) {
                fs.rmdirSync(folder.path, { recursive: true });
           }
           if(files) {
            for (const file of files) {
                fs.rmSync(file.thumbnailPath);
            }
        }
            db.prepare(`DELETE FROM folders WHERE folderId = ?`).run(folderId);
            db.prepare(`DELETE FROM files WHERE folderId = ?`).run(folderId);
        } catch (error) {
            console.error('Error deleting folder and its files:', error);
        }
    }
}

module.exports = DatabaseStorage;