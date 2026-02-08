import '../styles.css';
import axios from 'axios';

import { Widget } from '../Components/Widget';
import { Event } from '../Components/Event';
import { Sidebar } from '../Components/Sidebar';
import { Modal } from '../Components/Modal';
import { GlobalEvent } from './events';
import { DropZone } from '../Components/Dropzone';
import { lockScreen, unlockScreen } from './globVar';
import { isImage } from '../Util/util';

export type DashBoardData = {
    folders: FolderData[];
}

export type FolderData = {
    id: string;
    folderName: string;
    path: string;
    files: FileData[];
}

export type FileData = {
    id: string;
    title: string;
    date: string;
    path: string;
    thumbnailPath: string;
}



export class DashBoard extends Event {
     element: HTMLElement = document.createElement('div');
     sidebar: Sidebar;
     widgetContainer: HTMLElement = document.createElement('div');
     widgetContainerWrapper: HTMLElement = document.createElement('div');
     dropzone: DropZone | null = null;
     files: FileData[];

     constructor(items: DashBoardData) {
         super();
         this.files = items.folders[0]?.files || [];
         const folders: FolderData[] = items.folders || [];
         this.sidebar = new Sidebar({ listItems: folders, width: 'min-w-[220px]' });
         this.renderSidebar();   
         this.renderGrid(this.files);
         this.addListeners();
        };

     addListeners(): void {
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
            const items = e.dataTransfer.files;


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

    renderSidebar(): void {   
        this.element.append(this.sidebar.element);
        this.sidebar.setFocus(this.files[0]?.id || null);    
    }

    renderGrid(files: FileData[]): void{
        this.widgetContainer.innerHTML = ``;
        this.element.classList.add('flex');

        this.widgetContainerWrapper.append(this.widgetContainer);
        this.widgetContainerWrapper.classList.add('w-full', 'bg-stone-200', 'p-4');
        this.widgetContainer.classList.add('min-h-screen', 'rounded', 'p-[10px]', 'bg-blue-200', 'grid', 'grid-cols-[repeat(auto-fill,minmax(210px,1fr))]', 'auto-rows-[300px]', 'rounded-[12px]');    
        this.element.append(this.widgetContainerWrapper);
        this.createWidgets(files);
    };

    createWidgets(files: FileData[]): void {

        for (const file of files) {
            let height = 'h-[800px]';
            let width = 'w-[1000px]';
            const widget = new Widget({ text: file.title, date: file.date, width: 'w-[200px]', height: 230, imgPath: file.thumbnailPath });
            widget.element.setAttribute('data-id', file.id);

            widget.onClick(() => {
                // Hier unterscheiden ob Bilddatei oder PDF Datei oder andere Datei
                let modal: Modal = null;
                let modalContent: HTMLIFrameElement | HTMLImageElement = null;;
                let modalContentWidth = 'auto';
                let modalContentHeight = 'auto';
                let ext = file.path.split('.').pop();

                if(isImage(ext)) {
                    modal = new Modal({ backdropOption: true, height: '', width: '', rounded: true});
                    modalContent = document.createElement('img');
                 
                } else {
                    modal = new Modal({ backdropOption: true, height: height, width: width, rounded: true});
                    modalContent = document.createElement('iframe');
                    modalContentHeight = '95%';
                }

                modal.element.classList.add('flex', 'flex-col', 'overflow-hidden', 'justify-end');
                modal.element.append(modalContent);
                modalContent.classList.add('m-1', 'border-none', 'bg-white', `w-[${modalContentWidth}]`, `h-[${modalContentHeight}]`);
                document.body.append(modal.element);
                modalContent.src = file.path; // PDF oder URL setzen 
            });

            widget.getDeleteBtn().onclick = async (e) => {
                e.stopPropagation();
                GlobalEvent.publish('spinner', { action: 'show' });
                const folderId = this.getSidebar().getFocus();
                console.log(folderId);
                
                try { 
                    // Hier die Daten nach dem löschen wieder holen und im backend checken, ob erfolgreich oder nicht mit
                    // mit Discriminated Unions arbeiten
                    await axios.post('delete-file', { fileId: widget.element.getAttribute('data-id'), folderId: folderId })
                    console.log('Datei gelöscht');
                    widget.element.remove();
                    
                    GlobalEvent.publish('spinner', { action: 'hide' });

                } catch (error) {
                    console.error('Fehler beim Löschen der Datei:', error);
                };
            };
            this.widgetContainer.append(widget.element);
        }
    };
}