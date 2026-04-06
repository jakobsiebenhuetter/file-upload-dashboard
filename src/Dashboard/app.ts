import '../styles.css';

import { Event } from '../Components/Event';
import { DashBoard } from "./Dashboard";
import { KeyManager } from './KeyManager';
import { lockScreen, unlockScreen } from './globVar';

/**
 * @BUGFIX Bilder öffnen funktioniert nicht
 * @todo Styling verbessern
 * @todo KI integrieren um pdf Dokumente zusammenzufassen.
 * @todo Event member als Objekt verwenden damit man nicht immer die Funktion durchgehen muss, sondern direkt auf die Funktion zugreifen kann, z.B. this.events['openModal']() anstatt this.events.forEach(fn => { if(fn.name === 'openModal') fn() })
 * @todo Uploadstatus anzeigen lassen, dank axios ist das möglich
 */
export class App extends Event {
    constructor() {
        super();
        lockScreen();
        this.initApp();
        setTimeout(() => {
            unlockScreen();
        }, 1000);
    };

    async initApp(): Promise<void> {
        KeyManager.getInstance();
        const app = document.querySelector('#app');
        const dashBoard = new DashBoard();
        if (app instanceof HTMLElement) {
            app.append(dashBoard.el);
        };
    };
};

