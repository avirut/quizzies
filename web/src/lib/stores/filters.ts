// filters.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface Filters {
    difficulties: number[],
    categories: string[]
}

export const DIFFICULTIES = [1, 2, 3, 4, 5];
export const CATEGORIES = [
    'Current Events',
    'Fine Arts',
    'Geography',
    'History',
    'Literature',
    'Mythology',
    'Other Academic',
    'Philosophy',
    'Religion',
    'Science',
    'Social Science',
    'Trash'
];

const defaultFilters: Filters = {
    difficulties: DIFFICULTIES,
    categories: CATEGORIES
};

// Load from localStorage if available
const initialFilters = browser 
    ? JSON.parse(localStorage.getItem('quizzies-filters') ?? JSON.stringify(defaultFilters))
    : defaultFilters;

export const filters = writable<Filters>(initialFilters);

// Persist to localStorage when changed
if (browser) {
    filters.subscribe(value => {
        localStorage.setItem('quizzies-filters', JSON.stringify(value));
    });
}