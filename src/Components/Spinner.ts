type TBackDropTransparent = 'bg-transparent';

type TBackDropNoneTransparent = {
    default: 'bg-slate-400',
    darkMode: 'dark:bg-slate-700'
}

type TBackDropStyle = TBackDropTransparent | TBackDropNoneTransparent;

export type TSpinnerProps = {
    backdropOption?: TBackDropStyle;
    icon?: boolean;
};

export class Spinner {
    private static readonly defaultIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-blue-600 dark:text-blue-400"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" /></svg>`;

    props: Record<string, any> = {};
    container: HTMLElement | null = null;
    spinner: HTMLElement | null = null;
    icon: boolean | null = null;
    backdrop: HTMLElement | null = null;

    constructor(props?: TSpinnerProps) {
        const defaults: Record<string, any> = {};

        this.props = { ...defaults, ...props };
        this.renderUI();
    }

    renderUI(): void {
        this.container = document.createElement('div');
        this.container.classList.add(
            'spinner-container',
            'fixed',
            'top-1/2',
            'left-1/2',
            'z-11',
            '-translate-x-1/2',
            '-translate-y-1/2',
            'flex',
            'flex-col',
            'items-center',
            'gap-3',
        );

        if (this.props.backdropOption) {
            this.backdrop = document.createElement('div');
            this.backdrop.setAttribute('id', 'spinner-backdrop');

            if (typeof this.props.backdropOption === 'string') 
                {
                    this.backdrop.classList.add('fixed', 'inset-0', 'z-10', this.props.backdropOption);
                }

            if (typeof this.props.backdropOption === 'object')
                {
                    this.backdrop.classList.add('fixed', 'inset-0', 'z-10', this.props.backdropOption.default, this.props.backdropOption.darkMode);
                }

                document.body.append(this.backdrop);
            }

        if (this.props.icon) {
            const icon = document.createElement('div');
            icon.classList.add('flex', 'items-center', 'justify-center');
            icon.innerHTML = Spinner.defaultIconSVG;
            this.container.append(icon);
        }

        this.spinner = document.createElement('div');
        this.spinner.classList.add(
            'w-12',
            'h-12',
            'border-4',
            'rounded-full',
            'animate-spin',
            'border-t-blue-600',
            'border-r-blue-600',
        );
        this.container.append(this.spinner);

        document.body.append(this.container);
    }

    destroy(): void {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        if (this.backdrop) {
            this.backdrop.remove();
            this.backdrop = null;
        }
    }
}
