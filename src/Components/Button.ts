import { Event } from './Event';

type Position = 'left' | 'right';
type ButtonProps = {
    id?: string;
    shape?: 'circle' | 'rounded';
    text?: string;
    icon?: string;
    iconPosition?: Position;
    width?: string;
    height?: string;
    disabled?: boolean;
    color?: string;
    hoverColor?: string;
    activeColor?: string;
}

export class Button extends Event {
    el = document.createElement('div');
    public props: ButtonProps;

    constructor(props?: ButtonProps) {
        super();
        const defaults: ButtonProps = {
            shape: 'rounded',
            text: '',
            icon: '',
            disabled: false,
            width: 'w-[100px]',
            height: 'h-[100px]',
            color: 'bg-gray-200',
            // hoverColor: 'hover:bg-gray-300',
            // activeColor: 'active:bg-gray-400',
        };

        this.props = { ...defaults, ...props };
        this.renderUI();
        this.addListener();
    }

    private addListener(): void {
        this.el.onclick = (e) => {
            e.stopPropagation();
            if(this.props.disabled) return;

            this.publish('click', {
                event: e,
                button: this,
                text: this.props.text 
            });
        }
    }

    private renderUI(): void {
        this.el.classList.add('select-none','flex','items-center','justify-center','cursor-pointer',this.props.width,this.props.height,this.props.color, this.props.hoverColor, this.props.shape === 'circle' ? 'rounded-full' : 'rounded', this.props.activeColor ? this.props.activeColor : 'no-active-color');
        if(this.props.text) {
            this.el.textContent = this.props.text;
        }

        if(this.hasIcon()) {
            this.setIcon();
        }
    }

    onClick(handler: (e?: any) => void): void {
        this.subscribe('click', handler);
    }

    private hasIcon(): boolean {
        return this.props.icon && this.props.icon.length > 0;
    }

    private setIcon(): void {
        const iconElement = document.createElement('span');
        iconElement.innerHTML = this.props.icon;
        
        if(this.props.text.length) {
            this.el.classList.add('justify-between', 'px-4');
            this.el.classList.remove('justify-center');
            if(this.props.iconPosition === 'left') {
                this.el.textContent = this.props.text;
                this.el.insertAdjacentElement('afterbegin', iconElement);
                return;
            }
        }  
        this.el.appendChild(iconElement);
    }

    disable(): void {
        this.props.disabled = true;
        this.el.classList.remove('cursor-pointer');
        this.el.classList.add('opacity-50', 'cursor-not-allowed');
    }

    enable(): void {
        this.props.disabled = false;
        this.el.classList.remove('opacity-50', 'cursor-not-allowed');
        this.el.classList.add('cursor-pointer');
    }

    isDisabled(): boolean {
        return this.props.disabled;
    }

    destroy(): void {
        this.el.remove();
        this.clearAll();
        this.el = null;
    }
}