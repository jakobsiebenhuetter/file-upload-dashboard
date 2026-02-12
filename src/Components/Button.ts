import { Event } from './Event';


type ButtonProps = {
    shape?: 'circle' | 'rounded';
    text?: string;
    icon?: string;
    width?: string;
    height?: string;
    color?: string;
    hoverColor?: string;
    activeColor?: string;
}

export class Button extends Event {
    element = document.createElement('div');
    private props: ButtonProps;

    constructor(props?: ButtonProps) {
        super();
        const defaults: ButtonProps = {
            shape: 'rounded',
            text: 'Klick mich',
            icon: '',
            width: 'w-[100px]',
            height: 'h-[100px]',
            color: 'bg-gray-200',
            hoverColor: 'hover:bg-gray-300',
            // activeColor: 'active:bg-gray-400',
        };

        this.props = { ...defaults, ...props };
        this.renderUI();
        this.addListerner();
    }

    private addListerner(): void {
        this.element.onclick = (e) => {
            e.stopPropagation();
            this.publish('click', {
                event: e,
                button: this,
                text: this.props.text 
            });
        }
    }

    private renderUI(): void {
        this.element.classList.add('select-none','flex','items-center','justify-center','cursor-pointer',this.props.width,this.props.height,this.props.color, this.props.hoverColor, this.props.shape === 'circle' ? 'rounded-full' : 'rounded', this.props.activeColor ? this.props.activeColor : 'no-active-color');
        if(this.props.text) {
            this.element.textContent = this.props.text;
        }

        if(this.props.icon) {
            const iconElement = document.createElement('span');
            iconElement.innerHTML = this.props.icon;
            this.element.appendChild(iconElement);
        }
    }

    onClick(handler: (e) => void): void {
        this.subscribe('click', handler);
    }
}







//////////////////////////////////////////////////////////
// import $ from 'jquery';
// import '../styles.css';

// export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
// export type ButtonSize = 'sm' | 'md' | 'lg';

// export interface ButtonProps {
//     text?: string;
//     variant?: ButtonVariant;
//     size?: ButtonSize;
//     icon?: string;
//     iconPosition?: 'left' | 'right';
//     disabled?: boolean;
//     className?: string;
//     type?: 'button' | 'submit' | 'reset';       
// }

// export class Button {
//     protected props: ButtonProps;
//     private $element: JQuery<HTMLButtonElement>;

//     private static variantClasses: Record<ButtonVariant, string> = {
//         primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
//         secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300',
//         danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
//         success: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
//         ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
//     };

//     private static sizeClasses: Record<ButtonSize, string> = {
//         sm: 'px-2 py-1 text-sm',
//         md: 'px-4 py-2 text-base',
//         lg: 'px-6 py-3 text-lg',
//     };

//     constructor(props?: ButtonProps) {
//         const defaults: ButtonProps = {
//             text: 'Button',
//             variant: 'primary',
//             size: 'md',
//             iconPosition: 'left',
//             disabled: false,
//             type: 'button',
//         };

//         this.props = { ...defaults, ...props };
//         this.$element = $('<button></button>') as JQuery<HTMLButtonElement>;
//         this.renderUI();
//     }

//     getElement(): HTMLButtonElement {
//         return this.$element[0];
//     }

//     get $el(): JQuery<HTMLButtonElement> {
//         return this.$element;
//     }

//     getText(): string {
//         return this.props.text || '';
//     }

//     setText(text: string): this {
//         this.props.text = text;
//         this.updateContent();
//         return this;
//     }

//     setIcon(icon: string): this {
//         this.props.icon = icon;
//         this.updateContent();
//         return this;
//     }

//     setVariant(variant: ButtonVariant): this {
//         // Remove old variant classes
//         Object.values(Button.variantClasses).forEach((cls) => {
//             this.$element.removeClass(cls);
//         });
        
//         this.props.variant = variant;
//         this.$element.addClass(Button.variantClasses[variant]);
//         return this;
//     }

//     setSize(size: ButtonSize): this {
//         // Remove old size classes
//         Object.values(Button.sizeClasses).forEach((cls) => {
//             this.$element.removeClass(cls);
//         });
        
//         this.props.size = size;
//         this.$element.addClass(Button.sizeClasses[size]);
//         return this;
//     }

//     enable(): this {
//         this.props.disabled = false;
//         this.$element.prop('disabled', false).removeClass('opacity-50 cursor-not-allowed');
//         return this;
//     }

//     disable(): this {
//         this.props.disabled = true;
//         this.$element.prop('disabled', true).addClass('opacity-50 cursor-not-allowed');
//         return this;
//     }

//     isDisabled(): boolean {
//         return this.props.disabled || false;
//     }

//     private updateContent(): void {
//         this.$element.empty();

//         const { text, icon, iconPosition } = this.props;

//         if (icon && iconPosition === 'left') {
//             this.$element.append($('<span></span>').addClass('mr-2').html(icon));
//         }

//         if (text) {
//             this.$element.append($('<span></span>').text(text));
//         }

//         if (icon && iconPosition === 'right') {
//             this.$element.append($('<span></span>').addClass('ml-2').html(icon));
//         }
//     }

//     private renderUI(): void {
//         const { variant, size, disabled, className, type } = this.props;

//         const baseClasses = 'inline-flex items-center justify-center rounded border font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';

//         this.$element
//             .attr('type', type || 'button')
//             .addClass(baseClasses)
//             .addClass(Button.variantClasses[variant || 'primary'])
//             .addClass(Button.sizeClasses[size || 'md']);

//         if (className) {
//             this.$element.addClass(className);
//         }

//         if (disabled) {
//             this.disable();
//         }

//         this.updateContent();
//     }

//     onClick(handler: (e) => void): this {
//         this.$element.on('click', (e) => {
//             if (!this.props.disabled) {
//                 handler(e);
//             }
//         });
//         return this;
//     }

//     offClick(): this {
//         this.$element.off('click');
//         return this;
//     }

//     destroy(): void {
//         this.$element.off();
//         this.$element.remove();
//     }
// }
