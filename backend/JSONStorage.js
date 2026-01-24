const jsonPath = '../data/data.json';
const fs = require('fs');

class JSONStorage {
    constructor() {}

    saveFolder(id) {

    }

    saveFiles(files, folderId) {

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

    deleteFile(id) {

    }

    deleteFolder(id) {

    }
}

module.exports = JSONStorage;