import { Button } from "./Button";
import { ContextMenu, TContextMenu } from "./Contextmenu";

/**
 * 
 * @info This component is responsible for toggling between light and dark mode. It also has an optional context menu that can be opened on click. The user's theme preference is saved in localStorage and applied on page load.
 * 
 * @todo Implement the context menu with actual functionality. Currently, it just logs to the console when an option is clicked.
 * 
 */

export class DarkModeButton extends Button {
    openContext = false;
    moonIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-[22px] h-[22px]" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7.5 7.5 0 0 0 21 12.79z" /></svg>';
    sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-[22px] h-[22px]"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21m8.742-8.742h-2.25M6.75 12H4.5m14.712-6.962l-1.591 1.591M8.341 15.659l-1.591 1.591m11.182 0l-1.591-1.591M8.341 8.341L6.75 6.75M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
    constructor() {
        super({id:'darkmode-toggle', shape: 'circle', text: '', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-[22px] h-[22px]" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7.5 7.5 0 0 0 21 12.79z" /></svg>', width: 'w-[30px]', height: 'h-[30px]', color: 'bg-gray-200', hoverColor: 'hover:bg-gray-500' });
        this.bindListener();
        this.darkMode ? this.setThemeMode('dark', this.sunIcon) : this.setThemeMode('light', this.moonIcon);
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
        let darkMode = !this.darkMode;
        if(darkMode) {
            this.setThemeMode('dark', this.sunIcon); 
            console.log('Dark mode toggled');
        } else {
            this.setThemeMode('light', this.moonIcon);
        }
    }

    saveThemeMode(theme: 'light' | 'dark') {
        localStorage.setItem('theme', theme);
    }

    setThemeMode(theme : 'light' | 'dark', icon: string) {
        if(theme === 'light'){
            document.documentElement.classList.remove('dark');
        } else if(theme === 'dark' || window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.classList.add('dark');
        }
        this.setIcon(icon);
        this.saveThemeMode(theme);
    }

    get darkMode(): boolean {
        if(
            localStorage.getItem('theme') === 'dark' || 
            (!localStorage.getItem('theme') && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            return true;
        }
        return false;
    }
}