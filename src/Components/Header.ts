import '../styles.css';
import { Filter } from './Filter';
import { Pagination } from './Pagination';
import { DarkModeButton } from './DarkModeButton';


export class Header {
    protected props: Record<string, any> = {};
    private status: number = 0;
    private disabled: boolean = false;
    el: HTMLElement = document.createElement('div');
    filter: Filter;
    pagination: Pagination;
    darkmodeBtn: DarkModeButton;
    width: string = 'w-[200px]';
    height: number = 100;
    color: string = 'lightgray';
    text: string = '';
    imgPath: string = '';

    constructor(props?: Record<string, any>) {

        this.filter = new Filter();
        this.pagination = new Pagination();
        this.darkmodeBtn = new DarkModeButton();
        
        const defaults = {
            width: this.width,
            height: this.height,
            color: this.color,
            text: this.text,
            status: this.status,
            disabled: this.disabled,
            imgPath: this.imgPath,
        }

        this.props = {
            ...defaults,
            ...props
        };

        this.renderUI();
    };


    renderUI() {
        this.el.classList.add('bg-stone-200', 'flex', 'flex-row', 'items-center', 'justify-between', 'p-4');
        this.el.append(this.filter.el, this.pagination.el, this.darkmodeBtn.el);
    }

    get getFilter(): Filter {
        return this.filter;
    }

    get getPagination(): Pagination {
        return this.pagination;
    }
}