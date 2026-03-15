import '../styles.css';
import axios from 'axios';

import { Header } from '../Components/Header';
import { Widget } from '../Components/Widget';
import { Event } from '../Components/Event';
import { Sidebar } from '../Components/Sidebar';
import { Modal } from '../Components/Modal';
import { GlobalEvent } from './events';
import { DropZone } from '../Components/Dropzone';
import { lockScreen, unlockScreen } from './globVar';
import { isImage, checkResponse } from '../Util/Util';
import { API } from '../API';
import { Toast } from '../Components/Toast';
import { PaginationEventData } from '../Components/Pagination';

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

export type FilesData = {
    currentPage: number;
    maxPages: number;
    files: FileData[];
    hasNextPage: boolean,
    hasPreviousPage: boolean
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
    data: FolderData[] | FileData[] | FilesData;
    type: 'success';
}

type ErrorResponse = {
    message: string;
    type: 'error';
}

type DefaultResponse = {
    message: string;
    type: 'info';
}

export type Response =  APIResponse | DefaultResponse | ErrorResponse;

// type Info = {
//     type: 'success' | 'error' | 'default';
//     message: string;
// }

export class DashBoard extends Event {
     el: HTMLElement = document.createElement('div');
     header: Header;
     widgetContainer: HTMLElement = document.createElement('div');
     widgetContainerWrapper: HTMLElement = document.createElement('div');
     sidebar: Sidebar;
     dropzone: DropZone | null = null;
     files: FileData[];

     constructor(items: DashBoardData) {
         super();
         this.header = new Header();
         this.getFolders().then((folders) => {
            this.renderSidebar(folders);   
            this.getFilesData(this.sidebar.getFocus()).then((data) => {
                const files = data.files;
                this.header.getPagination.setPaginationData(1, data.maxPages, data.hasNextPage, false);
                this.files = files;
                this.renderHeroPage(this.files);
            });
            this.addListeners();
        });        
    
    };

