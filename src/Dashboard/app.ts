import '../styles.css';

import { Event } from '../Components/Event';
import { DashBoard } from "./Dashboard";
import { KeyManager } from './KeyManager';
import { lockScreen, unlockScreen } from './globVar';

/**
 * @BUGFIX Pagination funktioniert nicht richtig !!!
 * @BUGFIX Wenn man das letzte Element auf z.B.: Seite 2 löscht dann, wird die Seite nicht richtig aktualisiert mit der Pagination
 * @TODO Datumsformat: TT.MM.JJJJ
 * @TODO Chatfenster erweitern um Slash Commands -> /z.B.: clear
 * @Todo Dummy TN einbauen
 * @Todo SQLLite weiter ausbauen, und danach mit ORM experementieren 
 * @Todo im neuen Branch, die Pagination Klasse erweitern, um mehrere Seiten anzuzeigen, z.B. 1,2,3 anstatt nur 1; json file sollte automatisch erstellt werden wenn nicht vorhanden
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

