import $ from 'jquery';
import { Button } from './Button';
import { Event } from './Event';

export type TContextMenu = {
    items: Button[];
    id?: string;
    xPosition?: number;
    yPosition?: number;
    eventData?: TContextMenuEvent ;
}

export type TContextMenuEvent = {
    [id: string]: (args?: any) => void;
};

export class ContextMenu extends Event {
    props: TContextMenu;
    el: HTMLElement = document.createElement('div');
    xPosition: number = 0;
    yPosition: number = 0;
    eventData: TContextMenuEvent;

    constructor(props: TContextMenu) {
        super();

        const defaults: TContextMenu = {
            items: [],
            id: 'ContextMenu',
        };

        this.props = {...defaults, ...props};  
    }

    private renderUI(): void {
        this.el.style.top = `${this.props.yPosition}px`;
        this.el.style.left = `${this.props.xPosition}px`;

        $(this.el).addClass('absolute bg-white border border-gray-300 rounded shadow-md z-1 flex flex-col gap-1 p-2');
        document.body.appendChild(this.el);
        this.el.setAttribute('id', this.props.id);
        this.props.items.forEach(item => {
            // item.el.classList.add('block', 'w-full', 'text-left', 'px-4', 'py-2', 'hover:bg-gray-100');
            this.el.appendChild(item.el);
        });

        
    }

    // Das muss man mit TS besser abfangen -> Regeln definieren, z.B. jedes Item muss eine Id haben damit man das Event zuordnen kann
    private addListener(): void {
        this.props.items[0]?.el.focus({ focusVisible: true });
        this.props.items.forEach(item => {
            let handler = typeof this.props.eventData[item.props.id] === 'function' ? this.props.eventData[item.props.id] : () =>  console.log('Kein Event');
            item.onClick(() => {
                handler();
                this.publish('destroy', this);
            });
        });

        this.subscribe('destroy', (params) => {
            destroyContextMenu(params);
        });
    }

    public show(x: number, y: number) {
        document.querySelector('#ContextMenu')?.remove();
        this.props.xPosition = x;
        this.props.yPosition = y;
        this.renderUI();
        this.addListener();
    }

    public destroy() {
        this.props.items.forEach(item =>  item.clearAll());  
        this.el.remove();
        this.publish('destroy');
    }

    public onDestroy(handler: () => void): void {
        this.subscribe('destroy', handler);
    }

    static handleContextMenu() {
        document.addEventListener('click', () => {
            document.querySelector('#ContextMenu')?.remove();
        });
    }
}



// util Funktionen zur Erzeugung/Zerstörung des ContextMenus

export function createContextMenu(props: TContextMenu) {
    const menu = new ContextMenu(props);
    menu.show(props.xPosition || 0, props.yPosition || 0);
    return menu;
}
export function destroyContextMenu(contextMenu: ContextMenu) {
    contextMenu.publish('destroy', contextMenu);
    contextMenu = null;
}
