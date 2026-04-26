import $ from 'jquery';
import { Button } from './Button';
import { Event } from './Event';

export type TContextMenu = {
    items: {btn: Button, event?: () => void}[];
    id?: string;
    xPosition?: number;
    yPosition?: number;
}

export class ContextMenu extends Event {
    props: TContextMenu;
    el: HTMLElement = document.createElement('div');
    xPosition: number = 0;
    yPosition: number = 0;

    constructor(props: TContextMenu) {
        super();

        const defaults: TContextMenu = {
            items: [],
            id: 'ContextMenu',
        };

        this.props = {...defaults, ...props};
        this.addListener();
    }

    private renderUI(): void {
        this.el.style.top = `${this.props.yPosition}px`;
        this.el.style.left = `${this.props.xPosition}px`;

        $(this.el).addClass('absolute bg-white border border-gray-300 rounded shadow-md z-1 flex flex-col gap-1 p-2');
        document.body.appendChild(this.el);
        this.el.setAttribute('id', this.props.id);
        this.props.items.forEach(item => {
            // item.el.classList.add('block', 'w-full', 'text-left', 'px-4', 'py-2', 'hover:bg-gray-100');
            this.el.appendChild(item.btn.el);
        });
    }

    // Das muss man mit TS besser abfangen -> Regeln definieren, z.B. jedes Item muss eine Id haben damit man das Event zuordnen kann
    private addListener(): void {
        this.props.items.forEach(item => {
            let handler = typeof item.event === 'function' ? item.event : () =>  console.log('Kein Event');
            item.btn.onClick(() => {
                handler();
                destroyContextMenu(this);
            });
        });
    }

    public show(x: number, y: number) {
        document.querySelector('#ContextMenu')?.remove();
        this.props.xPosition = x;
        this.props.yPosition = y;
        this.renderUI();
    }

    public destroy() {
        this.props.items.forEach(item =>  item.btn.clearAll());  
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

// util function zur Zerstörung des ContextMenus
export function destroyContextMenu(contextMenu: ContextMenu) {
    contextMenu.destroy();
    contextMenu = null;
}