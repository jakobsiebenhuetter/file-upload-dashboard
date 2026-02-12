import '../styles.css';

import axios from 'axios';

import { Event } from '../Components/Event';
import { DashBoard, DashBoardData, FileData } from "./Dashboard";
import { KeyManager } from './KeyManager';
import { GlobalEvent } from './events';
import { API } from '../Config';
import { Toast } from '../Components/Toast';

/**
 * @todo Es gibt mit dem lockscreen, bzw. backdrop noch Probleme, overflow ist auf auto gesetzt beim body
 * @todo ein Bug wenn man ein Widget versucht zu droppen
 * @todo Eine Button Klasse erstellen, mit JQuery, für den create Folder Button
 * @todo Uploadstatus anzeigen lassen, dank axios ist das möglich
 * @todo Backdrop Bug fixen und Scrollen verhindern während des droppens
 * @todo Styling verbessern auch bzgl. der responsivity
 */
export class App extends Event {
    constructor() {
        super();
        this.initApp();
    };

    static async getData(): Promise<DashBoardData> {
        try {
            const response = await axios.get(API.GET_DATA);
            return response.data;
        } catch (error) {
            console.warn('Fehler beim Laden der Daten', error);
            return { folders: [] };
        }
    };

    // Hier noch einen Fehler zurückgeben, falls im Server etwas nicht funktioniert hat
    static async getFilteredFiles(folderId: string, char: string): Promise<FileData[]> {
        let files: FileData[] = [];
        try {
            const response = await axios.post(API.GET_FILTER_FILES, {folderId, char});
            files = response.data.files;
        } catch (error) {
            new Toast({ text: 'Fehler beim Filtern der Dateien', icon: 'error', backdrop: true });
            return files;
        }
        return files;
    }

    async initApp(): Promise<void> {

        KeyManager.getInstance();

        const app = document.querySelector('#app');

        GlobalEvent.publish('spinner', { action: 'show'});
        let  folders  = await App.getData();
        const dashBoard = new DashBoard(folders);

        if (app instanceof HTMLElement) {
            app.append(dashBoard.element);
        };

        GlobalEvent.publish('spinner', { action: 'hide'});
    };
};

