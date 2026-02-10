import '../styles.css';

import axios from 'axios';

import { Event } from '../Components/Event';
import { DashBoard, DashBoardData } from "./Dashboard";
import { Header } from '../Components/Header';
import { KeyManager } from '../Services/KeyManager';
import { GlobalEvent } from './events';

/**
 * @todo Uploadstatus anzeigen lassen, dank axios ist das möglich
 * @todo Backdrop Bug fixen und Scrollen verhindern während des droppens
 * @todo Styling verbessern auch bzgl. der responsivity
 */
export class App extends Event {
    private filteredFiles: Array<any> = [];
    constructor() {
        super();
        this.initApp();
    };

    static async getData(): Promise<DashBoardData> {
        try {
            const response = await axios.get('http://localhost:2000/getJson');
            return response.data;
        } catch (error) {
            console.warn('Fehler beim Laden der Daten', error);
            return { folders: [] };
        }
    };

    async initApp(): Promise<void> {

        KeyManager.getInstance();

        const app = document.querySelector('#app');

        GlobalEvent.publish('spinner', { action: 'show'});
        let  folders  = await App.getData();
        const dashBoard = new DashBoard(folders);
        const header = new Header();

        header.getFilter.onFilter(async (params) => {
            this.filteredFiles = [];
            GlobalEvent.publish('spinner', { action: 'show'});

            const folderId = dashBoard.getSidebar().getFocus();
            let { folders } = await App.getData();
            for(const folder of folders) {
                if(folder.id === folderId) {
                    for(const file of folder.files) {
                        
                        if(params?.inputValue) {

                            if(file.title.includes(params.inputValue)) {
                                this.filteredFiles.push(file);
                                folder.files = this.filteredFiles; 
                            };
                        };
                    };
                };
            };

            GlobalEvent.publish('renderFiles', { folders: folders });
            GlobalEvent.publish('spinner', { action: 'hide'});
        });

        if (app instanceof HTMLElement) {
            app.append(header.element, dashBoard.element);
        };

        GlobalEvent.publish('spinner', { action: 'hide'});
    };
};

