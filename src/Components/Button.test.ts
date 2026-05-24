/**
 * @jest-environment jsdom
 */
import { describe, test, expect, afterEach, jest } from '@jest/globals';

jest.mock('./Tooltip', () => ({
    Tooltip: {
        getInstance: () => ({
            setTarget() { return this; },
            setText() { return this; },
            show() { return this; },
            hide() { return this; },
        }),
    },
}));

import { Button } from './Button';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('Button — construction (default props)', () => {
    test('creates a div element on btn.el', () => {
        const btn = new Button();
        expect(btn.el).not.toBeNull();
        expect(btn.el.tagName).toBe('DIV');
    });

    test('applies default layout + style classes', () => {
        const btn = new Button();
        ['select-none', 'flex', 'items-center', 'justify-center',
         'cursor-pointer', 'w-[100px]', 'h-[100px]', 'bg-gray-200',
         'rounded', 'no-active-color'].forEach(cls => {
            expect(btn.el.classList.contains(cls)).toBe(true);
        });
        expect(btn.el.classList.contains('rounded-full')).toBe(false);
    });

    test('has empty textContent and no icon child when no text/icon given', () => {
        const btn = new Button();
        expect(btn.el.textContent).toBe('');
        expect(btn.el.querySelector('span')).toBeNull();
    });

    test('is not disabled by default', () => {
        const btn = new Button();
        expect(btn.isDisabled()).toBe(false);
    });
});

describe('Button — shape variants', () => {
    test('shape "circle" applies rounded-full and not rounded', () => {
        const btn = new Button({ shape: 'circle' });
        expect(btn.el.classList.contains('rounded-full')).toBe(true);
        expect(btn.el.classList.contains('rounded')).toBe(false);
    });

    test('shape "rounded" applies rounded and not rounded-full', () => {
        const btn = new Button({ shape: 'rounded' });
        expect(btn.el.classList.contains('rounded')).toBe(true);
        expect(btn.el.classList.contains('rounded-full')).toBe(false);
    });
});

describe('Button — activeColor branch', () => {
    test('without activeColor → "no-active-color" placeholder class', () => {
        const btn = new Button();
        expect(btn.el.classList.contains('no-active-color')).toBe(true);
    });

    test('with activeColor → that class set, no placeholder', () => {
        const btn = new Button({ activeColor: 'active:bg-blue-600' });
        expect(btn.el.classList.contains('active:bg-blue-600')).toBe(true);
        expect(btn.el.classList.contains('no-active-color')).toBe(false);
    });
});

describe('Button — text / icon rendering', () => {
    test('text only → textContent set, no icon span', () => {
        const btn = new Button({ text: 'Hello' });
        expect(btn.el.textContent).toBe('Hello');
        expect(btn.el.querySelector('span')).toBeNull();
        expect(btn.el.classList.contains('justify-between')).toBe(false);
    });

    test('icon only (no text) → span child without justify-between/px-4', () => {
        const btn = new Button({ icon: '<svg></svg>' });
        const span = btn.el.querySelector('span')!;
        expect(span).not.toBeNull();
        expect(span.innerHTML).toBe('<svg></svg>');
        expect(btn.el.classList.contains('justify-between')).toBe(false);
        expect(btn.el.classList.contains('px-4')).toBe(false);
    });

    test('icon + text, default position → icon as last child, justify-between added', () => {
        const btn = new Button({ text: 'Save', icon: '<svg></svg>' });
        expect(btn.el.classList.contains('justify-between')).toBe(true);
        expect(btn.el.classList.contains('px-4')).toBe(true);
        expect(btn.el.classList.contains('justify-center')).toBe(false);
        expect(btn.el.lastElementChild?.tagName).toBe('SPAN');
    });

    test('icon + text, iconPosition "left" → icon as first child', () => {
        const btn = new Button({
            text: 'Save',
            icon: '<svg></svg>',
            iconPosition: 'left',
        });
        expect(btn.el.firstElementChild?.tagName).toBe('SPAN');
        expect(btn.el.textContent).toContain('Save');
    });
});

describe('Button — hasIcon()', () => {
    test('returns falsy when no icon prop', () => {
        const btn = new Button();
        expect(btn.hasIcon()).toBeFalsy();
    });

    test('returns truthy when icon string is non-empty', () => {
        const btn = new Button({ icon: '<svg/>' });
        expect(btn.hasIcon()).toBeTruthy();
    });
});

