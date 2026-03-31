import '../styles.css';

import { Event } from '../Components/Event';
import { DashBoard } from "./Dashboard";
import { KeyManager } from './KeyManager';
import { lockScreen, unlockScreen } from './globVar';

/**
 * @BUGFIXES Response muss Toast triggern und beim löschen eines Widgets auch Pagination und Dashboard updaten
 * @BUGFIXES Es müssen jetzt mal klare Typen für die API Schnittstellen definiert werden, für den Anfang
 * @BUGFIXES Wenn es gar keine files gibt, muss hierbei die Pagination auch gleich upgedated werden. Bei filtered-files muss, auch die Pagination upgedated werden. Upload der Pagination verbessern
 * @todo Modal noch positionieren
 * @todo Upload umbauen, und beim upload die Daten neu holen, damit die Pagination auch direkt upgedated wird
 * @todo automatisches herunterladen von videos im Edge Browser verhindern
 * @todo KI integrieren um pdf Dokumente zusammenzufassen.
 * @todo Event member als Objekt verwenden damit man nicht immer die Funktion durchgehen muss, sondern direkt auf die Funktion zugreifen kann, z.B. this.events['openModal']() anstatt this.events.forEach(fn => { if(fn.name === 'openModal') fn() })
 * @todo Uploadstatus anzeigen lassen, dank axios ist das möglich
 * @todo Styling verbessern auch bzgl. der responsivity
 * 
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

