import '../styles.css';

import axios from 'axios';

import { Event } from './Event';
import { Modal } from './Modal';
import { Toast } from './Toast';
import { Tooltip } from './Tooltip';
import { GlobalEvent } from '../Dashboard/events';
import { DashBoard, File, Folder } from '../Dashboard/Dashboard';
import { API } from '../API';
import { Button } from './Button';
import { TSaveFolder } from '../../shared-types/Types';

export class Sidebar extends Event {
    private focus: string | null = null;
    protected props: Record<string, any> = {};
    el: HTMLElement = document.createElement('div');
    listElement: HTMLElement = document.createElement('ul');
    listItems: Folder[] | null = null;

    constructor(props?: Record<string, any>) {
        super();

        const defaults = {
            color: 'lightgray',
            width: 'w-xs',
            listItems: this.listItems     
        }

        this.props = {
            ...defaults,
            ...props
        };

        this.renderUI();
    }

    renderUI(): void {
   
        this.el.classList.add('min-h-screen', 'bg-stone-200', 'p-4', 'pt-6', 'min-w-[270px]', 'dark:bg-gray-800');
        const icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>`
        const createFolderBtn = new Button({ text: 'Ordner erstellen', width: 'w-full', height: 'h-[40px]', shape: 'circle', color: 'bg-blue-300', hoverColor: 'hover:bg-blue-400', icon: icon, activeColor: 'active:bg-blue-500' });
        createFolderBtn.el.setAttribute('id', 'create-folder');

        createFolderBtn.onClick(async (e) => {
            // Hier dürfen nur die Ordner abgefragt werden
            let modal = new Modal({ default: true, backdropOption: true, height: 'h-auto', rounded: true });
            let data = null;

            modal.saveBtnOnClick(async () => {
                const saveFolderData: TSaveFolder = {
                    text: modal.getInputValue()
                };

                if(!modal.getInputValue()) {
                    const toast = new Toast({ text: 'Der Ordnername darf nicht leer sein', icon: 'error', color: 'bg-red-500', width: '' });
                    return;
                }
                
                GlobalEvent.publish('spinner', { action: 'show'});

                let response = await axios.post(API.CREATE_FOLDER, saveFolderData);
                data = response.data;

            if (data.info) {
                GlobalEvent.publish('spinner', { action: 'hide'});
                const toast = new Toast({ text: data.info, icon: 'info', color: 'bg-red-500', width: '' });
            };

            this.props.listItems = data.data.folders;
            this.renderListElements();
            this.setFocus(data.data.folders[data.data.folders.length - 1].id);
            GlobalEvent.publish('folderFocusChanged:renderFiles', this.getFocus());
         
            GlobalEvent.publish('spinner', { action: 'hide'});
        });
        
        document.body.append(modal.el);
    });
    
    this.el.append(createFolderBtn.el, this.listElement);
    
    this.listElement.classList.add('flex', 'flex-col', 'justify-center', 'mt-8', 'hover:cursor-pointer');
    this.renderListElements();

    };

    renderListElements(): void {
        this.listElement.innerHTML = '';
 
        this.props.listItems.forEach((item: any) => {
            const listItemElement: HTMLElement = document.createElement('li');
            listItemElement.classList.add('listElement');
            listItemElement.dataset.id = item.id;
            const deleteBtn = new Button({ shape: 'circle', text: '', width: 'w-[30px]', height: 'h-[30px]', color: 'bg-red-200', hoverColor: 'hover:bg-red-400', activeColor: 'active:bg-red-600' });
            deleteBtn.addTooltip('Ordner löschen');

            const span: HTMLElement = document.createElement('span');

            deleteBtn.el.setAttribute('btn-id', item.id);

            if(item.focus) {
                const observer = new MutationObserver((mutations, observe) => {
                    this.setFocus(item.id);
                    observe.disconnect();
                });

                 observer.observe(this.listElement, { childList: true, subtree: true });
            };

            deleteBtn.el.classList.add('hover:cursor-pointer');
            deleteBtn.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-[22px] h-[22px]" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>`;
            
            listItemElement.onclick = async (e) => {
                let id = listItemElement.dataset.id as string;
                if(!this.setFocus(id)) return;

                GlobalEvent.publish('spinner', { action: 'show'});
                
                if(this.getFocus()) {
                    GlobalEvent.publish('folderFocusChanged:renderFiles', this.getFocus());
                }
                
                GlobalEvent.publish('spinner', { action: 'hide'});
            };

            deleteBtn.el.addEventListener('click', (e) => {
                // e.stopPropagation();
                let target = e.target as HTMLElement;
                const folderId = target.closest('.listElement')?.getAttribute('data-id');
                this.setFocus(folderId);
                
                let confirmModal: Modal | null = new Modal({ default: false, confirmModal: true, backdropOption: true, height: 'h-auto', rounded: true, text: 'Möchten Sie den Ordner wirklich löschen?' });
                document.body.append(confirmModal.el);
    
                confirmModal.saveBtnOnClick( async (e) => {     
                    GlobalEvent.publish('spinner', {action: 'show'});
                    try {
                        // Hier die Daten nach dem löschen wieder holen
                        const data = await axios.post(API.DELETE_FOLDER, { id: deleteBtn.el.getAttribute('btn-id') });  
                    } catch(error) {
                        console.warn(error);
                    };

                    let data: File[] = [];
                    const folders = await DashBoard.getFolders();
                    this.props.listItems = folders;
                    GlobalEvent.publish('spinner', {action: 'hide'});
                    const toast = new Toast({text: 'Ordner gelöscht', icon: 'success', backdrop: true});
                    
                    // Hier werden noch die alten Daten gerendert
                    this.renderListElements();
                    
                    if(folders.length >= 1) {
                        this.setFocus(folders[folders.length - 1].id);
                    } else {
                        console.warn('Keine Ordner mehr vorhanden');
                        this.setFocus(null);
                    };
                    
                    for(const folder of folders) {  
                        if(folder.id === this.getFocus()) {
                            data = folder.files;
                            break;
                        }
                    }
                    // GlobalEvent.publish('renderFiles', data);
                    GlobalEvent.publish('folderFocusChanged:renderFiles', this.getFocus());
                });
            });

            span.innerText = item.folderName;
            span.onmouseover = () => {
                Tooltip.getInstance().setText(item.folderName).setTarget(span).show();
            };

            span.onmouseleave = () => {
                Tooltip.getInstance().hide();
            };

            span.classList.add('select-none', 'truncate');

            listItemElement.append(span, deleteBtn.el);
         
            listItemElement.classList.add('show-tooltip','flex', 'justify-between', 'text-center', 'm-2', 'hover:bg-blue-300', 'active:bg-blue-500','p-2', 'rounded-full');
            this.listElement.append(listItemElement);
        })
    };

    getFocus(): string{
        if(!this.focus) {
            console.warn('Kein Fokus gesetzt');
            return '';
        }
        return this.focus;
    };

    setFocus(id: string): boolean {

        if(!id) {
            console.warn('Keine id vorhanden für den Fokus. id = ', id );
            this.focus = null;
            return false;
        };

        this.focus = id;
        const listDOMElements = this.listElement.querySelectorAll('.listElement');

        for(const domlistElement of listDOMElements) {
           
            if(this.focus === domlistElement.getAttribute('data-id')) {
                
                domlistElement.classList.add('bg-blue-400');
            } else {
                domlistElement.classList.remove('bg-blue-400')
            }
        }
        console.log('Focus bei ' + this.focus);
        return true;
    };
}