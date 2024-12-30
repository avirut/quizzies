import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface Settings {
    theme: string
}

const defaultSettings: Settings = {
    theme: 'system',
};

// Load from localStorage if available
const initialSettings = browser 
    ? JSON.parse(localStorage.getItem('quizzies-settings') ?? JSON.stringify(defaultSettings))
    : defaultSettings;

export const settings = writable<Settings>(initialSettings);

// Persist to localStorage when changed
if (browser) {
    settings.subscribe(value => {
        localStorage.setItem('quizzies-settings', JSON.stringify(value));
    });
}