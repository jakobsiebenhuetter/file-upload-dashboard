import '../styles.css';
import { Filter } from './Filter';


export class Header {
    protected props: Record<string, any> = {};
    private status: number = 0;
    private disabled: boolean = false;
    element: HTMLElement = document.createElement('div');
    filter: Filter;
    width: string = 'w-[100px]';
    height: number = 100;
    color: string = 'lightgray';
    text: string = '';
    imgPath: string = '';

    constructor(props?: Record<string, any>) {

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
        this.element.classList.add('w-screen', 'bg-stone-200', 'flex', 'flex-row', 'justify-center', 'p-6');
        this.filter = new Filter();
        this.element.append(this.filter.element);
    }

    get getFilter(): Filter {
        return this.filter;
    }
}