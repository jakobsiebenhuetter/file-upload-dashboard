
import '../styles.css';
import { Event } from './Event';
import { Modal } from './Modal';
import { Toast } from './Toast';
import { Tooltip } from './Tooltip';
import { GlobalEvent } from '../Dashboard/events';



export class Sidebar extends Event {
    private focus = null;
    element: HTMLElement = document.createElement('div');
    listElement: HTMLElement = document.createElement('ul');
    protected props: Record<string, any> = {};
    color: string = 'lightgray';
    allIds: number[] = [];
    width: 'w-xs';
    renderDashb: any;

    constructor(props?: Record<string, any>) {
        super();

        const defaults = {
            color: this.color,
            width: this.width,
            
        }

        this.props = {
            ...defaults,
            ...props
        };

        this.renderUI();
    }

    addListeners() {

    };

    renderUI() {

        const createFolderBtn: HTMLElement = document.createElement('div');
        createFolderBtn.classList.add('mb-4', 'hover:cursor-pointer');

        createFolderBtn.setAttribute('id', 'create-folder');
        createFolderBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>`;

        createFolderBtn.onclick = async (e) => {
            
            let modal = new Modal({ default: true, backdropOption: true, height: 'h-auto', rounded: true });

            modal.saveBtnOnClick(async () => {

                if(!modal.getInputValue()) {
                    console.warn('Kein Ordnername eingegeben');
                    return;
                };
                GlobalEvent.publish('spinner', { action: 'show'});
                let info = null;
                let data = null;

                info = await fetch('http://localhost:2000/create-folder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: modal.getInputValue(), id: modal.getInputValue() })
                });

                    data = await info.json();
                

            console.log('Antwort vom Server:', data);

            if (data.info) {
                GlobalEvent.publish('spinner', { action: 'hide'});
                const toast = new Toast({ text: data.info, icon: 'info', color: 'bg-red-500', width: '' });
                return;
            };

            this.props.listItems = data.folders;
            this.renderListElements();
            
            const folders = await Sidebar.getData();
            
            if(folders.length === 0) {
                console.warn('Keine Ordner mehr vorhanden');
                return;
            };
            
            GlobalEvent.publish('renderFiles', folders);
   
            GlobalEvent.publish('spinner', { action: 'hide'});

            });
            
            document.body.append(modal.element);
        };

        this.element.append(createFolderBtn, this.listElement);
        this.element.classList.add('bg-stone-200', 'p-2', this.props.width, 'min-h-screen', 'w-[100px]', 'p-2');
        this.listElement.classList.add('flex', 'flex-col', 'justify-center');

        this.renderListElements();

    };

    renderListElements() {
        this.listElement.innerHTML = '';
 
        this.props.listItems.forEach((item) => {

            const listItemElement: HTMLElement = document.createElement('li');
            listItemElement.classList.add('listElement');
            listItemElement.dataset.id = item.id;
     
            const deleteBtn: HTMLElement = document.createElement('div');
            const span: HTMLElement = document.createElement('span');

            deleteBtn.setAttribute('btn-id', item.id);

            if(item.focus) {
                const observer = new MutationObserver((mutations, observe) => {
                    this.setFocus(item.id);
                    observe.disconnect();
                });

                 observer.observe(this.listElement, { childList: true, subtree: true });
            };

            deleteBtn.classList.add('hover:cursor-pointer');
            deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-[22px] h-[22px]" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>`;
            
            listItemElement.onclick = async (e) => {
                GlobalEvent.publish('spinner', { action: 'show'});
                let id = listItemElement.dataset.id
                this.setFocus(id)

               const { folders } = await Sidebar.getData();
               GlobalEvent.publish('renderFiles', {folders});
            
               GlobalEvent.publish('spinner', { action: 'hide'});
        };

            deleteBtn.onclick = async (e) => {
        
                let confirmModal = new Modal({ default: false, confirmModal: true, backdropOption: true, height: 'h-auto', width:'w-[200px]', rounded: true, text: 'Möchten Sie den Ordner wirklich löschen?' });

                document.body.append(confirmModal.element);

                confirmModal.saveBtnOnClick( async (e) => {
                    confirmModal.element.remove();
                    confirmModal.backdrop.remove();
                    confirmModal = null;
                    GlobalEvent.publish('spinner', {action: 'show'});

                try {
                    const data = await fetch('http://localhost:2000/delete-folder', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: deleteBtn.getAttribute('btn-id') })
                    });
                    
                   
                   
                } catch(error) {
                    console.warn(error);
                };
        
                const { folders } = await Sidebar.getData();
                this.props.listItems = folders;

          setTimeout(() => {
              GlobalEvent.publish('renderFiles', {folders});
            }, 100);
                GlobalEvent.publish('spinner', {action: 'hide'});

                const toast = new Toast({text: 'Ordner gelöscht', icon: 'success', backdrop: true});

                this.renderListElements();
                if(folders.length >= 1) {
                    this.setFocus(folders[folders.length - 1].id);
                } else {
                    console.warn('Keine Ordner mehr vorhanden');
                    return;
                };

            });
               
            };

            span.innerText = item.folderName;
            span.onmouseover = () => {
                Tooltip.getInstance().setText(item.folderName).setTarget(span).show();
            };

            span.onmouseleave = () => {
                Tooltip.getInstance().hide();
            };

            span.classList.add('select-none', 'truncate');

            listItemElement.append(span, deleteBtn)
            listItemElement.classList.add('show-tooltip','flex', 'flex-row', 'justify-between', 'm-2', 'hover:bg-stone-500','p-1', 'rounded');
            this.listElement.append(listItemElement);

        })

    };

    getListItems(): Array<any> {
        return this.props.listItems;
    }

    getFocus(): string | null

    {
        return this.focus;
    };

    setFocus(id: string): void {

        if(!id) {
            console.warn('Keine id vorhanden für den Fokus. id = ', id );
            this.focus = null;
            return;
        };

        this.focus = id;
        const listDOMElements = this.listElement.querySelectorAll('.listElement');

        for(const domlistElement of listDOMElements) {
           
            if(this.focus === domlistElement.getAttribute('data-id')) {
                
                domlistElement.classList.add('text-green-500');
            } else {
                domlistElement.classList.remove('text-green-500')
            }
        }
        console.log('Focus bei ' + this.focus);
    };

    static async getData(): Promise<Record<string, any>> {
        try {
            const response = await fetch('http://localhost:2000/getJson');
            return await response.json();
        } catch (error) {
            console.warn('Fehler beim Laden der Daten', error);
            return { folders: [] };
        }
    }
}