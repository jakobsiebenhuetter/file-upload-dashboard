
import {DatabaseStorage} from './DatabaseStorage.js';
import {JSONStorage} from './JSONStorage.js';


export class StorageInterface {
    storageType: string;
    storage: JSONStorage; // DatabaseStorage | JSONStorage;

    constructor(storageType = 'db') {
        this.storageType = storageType;
        this.storage = this.getStorage();
    }
    getStorage() {
        return new JSONStorage();
        // if (this.storageType === 'db') {
        //     // return new DatabaseStorage();
        //     return new Error('DatabaseStorage is currently not supported');
        // } else {
        // }
    }

    getData() {
        return this.storage.getData();
    }

    saveFolder(folderObj) {
        return this.storage.saveFolder(folderObj);
    }

    async saveFiles(files, folderId: string, date: string) {
        return await this.storage.saveFiles(files, folderId, date);
    }
    
    deleteFile(folderId: string, fileId: string) {
        return this.storage.deleteFile(folderId, fileId);
    }

    deleteFolder(id: string) {
        this.storage.deleteFolder(id);
    }

    getFolders() {
        return this.storage.getFolders();
    }

    getFiles(folderId: string, page = 1) {
        return this.storage.getFiles(folderId, page);
    }

    getFilteredFiles(folderId: string, char, page = 1) {
        return this.storage.getFilteredFiles(folderId, char, page);
    }

    getFile(folderId: string, fileId: string) {
        return this.storage.getFile(folderId, fileId);
    }
}