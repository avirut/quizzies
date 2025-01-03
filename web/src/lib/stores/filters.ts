// filters.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { fetchTossupCount } from '$lib/utils';

interface Filters {
    difficulties: number[],
    categories: string[],
    availableTossups: number | null
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
    categories: CATEGORIES,
    availableTossups: null
};

// Load from localStorage if available
const initialFilters = browser 
    ? {
        ...JSON.parse(localStorage.getItem('quizzies-filters') ?? JSON.stringify(defaultFilters)),
        availableTossups: null
    }
    : defaultFilters;

function createFiltersStore() {
    const { subscribe, set, update } = writable<Filters>(initialFilters);

    async function updateFilters(newDifficulties?: number[], newCategories?: string[]) {
        // First update the filters
        update(f => ({
            ...f,
            difficulties: newDifficulties ?? f.difficulties,
            categories: newCategories ?? f.categories,
        }));

        if (newDifficulties && newCategories) {
            fetchTossupCount(newDifficulties, newCategories).then(count => update(f => ({ ...f, availableTossups: count })));
        }
    }

    // Initialize count on store creation if in browser
    if (browser) {
        updateFilters(initialFilters.difficulties, initialFilters.categories);
    }

    return {
        subscribe,
        updateFilters,
        reset: () => {
            set(defaultFilters);
            if (browser) {
                updateFilters(defaultFilters.difficulties, defaultFilters.categories);
            }
        }
    };
}

export const filters = createFiltersStore();

// Persist to localStorage when changed (but don't save availableTossups)
if (browser) {
    filters.subscribe(value => {
        const { availableTossups, ...persistedValues } = value;
        localStorage.setItem('quizzies-filters', JSON.stringify(persistedValues));
    });
}