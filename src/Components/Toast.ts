import { Event } from "./Event";

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
type IconType = 'success' | 'info' | 'warning' | 'error';

export class Toast extends Event {
    position: Position = 'top-right';
    props: Record<string, any>;
    element: HTMLElement = document.createElement('div');
    color?: string; // hier bitte tailwind Farben verwenden
    text: string = 'Toast';
    icon?: IconType = 'info';
    width: string;
    height: number;
    backdropOption: boolean = false;
    backdrop: HTMLElement = document.createElement('div');

    constructor(props?: Record<string, any>) {
        super();


        const defaults = {
            width: this.width,
            height: this.height,
            color: this.color,
            text: this.text,
            backdrop: this.backdrop,
            position: this.position,
        }

        this.props = {
            ...defaults,
            ...props
        };

        this.renderUI();
    };

    renderUI() {
        this.element.classList.add('fixed', 'z-50', 'm-4', 'toast-slide-in');
        this.element.style.top = '20px';
        this.element.style.right = '20px';
        let icon = null;
        if(this.props.icon === 'success') {

            icon = `<svg class="shrink-0 size-4 text-teal-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"></path>
            </svg>`;

        } else if (this.props.icon === 'info') {

            icon = `<svg class="shrink-0 size-4 text-blue-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path>
            </svg>`;

        }

        this.element.innerHTML = `<div class="max-w-xs bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-neutral-800 dark:border-neutral-700" role="alert" tabindex="-1" aria-labelledby="hs-toast-success-example-label">
    <div class="flex p-4">
        <div class="shrink-0">${icon}</div>
                <div class="ms-3">
                    <p id="hs-toast-success-example-label" class="text-sm text-gray-700 dark:text-neutral-400">
                        ${this.props.text}
                    </p>
                </div>
            </div>
        </div>`;
        document.body.append(this.element);


        if (this.props.backdrop) {
            this.backdrop.classList.add('w-screen', 'h-screen', 'absolute', 'z-10', 'bg-neutral-950/20');
            document.body.append(this.backdrop);
            this.backdrop.onclick = (e) => {
                this.element.remove();
                this.backdrop.remove();
            }
        }

        this.destroy();
    };

    destroy() {
        setTimeout(() => {
            this.element.classList.remove('toast-slide-in');
            this.element.classList.add('toast-slide-out');
            setTimeout(() => {
                this.element.remove();
            }, 500);

            if (this.props.backdrop) {
                this.backdrop.remove();
            }
        }, 3000);
    }
}