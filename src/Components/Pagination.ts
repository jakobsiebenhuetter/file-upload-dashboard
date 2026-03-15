import $ from 'jquery';

import { Button } from "./Button";
import { Event } from "./Event";
import { FileData } from "../Dashboard/Dashboard";



type PaginationProps = {
    currentPage: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    currentFiles?: FileData[];
    totalPages: number;
    filesPerPage: number;
    folderId: string;
};

export type PaginationEventData = {
    event: MouseEvent;
    action: 'next' | 'prev';
    nextPage: number;
}


export class Pagination extends Event{
    leftArrowIcon = `<svg width="1.5em" height="1.5em" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="mr-1.5 h-4 w-4 stroke-2">
            <path d="M15 6L9 12L15 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`;

    rightArrowIcon =`<svg width="1.5em" height="1.5em" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="ml-1.5 h-4 w-4 stroke-2">
            <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`;
    el: HTMLElement = document.createElement('div');
    leftArrow = new Button({shape: 'circle', text: 'Zurück', icon: this.leftArrowIcon, iconPosition: 'left', width: 'w-[auto]', height: 'h-[40px]', color: 'bg-blue-300', hoverColor: 'hover:bg-blue-400', activeColor: 'active:bg-blue-500' });
    heroElement = new Button({ shape: 'circle', text: '1', width: 'w-[40px]', height: 'h-[40px]', color: 'bg-blue-300' });
    rightArrow = new Button({ shape: 'circle', text: 'Weiter',  icon: this.rightArrowIcon , width: 'w-[auto]', height: 'h-[40px]', color: 'bg-blue-300', hoverColor: 'hover:bg-blue-400', activeColor:'active:bg-blue-500' });

    protected props: PaginationProps;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentFiles: FileData[];
    totalPages: number;
    filesPerPage: number;
    folderId: string = '';
    
    
    constructor(data?: PaginationProps) {
        super();
        const defaults: PaginationProps = {
            folderId: '',
            currentPage: 1,
            hasPreviousPage: false,
            hasNextPage: false,
            totalPages: 1,  
            filesPerPage: 10,     
        };

        this.props = { ...defaults, ...data };
        this.hasPreviousPage = this.props.hasPreviousPage;
        this.currentPage = this.props.currentPage;
        this.hasNextPage = this.props.hasNextPage;
        this.totalPages = this.props.totalPages;
        this.filesPerPage = this.props.filesPerPage;
        this.renderUI();
        this.addListeners();
        // this.init();
    }

    private renderUI() {
        $(this.leftArrow.el).addClass('flex justify-center items-center cursor-pointer m-2');
        $(this.heroElement.el).addClass('flex justify-center items-center cursor-pointer m-2');
        $(this.rightArrow.el).addClass('flex justify-center items-center cursor-pointer m-2');
        $(this.el).addClass('flex flex-row justify-center items-center cursor-pointer select-none bg-yellow-50 rounded-full');
        this.el.append(this.leftArrow.el, this.heroElement.el, this.rightArrow.el);
    }

    private update(): void {

        this.disableLeftButton();
        this.disableRightButton();

        this.heroElement.el.textContent = this.currentPage.toString();
        if(this.hasNextPage) {
            this.enableRightButton();
        }

        if(this.hasPreviousPage) {
            this.enableLeftButton();
        }

    }

    private addListeners(): void {

        this.leftArrow.onClick(async (e) => {
            if(!this.hasPreviousPage) return;
            this.currentPage = this.currentPage - 1;

            this.publish('pageChange', 
                { 
                    event: e,
                    action: 'prev',
                    nextPage: this.currentPage 
                }
            );
            this.updatePagination(this.currentPage, this.totalPages, this.hasNextPage, this.hasPreviousPage);
        });

        this.rightArrow.onClick(async (e) => {
            if(!this.hasNextPage) return;
            this.currentPage = this.currentPage + 1;

            this.publish('pageChange',
                {
                    event: e,
                    action: 'next',
                    nextPage: this.currentPage,
                }
            );
            this.updatePagination(this.currentPage, this.totalPages, this.hasNextPage, this.hasPreviousPage);
        });
    }

    get getPage() {
        return {
            currentPage: this.currentPage,
            files: this.currentFiles,
        }
    }

    // set setNextPage(isNext: boolean) {
    //     this.hasNextPage = isNext;
    // }

    // set setPreviousPage(isPrevious: boolean) {
    //     this.hasPreviousPage = isPrevious;
    // }

    // set setTotalPage(totalPages: number) {
    //     this.totalPages = totalPages;
    // }

    // set setCurrentPage(currentPage: number) {
    //     this.currentPage = currentPage;
    // }

    private init(): void {
        this.publish('pageChange',
                {
                    //...
                }
            );
        }


    setPaginationData(currentPage: number, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean): void {
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.hasNextPage = hasNextPage;
        this.hasPreviousPage = hasPreviousPage;
        this.updatePagination(currentPage, totalPages, hasNextPage, hasPreviousPage);
    }
    // Validiert wird im Backend, hier wird nur die Anfrage gesendet und die UI aktualisiert
   
    updatePagination(page: number, totalPages: number, hasnextPage = false, hasPreviousPage = false): void {
        this.totalPages = totalPages;
        if(page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.totalPages = totalPages;
        this.hasNextPage = hasnextPage;
        this.hasPreviousPage = hasPreviousPage;
        this.update();
    }

    onPageChange(handler: (args?: PaginationEventData) => void): void {
       this.subscribe('pageChange', handler);
    }

    private disableLeftButton(): void {
        // this.leftArrow.el.classList.remove('hover:bg-gray-400', 'cursor-pointer');
        // this.leftArrow.el.classList.add('opacity-50', 'cursor-not-allowed');
        this.leftArrow.disable();
    }

    private disableRightButton(): void {
        // this.rightArrow.el.classList.remove('hover:bg-gray-400', 'cursor-pointer');
        // this.rightArrow.el.classList.add('opacity-50', 'cursor-not-allowed');
        this.rightArrow.disable();
    }

    private enableLeftButton(): void {
        // this.leftArrow.el.classList.remove('opacity-50', 'cursor-not-allowed');
        // this.leftArrow.el.classList.add('hover:bg-gray-400', 'cursor-pointer');
        this.leftArrow.enable();
    }

    private enableRightButton(): void {
        // this.rightArrow.el.classList.remove('opacity-50', 'cursor-not-allowed');
        // this.rightArrow.el.classList.add('hover:bg-gray-400', 'cursor-pointer');
        this.rightArrow.enable();
    }
}