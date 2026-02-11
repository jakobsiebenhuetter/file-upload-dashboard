import '../styles.css';
import axios from 'axios';

import { Widget } from '../Components/Widget';
import { Event } from '../Components/Event';
import { Sidebar } from '../Components/Sidebar';
import { Modal } from '../Components/Modal';
import { GlobalEvent } from './events';
import { DropZone } from '../Components/Dropzone';
import { lockScreen, unlockScreen } from './globVar';
import { isImage, checkResponse, getFolders, getFiles } from '../Util/Util';

export type DashBoardData = {
    folders: FolderData[];
}

export type FolderData = {
    id: string;
    folderName: string;
    path: string;
    files: FileData[];
    focus?: boolean;
}

export type FileData = {
    id: string;
    title: string;
    date: string;
    path: string;
    thumbnailPath: string;
}

type APIResponse = {
    message: string;
    data: FolderData[] | FileData[];
    type: 'success';
}

type ErrorResponse = {
    message: string;
    type: 'error';
}

type DefaultResponse = {
    message: string;
    type: 'default';
}

export type Response =  APIResponse | DefaultResponse | ErrorResponse;

// type Info = {
//     type: 'success' | 'error' | 'default';
//     message: string;
// }

export class DashBoard extends Event {
     element: HTMLElement = document.createElement('div');
     widgetContainer: HTMLElement = document.createElement('div');
     widgetContainerWrapper: HTMLElement = document.createElement('div');
     sidebar: Sidebar;
     dropzone: DropZone | null = null;
     files: FileData[];

     constructor(items: DashBoardData) {
         super();
         this.files = getFiles(items.folders[0]);
         const folders = getFolders(items.folders);
         this.sidebar = new Sidebar({ listItems: folders, width: 'min-w-[220px]' });
         this.renderSidebar(folders);   
         this.renderGrid(this.files);
         this.addListeners();
        };

     private addListeners(): void {
         GlobalEvent.subscribe('renderFiles', (files: FileData[]) => {
            this.files = files;
            this.renderGrid(this.files);
        });

         GlobalEvent.subscribe('spinner', (data: Record<string, any>) => {
            const { action } = data;
            if (action === 'show') {
                lockScreen();
            } else if (action === 'hide') {
                unlockScreen();
            }
        });


        this.widgetContainerWrapper.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
            let focus = this.getSidebar().getFocus();
            if(!focus) {
                console.warn('Focus ist nicht gesetzt');
                return;
            }
            const containsData = e.dataTransfer.types.includes('Files');
            if(!containsData) return;
            if(this.dropzone) return;

            this.dropzone = new DropZone({ target: this.widgetContainerWrapper, text: 'Hier Dateien fallen lassen', width: 'w-full', height: 'h-full' });
            this.dropzone.show();
        });

        this.widgetContainerWrapper.addEventListener('dragleave', (e: DragEvent) => {
            e.preventDefault();
            let focus = this.getSidebar().getFocus();
            if(!focus) {
                console.warn('Focus ist nicht gesetzt');
                return;
            }
            this.dropzone.destroy();
            this.dropzone = null;
        });

        this.widgetContainerWrapper.addEventListener('drop', async (e: DragEvent) => {    
            e.preventDefault();
            let response = null;

            let focus = this.getSidebar().getFocus();
            if(!focus) {
                console.warn('Focus ist nicht gesetzt');
                return;
            }
          
            if(this.dropzone) {
                this.dropzone.destroy();
                this.dropzone = null;
            }

            GlobalEvent.publish('spinner', { action: 'show' });

            const formData = new FormData();
            const items = e.dataTransfer?.files || [];


            formData.append('focus', focus);
            for(const item of items) {
                formData.append('file', item);
            };

            try {
                response = await axios.post('http://localhost:2000/upload', formData);
            } catch (error) {
                console.warn('Fehler beim Hochladen der Datei', error);
            }

            const folders = response.data.data.folders;
            for(const folder of folders) {
                if(folder.id = this.getSidebar().getFocus()) {
                    GlobalEvent.publish('renderFiles', folder.files);
                }
            }
           
            GlobalEvent.publish('spinner', { action: 'hide' });
        });
    };

    getSidebar(): Sidebar {
        return this.sidebar;
    }

    private renderSidebar(folders: FolderData[]): void {   
        this.element.append(this.getSidebar().element);
        if(folders.length !== 0) {
            if(!this.getSidebar().setFocus(folders[0].id)) {
                console.warn('Kein Fokus für die Sidebar gesetzt');
            }
        }
    }

    private renderGrid(files: FileData[]): void {
        this.widgetContainer.innerHTML = ``;
        this.element.classList.add('flex');
        this.widgetContainerWrapper.append(this.widgetContainer);
        this.widgetContainerWrapper.classList.add('w-full', 'bg-stone-200', 'p-4');
        this.widgetContainer.classList.add('min-h-screen', 'rounded', 'p-[10px]', 'bg-blue-200', 'grid', 'grid-cols-[repeat(auto-fill,minmax(210px,1fr))]', 'auto-rows-[300px]', 'rounded-[12px]');    
        this.element.append(this.widgetContainerWrapper);
        this.createWidgets(files);
    };

    private createWidgets(files: FileData[]): void {

        for (const file of files) {

            const widget = new Widget({ text: file.title, date: file.date, width: 'w-[200px]', height: 230, imgPath: file.thumbnailPath });
            widget.element.setAttribute('data-id', file.id);

            widget.onClick(() => {
                // Hier unterscheiden ob Bilddatei oder PDF Datei oder andere Datei
                let modal: Modal = null;
                let modalContent: HTMLIFrameElement | HTMLImageElement = null;;
                let modalContentHeight = 'h-[auto]';
                let ext = file.path.split('.').pop();

                if(isImage(ext)) {
                    modal = new Modal({ backdropOption: true, width: '',height:'h-[750px]' , rounded: true});
                    modalContent = document.createElement('img');
                 
                } else {
                    modal = new Modal({ backdropOption: true, width:'w-[1000px]', height: 'h-[800px]' ,rounded: true});
                    modalContent = document.createElement('iframe');
                    modalContentHeight = 'h-full';
                }

                modal.element.classList.add('flex','flex-col','overflow-hidden','justify-end');
                modalContent.classList.add('m-1', 'border-none', 'bg-white', `w-[auto]`, `${modalContentHeight}`);
                modalContent.src = file.path; // PDF oder URL setzen 
                modal.element.append(modalContent);
                document.body.append(modal.element);
            });

            widget.getDeleteBtn().onclick = async (e) => {
                e.stopPropagation();
                const folderId = this.getSidebar().getFocus();
                const fileId = widget.element.getAttribute('data-id');
                GlobalEvent.publish('spinner', { action: 'show' });
                
                try { 
                    const response = await axios.post('http://localhost:2000/delete-file', { fileId: fileId, folderId: folderId })
                    const msg: Response = response.data;

                    if(checkResponse(msg)) {
                        if(msg.type === 'success') { // eigentlich unnötiger doppelCheck aber TS meckert sonst
                            GlobalEvent.publish('renderFiles', msg.data);
                        }
                    }          
                    GlobalEvent.publish('spinner', { action: 'hide' });

                } catch (error) {
                    console.error('Fehler beim Löschen der Datei:', error);
                };
            };


            this.widgetContainer.append(widget.element);
        }
    };
}