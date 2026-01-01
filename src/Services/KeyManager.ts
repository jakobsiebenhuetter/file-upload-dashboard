import { Modal } from '../Components/Modal';

export class KeyManager {
    private static instance: KeyManager;
    private handlers: Array<{ element: Modal, Enter: () => void , Escape: () => void }> = [];

    private constructor() {
        document.addEventListener('keydown', this.handleKeydown);
    }

    static getInstance(): KeyManager {
        if(!KeyManager.instance) {
            KeyManager.instance = new KeyManager();
            return KeyManager.instance;
        }

        return KeyManager.instance;
    }

    addModal(elementHandler:{ element: Modal, Enter: () => void, Escape: () => void }): void {
        // Hier überpüfen ob die Instanz schon existiert
        
        this.handlers.push(elementHandler)
    }

    removeModal(): void {
        this.handlers.pop();
    }


    private handleKeydown = (event: KeyboardEvent) => {
        // event.preventDefault(); // Verhindert das Standardverhalten der Taste und man kann ins inputfeld nichts eingeben   
        if(this.handlers[this.handlers.length -1]?.[event.key]){
            const topModal = this.handlers.pop();
            topModal[event.key]();  
        }
    };
}