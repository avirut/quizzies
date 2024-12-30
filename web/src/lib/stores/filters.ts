// filters.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

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
            // availableTossups: null // Reset count while loading
        }));

        // Then fetch the new count if we're in the browser
        if (browser) {
            const form = new FormData();
            form.append('difficulties', JSON.stringify(newDifficulties ?? initialFilters.difficulties));
            form.append('categories', JSON.stringify(newCategories ?? initialFilters.categories));

            try {
                const response = await fetch('?/getTossupCount', {
                    method: 'POST',
                    body: form
                });
                const data = await response.json();
                update(f => ({ ...f, availableTossups: JSON.parse(data.data)[1] }));
            } catch (error) {
                console.error('Error updating tossup count:', error);
                update(f => ({ ...f, availableTossups: null }));
            }
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