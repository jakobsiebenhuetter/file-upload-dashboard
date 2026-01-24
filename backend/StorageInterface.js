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

    saveFolder(folder) {
        this.storage.saveFolder(folder);
    }

    saveFiles(files, folderId) {
        this.storage.saveFiles(files, folderId);
    }

    getFolders() {
        return this.storage.getFolders();
    }

    getFiles() {
        return this.storage.getFiles();
    }
    
    deleteFile(id) {

    }

    deleteFolder(id) {

    }
}


module.exports = StorageInterface;