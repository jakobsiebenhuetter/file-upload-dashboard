
const DatabaseStorage = require('./DatabaseStorage');
const JSONStorage = require('./JSONStorage');

class StorageInterface {
    storageType = null;
    constructor(storageType = 'db') {
        this.storageType = storageType;
        this.storage = this.getStorage();
    }
    getStorage() {
        if (this.storageType === 'db') {
            return new DatabaseStorage();
        } else {
            return new JSONStorage();
        }
    }

    getData() {
        return this.storage.getData();
    }

    saveFolder(folderObj) {
        return this.storage.saveFolder(folderObj);
    }

    async saveFiles(files, folderId, date) {
        return await this.storage.saveFiles(files, folderId, date);
    }
    
    deleteFile(folderId, fileId) {
        return this.storage.deleteFile(folderId, fileId);
    }

    deleteFolder(id) {
        this.storage.deleteFolder(id);
    }

    getFolders() {
        return this.storage.getFolders();
    }

    getFiles(folderId, page = 1) {
        return this.storage.getFiles(folderId, page);
    }

    getFilteredFiles(folderId, char, page = 1) {
        return this.storage.getFilteredFiles(folderId, char, page);
    }

    getFile(folderId, fileId) {
        return this.storage.getFile(folderId, fileId);
    }
}


module.exports = StorageInterface;