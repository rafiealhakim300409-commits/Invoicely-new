/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte}'],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#4F46E5',
					50: '#EEF2FF',
					100: '#E0E7FF',
					200: '#C7D2FE',
					300: '#A5B4FC',
					400: '#818CF8',
					500: '#6366F1',
					600: '#4F46E5',
					700: '#4338CA',
					800: '#3730A3',
					900: '#312E81'
				},
				bg: '#F8FAFC',
				surface: '#FFFFFF',
				surfaceDark: '#1E293B',
				bgDark: '#0F172A',
				ink: '#0F172A',
				inkLight: '#F8FAFC'
			},
			fontFamily: {
				sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif']
			},
			borderRadius: {
				xl: '0.875rem',
				'2xl': '1.25rem'
			},
			boxShadow: {
				soft: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
				card: '0 2px 8px -2px rgb(15 23 42 / 0.08), 0 4px 16px -4px rgb(15 23 42 / 0.08)',
				glow: '0 0 20px -3px rgba(79, 70, 229, 0.25)',
				paper: '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.05)'
			}
		}
	},
	plugins: []
};
