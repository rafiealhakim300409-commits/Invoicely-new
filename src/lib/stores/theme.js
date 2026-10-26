import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'invoicely-theme';

function createThemeStore() {
	const initial = browser
		? localStorage.getItem(STORAGE_KEY) ||
			(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
		: 'light';

	const { subscribe, set, update } = writable(initial);

	return {
		subscribe,
		set: (value) => {
			if (browser) {
				localStorage.setItem(STORAGE_KEY, value);
				document.documentElement.classList.toggle('dark', value === 'dark');
			}
			set(value);
		},
		toggle: () => {
			update((current) => {
				const next = current === 'dark' ? 'light' : 'dark';
				if (browser) {
					localStorage.setItem(STORAGE_KEY, next);
					document.documentElement.classList.toggle('dark', next === 'dark');
				}
				return next;
			});
		},
		init: () => {
			if (browser) {
				document.documentElement.classList.toggle('dark', initial === 'dark');
			}
		}
	};
}

export const theme = createThemeStore();
