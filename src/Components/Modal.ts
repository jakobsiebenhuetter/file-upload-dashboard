import '../styles.css';

import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';

import { Event } from './Event';
import { KeyManager } from '../Dashboard/KeyManager';

/**
 *@todo besseres TS, außerdem, muss hier gesteuert werden, ob videos angezeigt werden und Dokumente
 */
export class Modal extends Event{

    protected props: Record<string, any> = {};
    private default: boolean = false;
    private disabled: boolean = false;
    private _cleaned: boolean = false;

    el: HTMLElement = document.createElement('div');
    $closeBtn: JQuery = $(`<div><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></div>`).addClass('cursor-pointer bg-gray-200 hover:bg-gray-300 rounded p-2');
    $saveBtn = $('<button>Speichern</button>').addClass("bg-amber-600 rounded p-2 bg-green-500 hover:bg-green-600 hover:cursor-pointer");
    $input = $('<input placeholder="Unbenannter Ordner" />');
    width: string = 'w-[400px]';
    height: string = 'h-[400px]';
    rounded: boolean = false;
    color: string = 'lightgray';
    text: string = 'Ordner erstellen';
    backdropOption: boolean = false;
    backdrop: HTMLElement = document.createElement('div');
    confirmModal: boolean = false;

    constructor(props?: Record<string, any>) {
        super();
        const defaults = {
            width: this.width,
            height: this.height,
            rounded: this.rounded,
            color: this.color,
            text: this.text,
            default: this.default,
            disabled: this.disabled,
            backdropOption: this.backdropOption,
            confirmModal: false,
        };

        this.props = { ...defaults, ...props };
        this.renderUI();
    };

    renderUI() {
        
        const $header = $(`<div>${this.props.text}</div>`).addClass('flex flex-row justify-between item-center p-2 m-2');
        this.$input.addClass('p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full');
        $header.append(this.$closeBtn);
        this.el.append($header[0]);

        this.$closeBtn.on('click', () => {
            this.close();
        });

        if (this.props.default) {

            const $footer = $('<div></div>').addClass('flex flex-row justify-end p-2 m-2');
            const $modalBody = $('<div></div>').addClass('flex flex-row justify-center m-2 p-2');

           
            $modalBody.append(this.$input);
            $footer.append(this.$saveBtn);

            const observer = new MutationObserver((mutations, observe) => {
                (this.$input[0] as HTMLElement).focus();
                observe.disconnect();
            });
            observer.observe(this.el, { childList: true });

            this.$input.on('focus', () => {
                this.$input.addClass('outline-2 outline-green-500');
            });


            this.el.append($modalBody[0], $footer[0]);

        } else if(this.props.confirmModal) {
            this.$saveBtn.text('Ja').addClass('bg-green-500 hover:bg-green-600 hover:cursor-pointer w-[60px]');
            const $cancelBtn = $('<button>Nein</button>').addClass("bg-gray-400 rounded p-2 w-[60px] hover:cursor-pointer mr-2 hover:bg-gray-500");
            const $modalBody = $('<div></div>').addClass('flex flex-row justify-center items-center m-4 p-4');
            const $footer = $('<div></div>').addClass('flex flex-row justify-end gap-2 p-2 m-2');
        
            $footer.append(this.$saveBtn[0], $cancelBtn[0]);
            this.el.append($modalBody[0], $footer[0]);
            $cancelBtn.on('click', () => {
                this.close();
            });

        };

        if (this.props.rounded) {
            this.el.classList.add('rounded-md');
        }

        if (this.props.backdropOption) {

            $(this.backdrop).addClass('w-screen min-h-screen fixed inset-0 z-10 bg-neutral-950/20');
            document.body.classList.remove('overflow-auto');
            document.body.classList.add('overflow-hidden');
            document.body.append(this.backdrop);
            this.backdrop.onclick = () => {
                this.close();
            }
        }

        
        this.el.classList.add('modal');
        // this.el.style.width = `${this.props.width}px`;

        if (this.props.width) {
            this.el.classList.add(`${this.props.width}`);
        };
        if (this.props.height) {
            this.el.classList.add(`${this.props.height}`);
        };
        // this.el.style.height = `${this.props.height}px`;
        this.el.classList.add('bg-white');
        this.el.classList.add('cursor-pointer');

        // ensure the modal can receive focus to capture keyboard events
        // this.el.setAttribute('tabindex', '-1');

        this.el.addEventListener('pointerdown', () => {
            this.el.classList.remove('cursor-pointer');
            this.el.classList.add('cursor-grabbing');
        });

        this.el.addEventListener('pointerup', () => {
            this.el.classList.add('cursor-pointer');
            this.el.classList.remove('cursor-grabbing');
        });

        this.el.style.position = 'fixed';
        this.el.style.zIndex = '1000';
        this.el.style.top = '10%';
        this.el.style.left = '50%';

        this.el.style.left = `calc(50% - ${this.extractNumber(this.props.width)/2}px)`;

        $(this.el).draggable({
            containment: 'window'
        });
    
        this.$saveBtn.on('click', () => {
            this.publish('click',
                {
                   // ...
                }
            );

            this.close();   
        });

        KeyManager.getInstance().addModal(
            { 
                element: this, 
                Enter: () => {
                    this.$saveBtn[0].click();
                },
                Escape: () => {
                    this.close();
                }
            }
        );

        if (this.$input[0]) {
            this.$input[0].focus();
        } else {
            this.el.focus();

        }       
        
    };

    getInputValue() {
        if (this.$input[0]) {
            const input = this.$input[0] as HTMLInputElement;
            return input.value;
        }
    }

    // close modal and cleanup resources
    close() {
        this._cleanup();
        this.el.remove();    
    }

    private _cleanup() {
        if (this._cleaned) return;

        KeyManager.getInstance().removeModal();

        if (this.props.backdropOption) {
            document.body.classList.remove('overflow-hidden');
            document.body.classList.add('overflow-auto');
            this.backdrop.remove();
            this._cleaned = true;
        }
    }

    private extractNumber(str: string): number {
        const match = str.match(/\d+/);
        return parseInt(match[0], 10);
    }

    saveBtnOnClick(fn: (e?: any) => void) {
        this.subscribe('click', fn);  
    };
}