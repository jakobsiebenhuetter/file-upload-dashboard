/**
 * @jest-environment jsdom
 */
import {describe, test, expect, afterEach} from '@jest/globals';
import { Spinner } from './Spinner';

afterEach(() => {
    document.body.innerHTML = '';
});

test('use jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});

test('Create Spinner with backdrop and icon', () => {
    new Spinner({
        backdropOption: {
            darkMode: 'dark:bg-slate-700', 
            default: 'bg-slate-400'
        },
        icon: true,
    });

    const spinnerContainer = document.querySelector('.spinner-container');
    expect(spinnerContainer).not.toBeNull();
    expect(document.getElementById('spinner-backdrop')).not.toBeNull();
});

test('Destroy Spinner', () => {
    const spinner = new Spinner({
        backdropOption: {
            darkMode: 'dark:bg-slate-700', 
            default: 'bg-slate-400'
        },
        icon: true,
    });

    const spinnerContainer = document.querySelector('.spinner-container');
    expect(spinnerContainer).not.toBeNull();
    spinner.destroy();
    const destroyedContainer = document.querySelector('.spinner-container');
    expect(destroyedContainer).toBeNull();
});