describe('Button — onClick / event publishing', () => {
    test('click on el fires registered handler with payload {event, button, text}', () => {
        const btn = new Button({ text: 'Go' });
        document.body.appendChild(btn.el);
        const handler = jest.fn();
        btn.onClick(handler);

        btn.el.click();

        expect(handler).toHaveBeenCalledTimes(1);
        const payload = handler.mock.calls[0][0] as { event: MouseEvent; button: Button; text: string };
        expect(payload.button).toBe(btn);
        expect(payload.text).toBe('Go');
        expect(payload.event).toBeInstanceOf(Event);
    });

    test('multiple handlers all receive the click', () => {
        const btn = new Button();
        document.body.appendChild(btn.el);
        const a = jest.fn();
        const b = jest.fn();
        btn.onClick(a);
        btn.onClick(b);

        btn.el.click();

        expect(a).toHaveBeenCalledTimes(1);
        expect(b).toHaveBeenCalledTimes(1);
    });

    test('disabled button (via props) does not fire handler', () => {
        const btn = new Button({ disabled: true });
        document.body.appendChild(btn.el);
        const handler = jest.fn();
        btn.onClick(handler);

        btn.el.click();

        expect(handler).not.toHaveBeenCalled();
    });

    test('click does not bubble to parent (stopPropagation)', () => {
        const parent = document.createElement('div');
        const parentHandler = jest.fn();
        parent.addEventListener('click', parentHandler);

        const btn = new Button();
        parent.appendChild(btn.el);
        document.body.appendChild(parent);

        btn.el.click();

        expect(parentHandler).not.toHaveBeenCalled();
    });
});

describe('Button — disable / enable / isDisabled', () => {
    test('disable() flips state and swaps cursor classes', () => {
        const btn = new Button();
        btn.disable();

        expect(btn.isDisabled()).toBe(true);
        expect(btn.el.classList.contains('cursor-pointer')).toBe(false);
        expect(btn.el.classList.contains('opacity-50')).toBe(true);
        expect(btn.el.classList.contains('cursor-not-allowed')).toBe(true);
    });

    test('disable() blocks click handler', () => {
        const btn = new Button();
        document.body.appendChild(btn.el);
        const handler = jest.fn();
        btn.onClick(handler);

        btn.disable();
        btn.el.click();

        expect(handler).not.toHaveBeenCalled();
    });

    test('enable() after disable() restores state and re-allows clicks', () => {
        const btn = new Button();
        document.body.appendChild(btn.el);
        const handler = jest.fn();
        btn.onClick(handler);

        btn.disable();
        btn.enable();

        expect(btn.isDisabled()).toBe(false);
        expect(btn.el.classList.contains('cursor-pointer')).toBe(true);
        expect(btn.el.classList.contains('opacity-50')).toBe(false);
        expect(btn.el.classList.contains('cursor-not-allowed')).toBe(false);

        btn.el.click();
        expect(handler).toHaveBeenCalledTimes(1);
    });
});

describe('Button — addTooltip()', () => {
    test('binds mouseover and mouseleave handlers on el', () => {
        const btn = new Button();
        expect(btn.el.onmouseover).toBeNull();
        expect(btn.el.onmouseleave).toBeNull();

        btn.addTooltip('Hilfe');

        expect(typeof btn.el.onmouseover).toBe('function');
        expect(typeof btn.el.onmouseleave).toBe('function');
    });
});

describe('Button — destroy()', () => {
    test('removes el from DOM and nullifies the reference', () => {
        const btn = new Button();
        document.body.appendChild(btn.el);
        expect(document.body.contains(btn.el)).toBe(true);

        btn.destroy();

        expect(btn.el).toBeNull();
    });

    test('destroy clears subscribers — published click does not fire handler afterwards', () => {
        const btn = new Button();
        const handler = jest.fn();
        btn.onClick(handler);

        btn.destroy();
        btn.publish('click', { foo: 'bar' });

        expect(handler).not.toHaveBeenCalled();
    });
});

describe('Button — setIcon with argument (subclass path)', () => {
    class TestableButton extends Button {
        public callSetIcon(icon: string) {
            this.setIcon(icon);
        }
    }

    test('setIcon("<svg/>") resets innerHTML and renders new icon span', () => {
        const btn = new TestableButton({ icon: '<svg id="old"/>' });
        btn.callSetIcon('<svg id="new"/>');

        const span = btn.el.querySelector('span')!;
        expect(span).not.toBeNull();
        expect(span.querySelector('svg')?.id).toBe('new');
        expect(span.querySelector('svg[id="old"]')).toBeNull();
    });
});