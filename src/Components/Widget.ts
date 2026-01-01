import '../styles.css';
import { Event } from './Event';
import { Tooltip } from './Tooltip';

// Titel vom Widget eingeben und ein icon vom Format
interface IWidgetProps {
    color?: string; // hier bitte tailwind Farben verwenden
    text?: string;
    date?: string;
    imgPath?: string;
    width: string;
    height: number;
};

export class Widget extends Event {

    protected props?: IWidgetProps;
    private status: number = 0;
    private disabled: boolean = false;
    dateLabel: HTMLElement;
    element: HTMLElement;
    deleteBtn: HTMLElement;
    width: string = 'w-[100px]';
    height: number = 100;
    color: string = 'lightgray';
    text: string | null = null;
    date: string | null = null;
    imgPath: string = '';

    constructor(props?: IWidgetProps) {
        super();

        this.element = document.createElement('div') as HTMLElement;
        this.deleteBtn = document.createElement('div') as HTMLElement;

        const defaults = {
           width: this.width,
           height: this.height,
           color: this.color,
           text: this.text,
           date: this.date,
           status: this.status,
           disabled: this.disabled,
           imgPath: this.imgPath,
        }

        this.props = { 
            ...defaults,
            ...props
        };

        this.element.onclick = (e) => {

            this.publish('click', { 
                event: e,
                widget: this
             })
        }
        
        this.renderUI();
        this.setDeleteBtn();
        this.addImage();
    };

    async addImage() {
        const imgContainer = document.createElement('img');
        // imgContainer.src = 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fhintergrundbild.org%2Fwallpaper%2Ffull%2F9%2Fa%2Fd%2F35623-popular-tiere-hintergrundbilder-1920x1200.jpg&f=1&nofb=1&ipt=e9d41e369609327f6a261f0a5fc39e583defcfb35065b097d55b8a600872b301';
        imgContainer.src = this.props.imgPath;
        imgContainer.classList.add('w-full', 'h-8/10');
        this.element.insertAdjacentElement('afterbegin', imgContainer);
    }

    renderUI(): void {
        if(this.props.text) {
            const pTag = document.createElement('p');
            this.element.append(pTag);
            pTag.innerText = this.props.text;
            
            pTag.onmousemove = () => {
                Tooltip.getInstance().setText(this.props.text).setTarget(pTag).show();
            };

            pTag.onmouseleave = () => {
                Tooltip.getInstance().hide();
            };

            pTag.classList.add('p-2' ,'w-[170px]', 'truncate');
        }

        if(this.props.date) {
            const dateLabel = document.createElement('span');
            dateLabel.classList.add('text-sm', 'text-gray-700', 'pl-2');
            dateLabel.innerText = this.props.date;
            this.element.append(dateLabel);

        }        
        
        this.element.style.height = this.props.height + 'px';
        this.element.classList.add('widget', `${this.props.width}`, 'm-2','text-slate-900', 'flex','flex-col', 'overflow-auto', 'items-start', 'justify-center','rounded-md','bg-sky-500', 'hover:bg-sky-200', 'cursor-pointer');
    };
    

    setDeleteBtn(): void {
        this.deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-[22px] h-[22px]" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>`;
        this.deleteBtn.classList.add('hover:cursor-pointer', 'bg-red-200', 'hover:bg-red-500','rounded-md','p-1','m-1','self-end');
        this.element.append(this.deleteBtn);
    };

    getDeleteBtn(): HTMLElement {
        return this.deleteBtn;
    }

    setElement(element: any): void {
        const footer: HTMLElement = document.createElement('div');
        footer.append(element);
        footer.classList.add('w-[100%]', 'h-[50px]','p-2', 'flex', 'flex-row', 'justify-end');
        this.element.appendChild(footer);
    };

    getText(): string {
        return this.props.text;
    };

    onClick(handler: (params?: Record<string, any>) => void): void {
        this.subscribe('click', handler);
    }

};