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
import { isImage, checkResponse } from '../Util/util';
import { API } from '../API';
import { Toast } from '../Components/Toast';
import { PaginationEventData } from '../Components/Pagination';
import { Button } from '../Components/Button';
import { LLMInterface } from '../Components/LLMInterface';


export type Folder = {
    id: string;
    folderName: string;
    path: string;
    files: File[];
    focus?: boolean;
}

export type PageData = {
    currentPage: number;
    maxPages: number;
    files: File[];
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    // state: 'filter' | 'no-filter';
}

export type File = {
    id: string;
    title: string;
    date: string;
    path: string;
    thumbnailPath: string;
}

type APIResponse = {
    message: string;
    data: Folder[] | File[] | PageData;
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
     files: File[];
     filterValue?: string = '';
     llm = LLMInterface.getInstance();

     constructor() {
         super();
         this.header = new Header();
         this.addListeners();
         this.initApp();
    };

    initApp(): void {
        this.el.classList.add('p-4', 'bg-stone-200', 'dark:bg-gray-800');
        DashBoard.getFolders().then((folders) => {
            
            let folderId = null;
            if(folders.length > 0) {
                folderId = folders[0].id;
            }
            
            this.renderSidebar(folders);
            GlobalEvent.publish('folder:setFokus', folderId);   
            DashBoard.getFiles(folderId).then((data) => {
                this.files = data.files;
                // this.header.getPagination.updatePagination(data.currentPage, data.files.length, data.hasNextPage, data.hasPreviousPage);
                this.header.getPagination.updatePagination(1, data.maxPages, data.hasNextPage, false);
                this.renderHeroPage(this.files);
            });     
        });        
    }

     private addListeners(): void {

        GlobalEvent.subscribe('folder:setFokus',(folderId) => {
            this.sidebar.setFocus(folderId);  
        });

        GlobalEvent.subscribe('folderFocusChanged:renderFiles', (folderId) => {
            DashBoard.getFiles(folderId).then((data) => {
                if(data.files) {
                    this.files = data.files;
                    // Pagination updaten und filter clearen im backend
                    console.log('Daten im Dashboard erhalten: ', data);
                    this.header.getPagination.updatePagination(1 , data.maxPages, data.hasNextPage, false);
                    this.renderGrid(this.files);
                }
            });
        });

        // Hier weiter machen Schritt für Schritt, sonst werde ich verrückt :-)
        GlobalEvent.subscribe('change:page', (paginationData: PaginationEventData) => {
            GlobalEvent.publish('spinner', { action: 'show' });
            const { nextPage } = paginationData;
            let state = '';
            state = this.header.getFilter.getValue() ? 'filter' : 'no-filter';

            // Hier muss noch unterschieden werden ob gefiltert wird oder nicht, da es sonst zu Problemen mit der Pagination
            if(state === 'no-filter') {
                DashBoard.getFiles(this.sidebar.getFocus(), nextPage).then((paginationData) => {
                    this.files = paginationData.files;  
                    this.header.getPagination.updatePagination(paginationData.currentPage, paginationData.maxPages, paginationData.hasNextPage, paginationData.hasPreviousPage);
                    this.renderGrid(this.files);
                });
            
            } else {
                this.getFilteredFiles(this.sidebar.getFocus(), this.header.getFilter.getValue(), nextPage)
                .then((pageData) => {
                    GlobalEvent.publish('filter:renderFiles', pageData);
                });
            }
            GlobalEvent.publish('spinner', { action: 'hide' });
        });

        this.header.getPagination.onPageChange(async (params) => {
            GlobalEvent.publish('change:page', params);
        });

        // upload:renderFiles ???
        // Es gibt eine strukturelle diskrepanz, beim filtern und ohne filtern rendering
         GlobalEvent.subscribe('renderFiles', (data: PageData) => {
            console.log('Daten im Dashboard erhalten: ', data);
            if(data.files){
                this.files = data.files;
                this.header.getPagination.updatePagination(data.currentPage, data.maxPages, data.hasNextPage, data.hasPreviousPage);
                this.renderGrid(this.files);
            } else {
                console.error('Daten:', data);
            }
        });

        GlobalEvent.subscribe('filter:renderFiles', (data: PageData) => {
            
            if(data.files) {
                this.files = data.files;
                this.renderGrid(this.files);
                this.header.getPagination.updatePagination(data.currentPage, data.maxPages, data.hasNextPage, data.hasPreviousPage);
            } else {
                console.error('Daten:', data);
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

            if(params.inputValue === '') {
                //Hier mit der API die Page Daten holen für renderfiles
                DashBoard.getFiles(folderId).then((data) => {
                    this.files = data.files;
                    GlobalEvent.publish('renderFiles', data); // Hier gleich immer das andere Event aufrufen, und Pagination updaten       
                    // this.renderGrid(this.files);
                });

            } else {    

                const pageData = await this.getFilteredFiles(folderId, params.inputValue, 1);
                GlobalEvent.publish('filter:renderFiles', pageData);
            };
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
                const toast = new Toast({ text: response.data.message, icon: response.data.type === 'success' ? 'success' : 'error' });   
                DashBoard.getFiles(this.sidebar.getFocus(), this.header.getPagination.currentPage).then((paginationData) => {

                GlobalEvent.publish('renderFiles', paginationData);
            });
        
            } catch (error) {
                console.warn('Fehler beim Hochladen der Datei', error);
            }

            GlobalEvent.publish('spinner', { action: 'hide' });
        });
        
        // LLM Interface
        this.llm.onSend(async () => {
            const text = await this.LLMRequest(this.llm.getInputValue(), this.llm.getFocus, this.sidebar.getFocus());
            this.llm.receiveMessage(text);
        });
    }


    getSidebar(): Sidebar {
        return this.sidebar;
    }

    private renderSidebar(folders: Folder[]): void {
        this.sidebar = new Sidebar({ listItems: folders, width: 'min-w-[220px]' });
        this.el.append(this.sidebar.el);    
    }
    
    private renderHeroPage(files: File[]): void {
        const heroPage = document.createElement('div');
        heroPage.classList.add('bg-stone-100', 'dark:bg-grey-800', 'w-full');
        heroPage.append(this.header.el, this.widgetContainerWrapper);
        this.el.append(heroPage);
        this.renderGrid(files);
     };

    private renderGrid(files: File[]): void {
        this.widgetContainer.innerHTML = ``;
        this.el.classList.add('flex', 'min-h-screen');
        this.widgetContainerWrapper.append(this.widgetContainer);
        this.widgetContainerWrapper.classList.add('dark:bg-gray-800', 'w-full', 'bg-stone-200', 'p-4');
        this.widgetContainer.classList.add('dark:bg-gray-700','min-h-screen', 'rounded', 'p-[10px]', 'bg-blue-200', 'grid', 'grid-cols-[repeat(auto-fill,minmax(210px,1fr))]', 'auto-rows-[300px]', 'rounded-[12px]');    
  
        this.createWidgets(files);
    };

    private createWidgets(files: File[]): void {

        for (const file of files) {

            const widget = new Widget({ text: file.title, date: file.date, width: 'w-[200px]', height: 230, imgPath: file.thumbnailPath });
            widget.el.setAttribute('data-id', file.id);

            widget.onClick(() => {
                // Hier unterscheiden ob Bilddatei oder PDF Datei oder andere Datei
                let modal: Modal = null;
                let modalContent = null;

                let modalContentHeight = 'h-[auto]';
                let ext = file.path.split('.').pop();

                if(isImage(ext)) {
                    modal = new Modal({ text: file.title ,backdropOption: true , width:'w-[700px]', height:'h-[700px]' , rounded: true});
                    // Im Modal Bilder managen
                    modal.el.style.maxWidth = '700px';
                    let img = document.createElement('img');
                    img.classList.add('w-full', 'h-full', 'object-fit');
                    img.src = file.path;
                    modalContent = document.createElement('div');
                    
                    modalContent.classList.add('flex-1', 'w-full', 'h-full', 'object-fit');
                    modalContent.append(img);
                    modal.el.append(modalContent);
                 
                } else {
                    modal = new Modal({text: file.title,  backdropOption: true, width:'w-[1000px]', height: 'h-[800px]' ,rounded: true});
                    modalContent = document.createElement('iframe');
                    // modalContent.setAttribute('sandbox', 'allow-same-origin allow-forms allow-popups allow-scripts');
                    // modalContent.setAttribute('allow', 'autoplay; fullscreen');
                    // modalContent.setAttribute('controls', 'true');
                    // modalContent.setAttribute('controlsList', 'nodownload');
                    modalContentHeight = 'h-full';
                    modalContent.src = file.path; // PDF oder URL setzen 
                }

                modal.el.classList.add('flex','flex-col','overflow-hidden','justify-end');
                modalContent.classList.add('m-1', 'border-none', 'bg-white','h-[auto]', `w-[auto]`, `${modalContentHeight}`);
                
                modal.el.append(modalContent);
                document.body.append(modal.el);
            });

            widget.onDelete(async (e) => {    
                const folderId = this.getSidebar().getFocus();
                const fileId = widget.el.getAttribute('data-id');
                GlobalEvent.publish('spinner', { action: 'show' });      
                await this.deleteWidget(folderId, fileId);   
                GlobalEvent.publish('spinner', { action: 'hide' });
            });

            this.widgetContainer.append(widget.el);

            widget.addContextMenu(
                {
                    items: [
                        {
                            btn: new Button({ text: 'Datei löschen', color: 'bg-sky-500/30', hoverColor: 'hover:bg-sky-500/50', id: 'deleteFileBtn', width: 'w-[200px]', height: 'h-[30px]' }),
                            event: () => widget.deleteWidget()
                        },
                        {
                            btn: new Button({ text: 'Dokumenten-Assistent', color: 'bg-sky-500/30', hoverColor: 'hover:bg-sky-500/50', id: 'assistant', width: 'w-[200px]', height: 'h-[30px]' }),
                            event: () => this.showLLMInterface(file.id)
                        }
                    ]
                }
            );
        }
    };

    showLLMInterface(fileId: string): void {
        this.llm.show();
        this.llm.setFocus = fileId;
    }

    private async LLMRequest(prompt: string, fileId: string, folderId: string): Promise<string> {
        let text = '';
        try {
            const response = await axios.post(API.AI_REQUEST, { prompt, fileId, folderId });
            text = response.data.answer;
        } catch (error) {
            console.warn('Fehler bei der AI Anfrage', error);
        }

        console.log('Antwort von der AI: ', text);
        return text;
    }

    public static async getFiles(folderId: string, page: number = 1): Promise<PageData> {
        let data: PageData;      
        try {
            const response = await axios.post(API.GET_FILES, {folderId, page});
            // oder hier einen weiteren Paramter für Trigger Toast übergeben
            // checkResponse<Response>(response.data, true) 
            data = response.data;
        } catch (error) {
            console.warn('Fehler beim Laden der Dateien', error); // Hier ein Toast einbauen, statt immer neue Toasts zu übergeben  PS checkResponse
        }
        return data;
    }
    
    public static async getFolders(): Promise<Folder[]> {
        let data: Folder[] = [];
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

    async getFilteredFiles(folderId: string, char: string, pageNumber: number): Promise<PageData> {
        let page: PageData;
        try {
            const response = await axios.post(API.GET_FILTER_FILES, {folderId, char, pageNumber});
            page = response.data;
        } catch (error) {
            new Toast({ text: 'Fehler beim Filtern der Dateien', icon: 'error', backdrop: true });
        }
        return page;
    }

    private async deleteWidget(folderId: string, fileId: string) {
        try { 
            const response = await axios.post(API.DELETE_FILE, { fileId: fileId, folderId: folderId });
            const msg: Response = response.data;
            checkResponse(msg);
            
            if(this.files.length === 1 && this.header.getPagination.currentPage > 1) {
                this.header.getPagination.currentPage - 1;
            }
            
            DashBoard.getFiles(this.sidebar.getFocus(), this.header.getPagination.currentPage).then((paginationData) => {
                this.files = paginationData.files;  
                this.header.getPagination.updatePagination(paginationData.currentPage, paginationData.maxPages, paginationData.hasNextPage, paginationData.hasPreviousPage);
                GlobalEvent.publish('renderFiles', paginationData);
            });
        
        } catch (error) {
            console.error('Fehler beim Löschen der Datei:', error);
        };
    }
}