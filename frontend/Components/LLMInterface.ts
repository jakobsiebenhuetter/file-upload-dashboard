import { Event } from './Event';
import { Button } from './Button';

type MessageRole = 'user' | 'ai';

export class LLMInterface extends Event {
    private static instance: LLMInterface;

    el: HTMLElement = document.createElement('div');
    private chatArea: HTMLElement = document.createElement('div');
    private textField: HTMLTextAreaElement = document.createElement('textarea');
    private typingIndicator: HTMLElement = document.createElement('div');
    private messages: Array<{ role: MessageRole; text: string }> = [];
    private focus: string | null = null;

    private constructor() {
        super();
        this.renderUI();
    }

    private renderUI(): void {
        this.el.classList.add(
            'fixed', 'z-1',
            'w-[400px]', 'h-[520px]',
            'bg-white', 'rounded-xl', 'shadow-lg',
            'border', 'border-slate-200',
            'flex', 'flex-col',
            'overflow-hidden'
        );
        this.el.style.bottom = '24px';
        this.el.style.right = '24px';
        this.el.style.display = 'none';

        this.renderHeader();
        this.renderChatArea();
        this.renderInputArea();

        document.body.appendChild(this.el);
    }

    private renderHeader(): void {
        const header = document.createElement('div');
        header.classList.add(
            'flex', 'items-center', 'justify-between',
            'bg-stone-200',
            'px-4', 'py-3',
            'rounded-t-xl',
            'select-none'
        );

        const titleWrapper = document.createElement('div');
        titleWrapper.classList.add('flex', 'items-center', 'gap-2');

        const icon = document.createElement('span');
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-green-600"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"/></svg>`;

        const title = document.createElement('span');
        title.classList.add('font-semibold', 'text-slate-700', 'text-sm');
        title.textContent = 'Dokumenten-Assistent';

        titleWrapper.append(icon, title);

        const closeBtn = document.createElement('div');
        closeBtn.classList.add(
            'cursor-pointer',
            'bg-gray-300', 'hover:bg-gray-400',
            'rounded', 'p-1',
            'transition-colors', 'duration-150'
        );
        closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>`;
        closeBtn.addEventListener('click', () => this.close());

        header.append(titleWrapper, closeBtn);
        this.el.appendChild(header);
    }

    private renderChatArea(): void {
        this.chatArea.classList.add(
            'flex-1',
            'overflow-y-auto',
            'p-4',
            'flex', 'flex-col',
            'gap-3',
            'bg-stone-50'
        );

        this.typingIndicator.classList.add(
            'flex', 'items-center', 'gap-1',
            'px-4', 'py-3',
            'bg-white',
            'rounded-xl', 'rounded-tl-none',
            'border', 'border-slate-200',
            'w-fit',
            'shadow-sm',
            'hidden'
        );
        this.typingIndicator.innerHTML = `
            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
        `;
        this.chatArea.appendChild(this.typingIndicator);

        this.addMessage('ai', 'Hallo! Ich bin der Dokumenten-Assistent. Stelle mir eine Frage zu deinen Dateien.');

        this.el.appendChild(this.chatArea);
    }

    private renderInputArea(): void {
        const inputArea = document.createElement('div');
        inputArea.classList.add(
            'flex', 'items-end',
            'gap-2',
            'p-3',
            'border-t', 'border-slate-200',
            'bg-white'
        );

        this.textField.classList.add(
            'flex-1',
            'p-2.5',
            'text-sm',
            'rounded-lg',
            'border', 'border-gray-300',
            'focus:outline-none', 'focus:ring-2', 'focus:ring-green-500', 'focus:border-transparent',
            'resize-none',
            'max-h-[100px]',
            'bg-white',
            'text-slate-800'
        );
        this.textField.setAttribute('placeholder', 'Stelle eine Frage...');
        this.textField.setAttribute('rows', '1');

        this.textField.addEventListener('input', () => {
            this.textField.style.height = 'auto';
            this.textField.style.height = Math.min(this.textField.scrollHeight, 100) + 'px';
        });

        this.textField.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        const sendIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/></svg>`;
        const sendBtn = new Button({
            icon: sendIcon,
            shape: 'circle',
            color: 'bg-green-500',
            hoverColor: 'hover:bg-green-600',
            activeColor: 'active:bg-green-700',
            width: 'w-[36px]',
            height: 'h-[36px]'
        });
        sendBtn.el.classList.add('text-white', 'shrink-0');
        sendBtn.onClick(() => this.handleSend());

        inputArea.append(this.textField, sendBtn.el);
        this.el.appendChild(inputArea);
    }

    set setFocus(focus: string) {
        this.focus = focus;
    }

    get getFocus(): string | null {
        return this.focus;
    }

    private handleSend(): void {
        const text = this.textField.value.trim();
        if (!text) return;

        this.addMessage('user', text);
        this.textField.style.height = 'auto';

        this.showTyping();
        this.publish('send');
    }

    addMessage(role: MessageRole, text: string): void {
        this.messages.push({ role, text });

        const wrapper = document.createElement('div');
        wrapper.classList.add('flex', role === 'user' ? 'justify-end' : 'justify-start');

        const bubble = document.createElement('div');
        bubble.classList.add(
            'max-w-[80%]',
            'px-4', 'py-2.5',
            'text-sm',
            'leading-relaxed',
            'shadow-sm'
        );

        if (role === 'user') {
            bubble.classList.add(
                'bg-green-500',
                'text-white',
                'rounded-xl', 'rounded-tr-none'
            );
        } else {
            bubble.classList.add(
                'bg-white',
                'text-slate-700',
                'border', 'border-slate-200',
                'rounded-xl', 'rounded-tl-none'
            );
        }

        bubble.textContent = text;
        wrapper.appendChild(bubble);

        this.chatArea.insertBefore(wrapper, this.typingIndicator);
        this.chatArea.scrollTop = this.chatArea.scrollHeight;
    }

    receiveMessage(text: string): void {
        this.hideTyping();
        this.addMessage('ai', text);
    }

    showTyping(): void {
        this.typingIndicator.classList.remove('hidden');
        this.chatArea.scrollTop = this.chatArea.scrollHeight;
    }

    hideTyping(): void {
        this.typingIndicator.classList.add('hidden');
    }

    getInputValue(): string {
        let inputText = this.textField.value.trim();
        this.textField.value = '';
        console.log('Input Value: ', inputText);
        return inputText;
    }

    static getInstance(): LLMInterface {
        if (!LLMInterface.instance) {
            LLMInterface.instance = new LLMInterface();
        }
        return LLMInterface.instance;
    }

    show(): void {
        this.el.style.display = 'flex';
        this.el.classList.add('llm-chat-enter');
        this.textField.focus();
    }

    close(): void {
        this.el.style.display = 'none';
        this.el.classList.remove('llm-chat-enter');
    }

    onSend(fn: () => void): void {
        this.subscribe('send',fn);
    }
}
