import '../styles.css';

import { Event } from '../Components/Event';
import { DashBoard } from "./Dashboard";
import { KeyManager } from './KeyManager';
import { lockScreen, unlockScreen } from './globVar';

/**
 * @TODO Sidebartext zentrieren
 * @TODO Alle PRs mergen, danach Frontend in einen eigenen Ordner migrieren, am besten einen Neune Branch dafür erstellen
 * @TODO Dann einen Neune Branch für die komplette Integration mit sqlite3 durchführen und dann mit einem ORM arbeiten
 * @TODO Event Klasse erweitern um mehrere Funktionen zu einem Event zu speichern
 * @todo Event member als Objekt verwenden damit man nicht immer die Funktion durchgehen muss, sondern direkt auf die Funktion zugreifen kann, z.B. this.events['openModal']() anstatt this.events.forEach(fn => { if(fn.name === 'openModal') fn() })
 * @todo Uploadstatus anzeigen lassen, dank axios ist das möglich
 */
export class App extends Event {
    constructor() {
        super();
        lockScreen(
            {
                backdropOption: 
                {
                    default: 'bg-slate-400',
                    darkMode: 'dark:bg-slate-700',    
                },
                icon: true,
            }
        );
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

