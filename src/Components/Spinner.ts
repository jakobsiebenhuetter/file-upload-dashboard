type BackdropStyle = 'grey-transparent' | 'white';
type SpinnerProps = {
    // ...
}

export class Spinner {
    props: Record<string, any> = {};
    element: HTMLElement | null = null;
    backdrop: HTMLElement | null = null;

    constructor(props?: Record<string, any>) {
        const defaults: Record<string, any> = {};

        this.props = { ...defaults, ...props }
        this.renderUI();
    }
    
    renderUI(): void {
        if(this.props.backdropOption) {
            const backdrop = document.createElement('div');
            backdrop.classList.add('fixed', 'inset-0', 'z-10','bg-neutral-950/20');
            document.body.style.overflow = 'hidden';
            document.body.append(backdrop);
            this.backdrop = backdrop;
        };

        const element = document.createElement('div');
        element.classList.add('absolute', 'top-[50%]', 'left-[50%]', 'z-11', '-translate-x-1/2', '-translate-y-1/2','w-16', 'h-16',  'border-4', 'rounded-full', 'animate-spin', 'border-t-blue-600', 'border-r-blue-600', 'm-4');
        document.body.append(element);
        this.element = element;
    };

    destroy(): void {
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