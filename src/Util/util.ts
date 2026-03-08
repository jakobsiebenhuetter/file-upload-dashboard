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

export function checkResponse<T extends Response>(response: T, triggerToast?: boolean): boolean {
    let flag = false;
    if (response.type === 'success' || response.type === 'info') {     
        flag = true;
    }

    if(triggerToast) {
        const toast = new Toast({ text: response.message, icon: response.type, backdrop: true });
    }
    return flag;
}