     private addListeners(): void {
        GlobalEvent.subscribe('folderFocusChanged:renderFiles', (folderId) => {
            this.getFilesData(folderId).then((data) => {
                if(data.files) {
                    this.files = data.files;
                    // this.setPaginationData(data.currentPage, data.totalPages, data.hasNextPage, data.hasPreviousPage);
                    this.renderGrid(this.files);
                }
            });
        });

        GlobalEvent.subscribe('change:page', (paginationData: PaginationEventData) => {
            const { nextPage } = paginationData;
            this.getFilesData(this.sidebar.getFocus(), nextPage).then((paginationData) => {
                this.files = paginationData.files;  
                this.header.getPagination.updatePagination(paginationData.currentPage, this.files.length, paginationData.hasNextPage, paginationData.hasPreviousPage);
                this.renderGrid(this.files);
            })
        });

        this.header.getPagination.onPageChange(async (params) => {
            GlobalEvent.publish('change:page', params);
        });

        // upload:renderFiles ???
        // Es gibt eine strukturelle diskrepanz, beim filtern und ohne filtern rendering
         GlobalEvent.subscribe('renderFiles', (data: FilesData) => {
            console.log('Daten im Dashboard erhalten: ', data);
            if(data.files){
                this.files = data.files;
                this.header.getPagination.updatePagination(data.currentPage, this.files.length, data.hasNextPage, data.hasPreviousPage);
                this.renderGrid(this.files);
            } else {
                console.warn('Keine Dateien zum Rendern übergeben');
                console.warn('Daten:', data);
            }
        });

        GlobalEvent.subscribe('filter:renderFiles', (data: FileData[]) => {
            if(data.length > 0) {
                this.files = data;
                this.renderGrid(this.files);
                // Hier Pagination noch anpassen, jetzt erstmal komplett disablen
                this.header.getPagination.updatePagination(1, 1, false, false);
            } else {
                console.warn('Keine Dateien zum Rendern übergeben');
                console.warn('Daten:', data);
            }
        });

         GlobalEvent.subscribe('spinner', (data: Record<string, any>) => {
            const { action } = data;
            if (action === 'show') {
                lockScreen();
            } else if (action === 'hide') {
                unlockScreen();
            }
        });

          this.header.getFilter.onFilter(async (params) => {     
            GlobalEvent.publish('spinner', { action: 'show'});
            const folderId = this.getSidebar().getFocus();
            const filteredFiles = await this.getFilteredFiles(folderId, params.inputValue);
            GlobalEvent.publish('filter:renderFiles', filteredFiles);
            GlobalEvent.publish('spinner', { action: 'hide'});
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
                response = await axios.post(API.UPLOAD_FILES, formData);
            } catch (error) {
                console.warn('Fehler beim Hochladen der Datei', error);
            }

            const folders = response.data.data.folders;
            for(const folder of folders) {
                if(folder.id === this.getSidebar().getFocus()) {
                    // Hier umbauen
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
        this.sidebar = new Sidebar({ listItems: folders, width: 'min-w-[220px]' });
        this.el.append(this.sidebar.el);

        if(folders.length > 0) {
            if(this.sidebar.setFocus(folders[0].id)) {
                console.warn('Kein Fokus für die Sidebar gesetzt');
            }
        }
    }
    
    private renderHeroPage(files: FileData[]): void {
        const heroPage = document.createElement('div');
        heroPage.classList.add('bg-stone-100', 'w-full');
        heroPage.append(this.header.el, this.widgetContainerWrapper);
        this.el.append(heroPage);
        this.renderGrid(files);
     };

    private renderGrid(files: FileData[]): void {
        this.widgetContainer.innerHTML = ``;
        this.el.classList.add('flex', 'min-h-screen');
        this.widgetContainerWrapper.append(this.widgetContainer);
        this.widgetContainerWrapper.classList.add('w-full', 'bg-stone-200', 'p-4');
        this.widgetContainer.classList.add('min-h-screen', 'rounded', 'p-[10px]', 'bg-blue-200', 'grid', 'grid-cols-[repeat(auto-fill,minmax(210px,1fr))]', 'auto-rows-[300px]', 'rounded-[12px]');    
  
        this.createWidgets(files);
    };

    private createWidgets(files: FileData[]): void {

        for (const file of files) {

            const widget = new Widget({ text: file.title, date: file.date, width: 'w-[200px]', height: 230, imgPath: file.thumbnailPath });
            widget.el.setAttribute('data-id', file.id);

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
                    // modalContent.setAttribute('sandbox', 'allow-same-origin allow-forms allow-popups allow-scripts');
                    // modalContent.setAttribute('allow', 'autoplay; fullscreen');
                    // modalContent.setAttribute('controls', 'true');
                    // modalContent.setAttribute('controlsList', 'nodownload');
                    modalContentHeight = 'h-full';
                }

                modal.el.classList.add('flex','flex-col','overflow-hidden','justify-end');
                modalContent.classList.add('m-1', 'border-none', 'bg-white', `w-[auto]`, `${modalContentHeight}`);
                modalContent.src = file.path; // PDF oder URL setzen 
                modal.el.append(modalContent);
                document.body.append(modal.el);
            });

            widget.getDeleteBtn().onClick(async (e) => {
                
                const folderId = this.getSidebar().getFocus();
                const fileId = widget.el.getAttribute('data-id');
                GlobalEvent.publish('spinner', { action: 'show' });
                
                try { 
                    const response = await axios.post(API.DELETE_FILE, { fileId: fileId, folderId: folderId })
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
            });
            this.widgetContainer.append(widget.el);
        }
    };

    public async getFilesData(folderId: string, page: number = 1): Promise<FilesData> {
        let data: FilesData;
       
        try {
            const response = await axios.post(API.GET_FILES, {folderId, page});
            // oder hier einen weiteren Paramter für Trigger Toast übergeben
            checkResponse<Response>(response.data, true) 
            data = response.data;
        } catch (error) {
            console.warn('Fehler beim Laden der Dateien', error); // Hier ein Toast einbauen, statt immer neue Toasts zu übergeben  PS checkResponse
        }
        this.header.getPagination.updatePagination(data.currentPage, data.files.length, data.hasNextPage, data.hasPreviousPage);
        return data;
    }
    
    private async getFolders(): Promise<FolderData[]> {
        let data: FolderData[] = [];
        try {
            const response = await axios.get(API.GET_FOLDERS);
            if(checkResponse<Response>(response.data)) {
                data = response.data.folders;
            }
        } catch (error) {
            console.warn('Fehler beim Laden der Ordner', error);
        }
        return data;
    }

    async getFilteredFiles(folderId: string, char: string): Promise<FileData[]> {
        let files: FileData[] = [];
        try {
            const response = await axios.post(API.GET_FILTER_FILES, {folderId, char});
            files = response.data.files;
        } catch (error) {
            new Toast({ text: 'Fehler beim Filtern der Dateien', icon: 'error', backdrop: true });
        }
        return files;
    }
}