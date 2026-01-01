import { Event } from './Event';

export class Spinner extends Event {
    props: Record<string, any> = {};
    element: HTMLElement | null = null;
    backdrop: HTMLElement | null = null;
    constructor(props?: Record<string, any>) {
        super();

        const defaults: Record<string, any> = {};

        this.props = { ...defaults, ...props }
        this.renderUI();
    }


    renderUI() {
        if(this.props.backdropOption) {
            const backdrop = document.createElement('div');
            backdrop.classList.add('w-screen','h-screen', 'absolute', 'z-10','bg-neutral-950/20');
            document.body.append(backdrop);
            this.backdrop = backdrop;
        };

        const element = document.createElement('div');
        element.classList.add('absolute', 'w-16', 'h-16',  'border-4', 'rounded-full', 'animate-spin', 'border-t-blue-600', 'border-r-blue-600', 'm-4');
        document.body.append(element);
        this.element = element;
    };

    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
        if (this.backdrop) {
            this.backdrop.remove();
            this.backdrop = null;
        }
    };

}