import '../styles.css';

type Position = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
    text: string,
    element?: HTMLElement,
    position?: Position,
}

// Singleton Pattern für Tooltip
export class Tooltip {
    protected props: TooltipProps;
    private static instance: Tooltip;
    private position: Position | null = null;
    el: HTMLElement;
    target: HTMLElement = null;

    private constructor(props?: TooltipProps) {
        const defaults: TooltipProps = { 
            text: 'Tooltip',
            position: 'top'
        };

        this.props = { ...defaults, ...props };
        this.build();
    }

    private build(): void {
        this.el = document.createElement('div');
        this.el.className = 'fixed rounded p-2 text-white bg-neutral-900/90 z-50 pointer-events-none';
        this.el.style.transition = 'opacity 0.2s ease';
        this.el.style.opacity = '0';
        this.el.style.left = '0px';
        this.el.style.top = '0px';
        document.body.appendChild(this.el);
    }

    static getInstance() {
        if(Tooltip.instance) {
            console.log( 'Tooltip instance exists' );
            return Tooltip.instance;
        }

        Tooltip.instance = new Tooltip();
        console.log( 'Tooltip instance created' );
        return Tooltip.instance;
    }

    setTarget(target: HTMLElement) {
        this.target = target;
        return this;
    }

    setText(text: string) { 
        this.props.text = text;
        this.el.textContent = text;
        return this;
    }

    show() {
        this.updatePosition(this.target);
        this.el.style.opacity = '1';
    }

    hide() {
        this.el.style.opacity = '0';
    };

    updatePosition(target: HTMLElement) {
        let top = 0;
        let left = 0;

        const rect = this.el.getBoundingClientRect();
        this.target = target as HTMLElement;
        const targetRect = this.target.getBoundingClientRect();
        
        switch(this.props.position) {
            case 'top': {
                top = targetRect.top - rect.height - 5;
                left = targetRect.left + (targetRect.width / 2);
                break;
            }

            default: {
                console.warn('Position für Tooltip nicht implementiert: ', this.props.position);
                break;
            }
        }

        this.el.style.top = `${top}px`;
        this.el.style.left = `${left}px`;
    }

}