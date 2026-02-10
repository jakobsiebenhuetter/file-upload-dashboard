import { test, expect } from '@jest/globals';
import { FolderData } from '../../Dashboard/Dashboard';
import { isFolder} from '../Util';



test('soll überprüfen, ob es sich um einen Folder handelt', () => {
    const folderData: FolderData = {
        id: '0046b472-0bff-48fc-b4d5-706c319d40ab',
        folderName: 'Beispiel-Ordner',
        path: '/data/Folders/0046b472-0bff-48fc-b4d5-706c319d40ab',
        files: []
    };
    expect(isFolder(folderData)).toBe(true);
    expect(isFolder({})).toBe(false);
})

test('soll überprüfen, ob Folders zurückgegeben werden', () => {
    const folderData: FolderData = {
        id: '0046b472-0bff-48fc-b4d5-706c319d40ab',
        folderName: 'Beispiel-Ordner',
        path: '/data/Folders/0046b472-0bff-48fc-b4d5-706c319d40ab',
        files: []
    };
    expect(isFolder(folderData)).toBe(true);
}) 

test('soll überprüfen, ob ein falscher Parameter übergeben wurde', () => {
    const folderData = {
        id: '0046b472-0bff-48fc-b4d5-706c319d40ab',
        folderName: 'Beispiel-Ordner',
        path: '/data/Folders/0046b472-0bff-48fc-b4d5-706c319d40ab',
    };
    expect(isFolder(folderData)).toBe(false);
}) 