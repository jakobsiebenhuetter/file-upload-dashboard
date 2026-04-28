import { Button } from "./Button";
import { ContextMenu, TContextMenu } from "./Contextmenu";


export class DarkModeButton extends Button {
    openContext = false;
    darkModeEnabled = false;
    constructor() {
        super({id:'darkmode-toggle', shape: 'circle', text: '', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-[22px] h-[22px]" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7.5 7.5 0 0 0 21 12.79z" /></svg>', width: 'w-[30px]', height: 'h-[30px]', color: 'bg-gray-200', hoverColor: 'hover:bg-gray-500' });
        this.bindListener();
    }

    bindListener() {
        const callback = this.openContext ? this.renderContextMenu : () => {this.toggleDarkMode()};    
        this.subscribe('click', (params: any) => {
            callback(params);
        });
    }

    renderContextMenu(params: any) {
        const contextMenuData: TContextMenu = {
            position: 'left',
            items: [
                {
                    btn: new Button({text: 'Option 1', width: 'w-[150px]', height: 'h-[30px]', color: 'bg-gray-200', hoverColor: 'hover:bg-gray-300'}), 
                    event: () => console.log('Option 1 clicked')
                },
                {
                    btn: new Button({text: 'Option 2', width: 'w-[150px]', height: 'h-[30px]', color: 'bg-gray-200', hoverColor: 'hover:bg-gray-300'}),
                    event: () => console.log('Option 2 clicked')
                },
            ] 
        };

        const contextMenu = new ContextMenu(contextMenuData);
        contextMenu.show(params.event.pageX, params.event.pageY);
    }

    toggleDarkMode() {
        this.darkModeEnabled = !this.darkModeEnabled;
        if(this.darkModeEnabled) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        console.log('Dark mode toggled');
    }

    
}