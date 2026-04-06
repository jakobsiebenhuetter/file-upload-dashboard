import { Event } from './Event';
import { Button } from './Button';

type TLLMInterfaceProps = {

}

export class LLMInterface extends Event {
    private static instance: LLMInterface;

    el: HTMLElement = document.createElement('div');
    textField = document.createElement('textarea');
    private constructor() {
        super();
        this.renderUI();
    }


    renderUI() {
        this.el.classList.add('fixed', 'top-[20%]', 'left-[50%]', 'bg-black/50', 'flex', 'justify-center', 'items-center', 'flex-col', 'gap-2', 'p-4', 'rounded', 'z-50');
        this.renderHeader();
        this.renderFooter();
        document.body.appendChild(this.el);
    };

    renderHeader() {
        const header = document.createElement('div');
        header.classList.add(
            'w-[100%]',
            'h-[50%]',
            'flex',
            'flex-row',
        );

        this.textField.classList.add(
            'w-[100%]',
            'h-[40%]',
            'p-4',
            'border',
            'border-gray-300',
            'rounded',
            'bg-white',
            'text-black');

        this.textField.setAttribute('placeholder', 'Stelle eine Frage...');
        header.appendChild(this.textField);
        this.el.appendChild(header);
    }

    renderFooter() {
        const footer = document.createElement('div');
        const icon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const sendBtn = new Button({icon: icon, shape:'circle', color: 'bg-green-500', hoverColor: 'hover:bg-green-600', activeColor: 'active:bg-green-700', width:'w-[30px]', height: 'h-[30px]' });
        footer.classList.add(
            'w-[100%]',
            'h-[50px]',
            'flex',
            'justify-end',
            'items-center',
            'gap-2',
        );

        footer.appendChild(sendBtn.el);
        this.el.appendChild(footer);
    }

    static getInstance(): LLMInterface {
        if (!LLMInterface.instance) {
            LLMInterface.instance = new LLMInterface();
        }
        return LLMInterface.instance;
    };

    close() {
        this.el.style.display = 'none';
    }

    show() {
        this.el.style.display = 'flex';
    }
}