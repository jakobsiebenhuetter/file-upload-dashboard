import '../styles.css';
import { Button } from './Button';
import { Event } from './Event';
import { Tooltip } from './Tooltip';
import { ContextMenu, TContextMenu, TContextMenuEvent } from './Contextmenu';

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
    el: HTMLElement;
    deleteBtn: Button;
    width: string = 'w-[100px]';
    height: number = 100;
    color: string = 'lightgray';
    text: string | null = null;
    date: string | null = null;
    imgPath: string = '';
    contextMenu?: ContextMenu = null;

    constructor(props?: IWidgetProps) {
        super();
        const icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-[22px] h-[22px]" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>';
        this.el = document.createElement('div') as HTMLElement;
        this.deleteBtn = new Button({shape:'circle', text: '', icon: icon, width: 'w-[30px]', height: 'h-[30px]', color: 'bg-red-200', hoverColor: 'hover:bg-red-500' });

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

        this.el.onclick = (e) => {

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
        const img = document.createElement('img');
        // imgContainer.src = 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fhintergrundbild.org%2Fwallpaper%2Ffull%2F9%2Fa%2Fd%2F35623-popular-tiere-hintergrundbilder-1920x1200.jpg&f=1&nofb=1&ipt=e9d41e369609327f6a261f0a5fc39e583defcfb35065b097d55b8a600872b301';
        img.src = this.props.imgPath;
        img.classList.add('w-full', 'h-8/10');
        this.el.insertAdjacentElement('afterbegin', img);
        this.blockImgdrag(img);
    }

    renderUI(): void {
        if(this.props.text) {
            const pTag = document.createElement('p');
            this.el.append(pTag);
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
            this.el.append(dateLabel);

        }        
        
        this.el.style.height = this.props.height + 'px';
        this.el.classList.add(
            'widget',
            `${this.props.width}`,
            'm-2',
            'flex',
            'flex-col',
            'overflow-hidden',
            'items-start',
            'justify-center',
            // Modernes Design
            'rounded-xl',
            'bg-white',
            'text-slate-800',
            'border',
            'border-slate-200',
            // Schatten
            'shadow-md',
            'hover:shadow-xl',
            // Hover-Effekte
            'hover:border-sky-300',
            'hover:scale-[1.02]',
            'hover:-translate-y-1',
            // Smooth Transitions
            'transition-all',
            'duration-300',
            'ease-in-out',
            'cursor-pointer',
            // Für absolute Positionierung des Delete-Buttons
            'relative',
            'group'
        );
    };
    
    blockImgdrag(img: HTMLImageElement): void {
        img.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    }

    setDeleteBtn(): void {
        this.deleteBtn.el.classList.add(
            'absolute',
            'top-1',
            'right-1',
            'opacity-0',
            'group-hover:opacity-100',
            'transition-opacity',
            'duration-100',
            'hover:cursor-pointer',
            'bg-red-200',
            'hover:bg-red-500',
            'p-1'
        );
        this.el.append(this.deleteBtn.el);

        this.deleteBtn.onClick(() => {
            this.deleteWidget();
        });
    };

    onDelete(handler: (params?: Record<string, any>) => void): void {
        this.subscribe('delete', handler);
    }

    setElement(el: any): void {
        const footer: HTMLElement = document.createElement('div');
        footer.append(el);
        footer.classList.add('w-[100%]', 'h-[50px]','p-2', 'flex', 'flex-row', 'justify-end');
        this.el.appendChild(footer);
    };

    getText(): string {
        return this.props.text;
    };

    onClick(handler: (params?: Record<string, any>) => void): void {
        this.subscribe('click', handler);
    }

    // Muss noch implementiert werden mit einer eigenen Komponente für das Contextmenü
    addContextMenu(contexMenuData: TContextMenu, eventData?: TContextMenuEvent): void {
        ContextMenu.handleContextMenu();
        
        this.el.oncontextmenu = (e) => {
            e.preventDefault();
            if(this.contextMenu) {
                this.contextMenu.destroy();
            }
            contexMenuData.eventData = eventData;
            this.contextMenu = new ContextMenu(contexMenuData);
            this.contextMenu.show(e.pageX, e.pageY);
        }
    }

    deleteWidget(): void {        
        this.publish('delete', {
            widget: this
        });

        if(this.contextMenu) {
            this.contextMenu.destroy();
        }
        
        this.el.remove();
        this.el = null;
    }
};