import '../styles.css';

import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';

import { Event } from './Event';
import { KeyManager } from '../Services/KeyManager';


export class Modal extends Event{

    protected props: Record<string, any> = {};
    private default: boolean = false;
    private disabled: boolean = false;
    private _cleaned: boolean = false;

    element: HTMLElement = document.createElement('div');
    $closeBtn: JQuery = $(`<div><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></div>`).addClass('cursor-pointer bg-red-200 rounded p-2');
    $saveBtn = $('<button>Speichern</button>').addClass("bg-amber-600 rounded p-2 hover:cursor-pointer");
    $input = $('<input class="bg-amber-50"/>');
    width: string = 'w-[400px]';
    height: string = 'h-[400px]';
    rounded: boolean = false;
    color: string = 'lightgray';
    text: string = '';
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

        const $header = $('<div></div>').addClass('p-2 m-2');
        $header.append(this.$closeBtn);
        $header.addClass('flex flex-row justify-end items-align');
        this.element.append($header[0]);

        this.$closeBtn.on('click', () => {
            this.close();
        });

        if (this.props.default) {

            const $footer = $('<div></div>').addClass('flex flex-row justify-end p-2 m-2');
            const $modalBody = $('<div></div>').addClass('flex flex-row justify-between m-2 p-2');

           
            $modalBody.append('<span class="mr-2">Ordnernamen</span>').append(this.$input);
            $footer.append(this.$saveBtn);

            const observer = new MutationObserver((mutations, observe) => {
                (this.$input[0] as HTMLElement).focus();
                observe.disconnect();
            });
            observer.observe(this.element, { childList: true });

            this.$input.on('focus', () => {
                this.$input.addClass('outline-2 outline-green-500');
            });


            this.element.append($modalBody[0], $footer[0]);

        } else if(this.props.confirmModal) {
            this.$saveBtn.text('Ja');
            const $cancelBtn = $('<button>Nein</button>').addClass("bg-gray-400 rounded p-2 hover:cursor-pointer mr-2");
            const $modalBody = $('<div></div>').addClass('flex flex-row justify-center items-center m-4 p-4 text-center');
            const $footer = $('<div></div>').addClass('flex flex-row justify-between p-2 m-2');
            $modalBody.append(`<span>${this.props.text}</span>`);
            $footer.append($cancelBtn[0], this.$saveBtn[0]);
            this.element.append($modalBody[0], $footer[0]);
            $cancelBtn.on('click', () => {
                this.close();
            });

        };

        if (this.props.rounded) {
            this.element.classList.add('rounded-md');
        }

        if (this.props.backdropOption) {

            this.backdrop.classList.add('w-screen', 'h-screen', 'absolute', 'z-10', 'bg-neutral-950/20');
            document.body.append(this.backdrop);
            this.backdrop.onclick = () => {
                this.close();
            }
        }

        
        this.element.classList.add('modal');
        // this.element.style.width = `${this.props.width}px`;

        if (this.props.width) {
            this.element.classList.add(`${this.props.width}`);
        };
        if (this.props.height) {
            this.element.classList.add(`${this.props.height}`);
        };
        // this.element.style.height = `${this.props.height}px`;
        this.element.classList.add('bg-stone-500');
        this.element.classList.add('cursor-pointer');

        // ensure the modal can receive focus to capture keyboard events
        // this.element.setAttribute('tabindex', '-1');

        this.element.addEventListener('pointerdown', () => {
            this.element.classList.remove('cursor-pointer');
            this.element.classList.add('cursor-grabbing');
        });

        this.element.addEventListener('pointerup', () => {
            this.element.classList.add('cursor-pointer');
            this.element.classList.remove('cursor-grabbing');
        });

        this.element.style.position = 'absolute';
        this.element.style.zIndex = '1000';
        this.element.style.top = '10%';

        $(this.element).draggable({
            containment: 'window'
        });
        // this.element.style.left = '50%';
        this.element.style.left = `calc(50% - ${this.props.width / 2}px)`;
        
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
            this.element.focus();

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
        this.element.remove();    
    }

    private _cleanup() {
        if (this._cleaned) return;

        KeyManager.getInstance().removeModal();

        if (this.props.backdropOption) {
            this.backdrop.remove();
            this._cleaned = true;
        }
    }

    saveBtnOnClick(fn: (e?: any) => void) {
        this.subscribe('click', fn)  
    };
}