import { test, expect } from '@jest/globals';
import { Folder } from '../../Dashboard/Dashboard';
import { isFolder} from '../Util';

test('soll überprüfen, ob es sich um einen Folder handelt', () => {
    const folderData: Folder = {
        id: '0046b472-0bff-48fc-b4d5-706c319d40ab',
        folderName: 'Beispiel-Ordner',
        path: '/data/Folders/0046b472-0bff-48fc-b4d5-706c319d40ab',
        files: []
    };
    expect(isFolder(folderData)).toBe(true);
})

test('soll überprüfen, ob es sich nicht um einen Folder handelt', () => {
    const folderData = {
        id: '0046b472-0bff-48fc-b4d5-706c319d40ab',
        folderName: 'Beispiel-Ordner',
        path: '/data/Folders/0046b472-0bff-48fc-b4d5-706c319d40ab',
    };
    expect(isFolder(folderData)).toBe(false);
}) 