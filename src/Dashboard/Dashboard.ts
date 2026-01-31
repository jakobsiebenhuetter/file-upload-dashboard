import '../styles.css';
import axios from 'axios';

import { Widget } from '../Components/Widget';
import { Event } from '../Components/Event';
import { Sidebar } from '../Components/Sidebar';
import { Modal } from '../Components/Modal';
import { GlobalEvent } from './events';
import { DropZone } from '../Components/Dropzone';
import { lockScreen, unlockScreen } from './globVar';
import { Tooltip } from '../Components/Tooltip';

export class DashBoard extends Event {
     element: HTMLElement = document.createElement('div');
     sidebar: Sidebar;
     widgetContainer: HTMLElement = document.createElement('div');
     widgetContainerWrapper: HTMLElement = document.createElement('div');
     dropzone: DropZone;
     items: any;
     listItems: any;
     tooltipWidgets: Tooltip;
     tooltipSidebar: Tooltip;

     constructor(items: Record<string, any>) {
         super();
       
         this.items = items;
         this.listItems = this.items;
         this.renderSidebar();
         this.sidebar.setFocus(this.listItems[0]?.id || null);
         this.renderUI(this.listItems);
         this.addListeners();
 
     };

     addListeners() {
         GlobalEvent.subscribe('renderFiles', (data: Record<string, any>) => {
             const {folders} = data;
             console.log('aus Dashboard!');
             this.renderUI(folders);
             
         });

         GlobalEvent.subscribe('spinner', (data: Record<string, any>) => {
            const { action } = data;
            if (action === 'show') {
                lockScreen();
            } else if (action === 'hide') {
                unlockScreen();
            }
        });


        this.widgetContainerWrapper.addEventListener('dragover', (e) => {
            e.preventDefault(); // wichtig, sonst wird drop blockiert
            console.log('show:element');
            if(this.dropzone) return;
            this.dropzone = new DropZone({ target: this.widgetContainerWrapper, text: 'Hier Dateien fallen lassen', width: 'w-full', height: 'h-full' });
            this.dropzone.show();
        });

        this.widgetContainerWrapper.addEventListener('dragleave', (e) => {
            e.preventDefault(); // wichtig, sonst wird drop blockiert
            if(this.dropzone) {
                this.dropzone.destroy();
                this.dropzone = null;
            }
            console.log('show:element');
        });

        this.widgetContainerWrapper.addEventListener('drop', async (e: DragEvent) => {
            e.preventDefault();
            if(this.dropzone) {
                this.dropzone.destroy();
                this.dropzone = null;
            }

            GlobalEvent.publish('spinner', { action: 'show' });

            const formData = new FormData();
            const items = e.dataTransfer.files;

            let focus = this.getSidebar().getFocus();
            console.log(focus)
            formData.append('focus', focus);

            for(const item of items) {
                formData.append('file', item);
            };
            
            const response = await axios.post('http://localhost:2000/upload', formData);
    
            GlobalEvent.publish('renderFiles', {folders: response.data.data.folders });
           
            GlobalEvent.publish('spinner', { action: 'hide' });
        });
    };

    getSidebar(): Sidebar {
        return this.sidebar;
    }

    renderSidebar() {

        this.sidebar = new Sidebar({ listItems: this.listItems, width: 'min-w-[220px]' });
        this.element.append(this.sidebar.element);

    }

    async renderUI(listItems: Array<any> = []) {
        
        let folderItems = null;

        this.listItems = listItems;
        // Hier einen Button für das Hochladen von Dokumenten einfügen bzw. auch eine Info für das droppen mehrerer Elemente; der Focus bleibt oder er wird auf den neu erstellten Ordner gesetzt; angezeigt wird das durch den hover effekt im jeweiligen Folder an der Sidebar
        this.element.classList.add('flex');

        this.widgetContainerWrapper.append(this.widgetContainer);
        this.widgetContainerWrapper.classList.add('w-full', 'bg-stone-200', 'p-4');
        this.widgetContainer.classList.add('min-h-screen', 'rounded', 'p-[10px]', 'bg-blue-200');
        this.widgetContainer.style.display = 'grid';
        this.widgetContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(210px, 1fr))';
        this.widgetContainer.style.gridAutoRows = '300px'
        this.widgetContainer.style.borderRadius = '12px';

           console.log(this.listItems);
           this.widgetContainer.innerHTML = ``;
           for(const folder of this.listItems) {
               if(folder.id === this.getSidebar().getFocus()) { 
                   this.createWidgets(folder);
                     folderItems = folder;
                   break;
                };
            };
            this.element.append(this.widgetContainerWrapper);
    };

    createWidgets(folder: any = null) {

        if(!folder.files.length) {
            console.warn('Keine Files vorhanden');
            return;
        };

        for (const file of folder?.files || []) {
            let height = 'h-[800px]';
            let width = 'w-[1000px]';
            const widget = new Widget({ text: file.title, date: file.date, width: 'w-[200px]', height: 230, imgPath: file.thumbnailPath });
            widget.element.setAttribute('data-id', file.id);
            // Hier Tooltip einfügen

            widget.onClick(() => {
                // Hier unterscheiden ob Bilddatei oder PDF Datei oder andere Datei
                let modal: Modal = null;
                let modalContent: HTMLIFrameElement | HTMLImageElement = null;;
                let modalContentWidth = 'auto';
                let modalContentHeight = 'auto';
                if(file.path.endsWith('png') || file.path.endsWith('jpg') || file.path.endsWith('jpeg') || file.path.endsWith('gif')) {
                    modal = new Modal({ backdropOption: true, height: '', width: '', rounded: true});
                    modalContent = document.createElement('img');
                 
                } else {
                    modal = new Modal({ backdropOption: true, height: height, width: width, rounded: true});
                    modalContent = document.createElement('iframe');
                    modalContentHeight = '95%';
                }

                modal.element.append(modalContent);
                document.body.append(modal.element);
                modalContent.src = file.path; // PDF oder URL setzen
                modalContent.style.width = modalContentWidth;
                modalContent.style.height = modalContentHeight;
        
                modalContent.style.border = 'none';
                modalContent.style.margin = '4px';
                modalContent.style.border = '';
                
                modalContent.style.background = '#fff';

                modal.element.style.display = 'flex';
                modal.element.style.flexDirection = 'column';
                modal.element.style.overflow = 'hidden';
                modal.element.style.justifyContent = 'end';
            });

            widget.getDeleteBtn().onclick = async (e) => {
                e.stopPropagation();
                GlobalEvent.publish('spinner', { action: 'show' });
                const folderId = this.getSidebar().getFocus();
                console.log(folderId);
                
                try {
                    // Hier dann löschen der Datei aus dem Ordner und auch aus dem Dateisystem !!!!!!
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