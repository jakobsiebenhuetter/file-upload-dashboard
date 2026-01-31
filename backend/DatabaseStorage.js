const Database = require('better-sqlite3');

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

    saveFolder() {
        try {
            db.prepare(`INSERT INTO folders (folderId, folderName, path) VALUES (?, ?, ?)`).run(folderObj.id, folderObj.folderName, folderObj.path);
         } catch (error) {
            console.error('Error saving folder:', error);
        }
    }

    // Next Step: Hier weiter machen
    saveFiles(files, folderId, date) {
        for (const f of files) {}
    }

    getFolders() {

    }

    getFiles() {
        
    }

    
    deleteFile(fileId) {
        try {
            db.prepare(`DELETE FROM files WHERE fileId = ?`).run(fileId);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    deleteFolder() {
        try {
            db.prepare(`DELETE FROM folders WHERE folderId = ?`).run(folderId);
            db.prepare(`DELETE FROM files WHERE folderId = ?`).run(folderId);
        } catch (error) {
            console.error('Error deleting folder and its files:', error);
        }
    }
}

module.exports = DatabaseStorage;