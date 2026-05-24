/**
 * @jest-environment jsdom
 */
import { describe, test, expect, afterEach } from '@jest/globals';
import { Spinner } from './Spinner';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('Spinner — construction (default / minimal props)', () => {
    test('mounts container on document.body', () => {
        new Spinner();
        expect(document.querySelector('.spinner-container')).not.toBeNull();
    });

    test('container has all layout classes', () => {
        new Spinner();
        const c = document.querySelector('.spinner-container')!;
        ['fixed', 'top-1/2', 'left-1/2', 'z-11',
         '-translate-x-1/2', '-translate-y-1/2',
         'flex', 'flex-col', 'items-center', 'gap-3'].forEach(cls => {
            expect(c.classList.contains(cls)).toBe(true);
        });
    });

    test('spinner ring is appended to container with ring classes', () => {
        new Spinner();
        const ring = document.querySelector('.spinner-container > .animate-spin')!;
        expect(ring).not.toBeNull();
        ['w-12', 'h-12', 'border-4', 'rounded-full',
         'border-t-blue-600', 'border-r-blue-600'].forEach(cls => {
            expect(ring.classList.contains(cls)).toBe(true);
        });
    });

    test('no backdrop and no icon when no props provided', () => {
        new Spinner();
        expect(document.getElementById('spinner-backdrop')).toBeNull();
        expect(document.querySelector('.spinner-container svg')).toBeNull();
    });

    test('instance exposes container + spinner refs, backdrop null, icon null', () => {
        const s = new Spinner();
        expect(s.container).not.toBeNull();
        expect(s.spinner).not.toBeNull();
        expect(s.backdrop).toBeNull();
        expect(s.icon).toBeNull();
    });
});

describe('Spinner — icon option', () => {
    test('icon: true renders cloud-upload SVG inside container', () => {
        new Spinner({ icon: true });
        const wrapper = document.querySelector('.spinner-container > .flex.items-center.justify-center')!;
        expect(wrapper).not.toBeNull();

        const svg = wrapper.querySelector('svg')!;
        expect(svg).not.toBeNull();
        ['w-12', 'h-12', 'text-blue-600', 'dark:text-blue-400'].forEach(cls => {
            expect(svg.classList.contains(cls)).toBe(true);
        });

        const path = svg.querySelector('path')!;
        expect(path.getAttribute('d')).toMatch(/^M12 16\.5V9\.75/);
    });

    test('icon: false renders no SVG', () => {
        new Spinner({ icon: false });
        expect(document.querySelector('.spinner-container svg')).toBeNull();
    });
});

describe('Spinner — backdrop variants', () => {
    test('string variant "bg-transparent" adds transparent class', () => {
        new Spinner({ backdropOption: 'bg-transparent' });
        const b = document.getElementById('spinner-backdrop')!;
        expect(b).not.toBeNull();
        ['fixed', 'inset-0', 'z-10', 'bg-transparent'].forEach(cls => {
            expect(b.classList.contains(cls)).toBe(true);
        });
    });

    test('object variant adds default + darkMode classes', () => {
        new Spinner({
            backdropOption: { default: 'bg-slate-400', darkMode: 'dark:bg-slate-700' },
        });
        const b = document.getElementById('spinner-backdrop')!;
        ['fixed', 'inset-0', 'z-10', 'bg-slate-400', 'dark:bg-slate-700'].forEach(cls => {
            expect(b.classList.contains(cls)).toBe(true);
        });
    });

    test('backdrop is appended to document.body, not to container', () => {
        new Spinner({ backdropOption: 'bg-transparent' });
        const b = document.getElementById('spinner-backdrop')!;
        expect(b.parentElement).toBe(document.body);
    });
});

describe('Spinner — destroy()', () => {
    test('removes container and backdrop from DOM and nullifies refs', () => {
        const s = new Spinner({
            backdropOption: { default: 'bg-slate-400', darkMode: 'dark:bg-slate-700' },
            icon: true,
        });

        s.destroy();

        expect(document.querySelector('.spinner-container')).toBeNull();
        expect(document.getElementById('spinner-backdrop')).toBeNull();
        expect(s.container).toBeNull();
        expect(s.backdrop).toBeNull();
    });

    test('double destroy does not throw (covers null-guards)', () => {
        const s = new Spinner({ backdropOption: 'bg-transparent' });
        s.destroy();
        expect(() => s.destroy()).not.toThrow();
    });
});

describe('Spinner — multiple instances', () => {
    test('two instances mount independently and destroy independently', () => {
        const a = new Spinner();
        const b = new Spinner({ backdropOption: 'bg-transparent' });

        expect(document.querySelectorAll('.spinner-container').length).toBe(2);
        expect(document.querySelectorAll('#spinner-backdrop').length).toBe(1);

        a.destroy();
        expect(document.querySelectorAll('.spinner-container').length).toBe(1);
        expect(document.getElementById('spinner-backdrop')).not.toBeNull();

        b.destroy();
        expect(document.querySelectorAll('.spinner-container').length).toBe(0);
        expect(document.getElementById('spinner-backdrop')).toBeNull();
    });
});
