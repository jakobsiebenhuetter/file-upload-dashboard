export class DropZone {
    props: Record<string, any>;
    element: HTMLElement | null = null;
    width: string;
    height: string;
    backgroundColor: string;
    target: HTMLElement;
    text: string;

    constructor(props: Record<string, any>) {

        const defaults = {
            width:  'w-[100px]',
            height: 'h-[100px]',
            backgroundColor: 'bg-white',
            target: document.body,
            text: 'Text hinzufügen',
        };

        this.props = {... defaults, ...props};
    };

    show() {
        this.element = document.createElement('div');
        this.element.classList.add(this.props.width, this.props.height, this.props.backgroundColor,'pointer-events-none', 'rounded', 'border-4', 'border-dashed', 'border-blue-500', 'absolute', 'top-0', 'left-0', 'flex', 'justify-center', 'items-center', 'bg-opacity-50', 'z-100');
        this.element.innerText = this.props.text;
        const target = this.props.target as HTMLElement;
        target.style.position = 'relative';
        target.appendChild(this.element);
    };

    destroy() {
        this.element.remove();
    };


}