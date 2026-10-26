import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const DEFAULT_USER = {
	id: 'usr-101',
	name: 'Budi Santoso',
	email: 'budi@bisniskamu.com',
	businessName: 'Bisnis Kamu',
	phone: '081234567890',
	avatar: 'B'
};

function createAuthStore() {
	let initial = DEFAULT_USER;

	if (browser) {
		try {
			const saved = localStorage.getItem('invoicely_user');
			if (saved !== null) {
				initial = saved ? JSON.parse(saved) : null;
			}
		} catch (e) {
			console.error('Error loading user from localStorage:', e);
		}
	}

	const { subscribe, set, update } = writable(initial);

	function persist(user) {
		if (browser) {
			try {
				if (user) {
					localStorage.setItem('invoicely_user', JSON.stringify(user));
				} else {
					localStorage.removeItem('invoicely_user');
				}
			} catch (e) {
				console.error('Error saving user to localStorage:', e);
			}
		}
	}

	return {
		subscribe,
		login: (email, password) => {
			const name = email.split('@')[0];
			const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
			const user = {
				id: `usr-${Date.now()}`,
				name: formattedName,
				email: email,
				businessName: `${formattedName} Studio`,
				avatar: formattedName.charAt(0).toUpperCase()
			};
			persist(user);
			set(user);
			return user;
		},
		loginDemo: () => {
			persist(DEFAULT_USER);
			set(DEFAULT_USER);
			return DEFAULT_USER;
		},
		register: (data) => {
			const user = {
				id: `usr-${Date.now()}`,
				name: data.name || 'Pengguna Baru',
				email: data.email,
				businessName: data.businessName || 'Bisnis Anda',
				avatar: (data.name || 'P').charAt(0).toUpperCase()
			};
			persist(user);
			set(user);
			return user;
		},
		logout: () => {
			persist(null);
			set(null);
		}
	};
}

export const auth = createAuthStore();
