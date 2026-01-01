import $ from 'jquery';
import '../styles.css';

// using JQuery
export class Badge {
    
    protected props: Record<string, any> = {};
    private $element: JQuery = $('<div></div>');
    protected $thumbNailContainer: JQuery;
    protected $infoContainer: JQuery;
    result: any;
    width: number = 20;
    height: number = 20;
    color: string = 'lightgray';
    text: string = 'Badge';
    constructor(props?: Record<string, any>) {
        
        const defaults = {
           width: this.width,
           height: this.height,
           color: this.color,
           text: this.text,
        }

        this.props = { ...defaults, ...props };
        this.renderUI();
    }

    getElement(): HTMLElement {
        return this.$element[0];
    }

    getText(): string {
        return this.props.text;
    };

    setText(text: string): void {
        if(!text) throw new Error('Bitte einen validen Text hinzufügen');
        this.props.text = text;
        this.$element.text(this.props.text);

    }

    renderUI(): void {     
        this.$element.text(this.props.text).addClass('w-[50px] bg-cyan-700 rounded flex justify-center items-center');     
    }

    onCLick(handler: (e?: any) => any): void {
        this.$element.on('click', (e) => {
            this.result = handler(e);
        })
    };

    getResponse() {
        return this.result;
    }
}