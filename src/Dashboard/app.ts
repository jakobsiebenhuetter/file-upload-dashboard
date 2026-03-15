import '../styles.css';

import axios from 'axios';

import { Event } from '../Components/Event';
import { DashBoard, DashBoardData } from "./Dashboard";
import { KeyManager } from './KeyManager';
import { API } from '../API';

/**
 * @todo Upload umbauen
 * @todo Es gibt mit dem lockscreen, bzw. backdrop noch Probleme, overflow ist auf auto gesetzt beim body
 * @todo automatisches herunterladen von videos im Edge Browser verhindern
 * @todo KI integrieren um pdf Dokumente zusammenzufassen.
 * @todo Event member als Objekt verwenden damit man nicht immer die Funktion durchgehen muss, sondern direkt auf die Funktion zugreifen kann, z.B. this.events['openModal']() anstatt this.events.forEach(fn => { if(fn.name === 'openModal') fn() })
 * @todo ein Bug wenn man ein Widget versucht zu droppen
 * @todo Uploadstatus anzeigen lassen, dank axios ist das möglich
 * @todo Styling verbessern auch bzgl. der responsivity
 * 
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

    async initApp(): Promise<void> {
        KeyManager.getInstance();
        const app = document.querySelector('#app');
        let  folders  = await App.getData();
        const dashBoard = new DashBoard(folders);
        if (app instanceof HTMLElement) {
            app.append(dashBoard.el);
        };

    };
};

