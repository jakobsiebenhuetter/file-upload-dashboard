import '../styles.css';
import { Event } from './Event';

export class Filter extends Event {
    protected props: Record<string, any> = {};
    element: HTMLElement = document.createElement('div');
    filterInput: HTMLInputElement = document.createElement('input');
    filterButton: HTMLButtonElement = document.createElement('button');
    width: string = 'w-[700px]';
    height: number = 40;
    placeholder: string = 'Suchen...';
    buttonText: string = '';

    constructor(props?: Record<string, any>) {
        super();

        const defaults = {
            width: this.width,
            height: this.height,
            placeholder: this.placeholder,
            buttonText: this.buttonText,
        }

        this.props = {
            ...defaults,
            ...props
        };

        this.renderUI();
    }

    renderUI(): void {
        this.element.classList.add('flex', 'flex-row', 'justify-between', 'bg-white', 'rounded-4xl', 'p-1');
        
        this.filterInput.type = 'text';
        this.filterInput.placeholder = this.props.placeholder;
        this.filterInput.classList.add(this.props.width, 'h-[40px]', 'focus:outline-none', 'text-xl');
        
        this.filterButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>`;
        this.filterButton.classList.add('w-[50px]', 'flex', 'justify-center', 'items-center', 'cursor-pointer');     
        this.element.append(this.filterButton, this.filterInput);

        this.filterButton.onclick = (e) => {
            this.publish('filter', {
                event: e,
                inputValue: this.filterInput.value
            });
        };

        this.filterInput.onkeydown = (e) => {
            if(e.key === 'Enter') {
                this.publish('filter', {
                    event: e,
                    inputValue: this.filterInput.value
                });
            };
        }
    }

    getElement(): HTMLElement {
        return this.element;
    }

    getValue(): string {
        return this.filterInput.value;
    }

    setValue(value: string): void {
        this.filterInput.value = value;
    }

    onFilter(handler: (params?: Record<string, any>) => void): void {
        this.subscribe('filter', handler);
    }
}