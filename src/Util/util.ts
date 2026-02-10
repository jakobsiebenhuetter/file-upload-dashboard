import { Response, FolderData, FileData } from '../Dashboard/Dashboard';
import { Toast } from '../Components/Toast';

export function isImage(ext: string): boolean {
    //  || ext === 'webp';
    return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp';
}

export function isFolder(val: unknown): val is FolderData {
    if(typeof val === 'object' &&
        val !== null &&
        'id' in val && 
        'folderName' in val &&
        'path' in val && 
        'files' in val) {
        return true;
    }
    return false;
}

export function getFolders(val: unknown): FolderData[] {
    if(Array.isArray(val) && val.every((item) => isFolder(item))) {
        console.log('Val ist ein Array von FolderData: ', val);
        return val;
    }
    return [];
}
export function getFiles(val: unknown): FileData[]{
    if(isFolder(val)) {
        console.log('Val ist vom Typ FolderData: ', val);
        return val.files;
    }
    return []
}

export function checkResponse(response: Response): boolean {
        if(response.type === 'error') {
            const toast = new Toast({ text: response.message, icon: 'error', backdrop: true });
        } else if (response.type === 'success') {
            const toast = new Toast({ text: response.message, icon: 'success', backdrop: true });
            return true;
        } else {
            const toast = new Toast({ text: response.message, icon: 'info', backdrop: true });
        }
        return false;
    }