// @ts-nocheck
import Modern from '$lib/components/templates/Modern.svelte';
import Elegant from '$lib/components/templates/Elegant.svelte';
import Professional from '$lib/components/templates/Professional.svelte';
import Corporate from '$lib/components/templates/Corporate.svelte';
import Creative from '$lib/components/templates/Creative.svelte';
import Luxury from '$lib/components/templates/Luxury.svelte';
import Classic from '$lib/components/templates/Classic.svelte';
import Bold from '$lib/components/templates/Bold.svelte';
import Simple from '$lib/components/templates/Simple.svelte';
import Minimal from '$lib/components/templates/Minimal.svelte';

/**
 * 9 Official backend template slugs matching GET /api/templates from the PDF
 */
export const API_TEMPLATES = [
	'modern-minimal',
	'corporate-blue',
	'creative-gradient',
	'dark-elegant',
	'bold-editorial',
	'classic-serif',
	'playful-pastel',
	'tech-mono',
	'luxury-gold'
];

/**
 * Single source of truth for every invoice template (10 Templates).
 */
export const INVOICE_TEMPLATES = [
	{ id: 'modern-minimal', aliasId: 'modern', name: 'Modern Minimal', component: Modern, description: 'Clean sans-serif dengan aksen indigo profesional' },
	{ id: 'corporate-blue', aliasId: 'corporate', name: 'Corporate Blue', component: Corporate, description: 'Band navy tegas standar B2B & korporat' },
	{ id: 'creative-gradient', aliasId: 'creative', name: 'Creative Gradient', component: Creative, description: 'Gradien warna modern dan berjiwa kreatif' },
	{ id: 'dark-elegant', aliasId: 'elegant', name: 'Dark Elegant', component: Elegant, description: 'Serif mewah berkelas dengan estetika elegan' },
	{ id: 'bold-editorial', aliasId: 'bold', name: 'Bold Editorial', component: Bold, description: 'Tipografi besar, total tagihan sangat menonjol' },
	{ id: 'classic-serif', aliasId: 'classic', name: 'Classic Serif', component: Classic, description: 'Tata letak invoice tradisional berkotak formal' },
	{ id: 'playful-pastel', aliasId: 'simple', name: 'Playful Pastel', component: Simple, description: 'Tanpa kartu, murni teks rapi dan garis minimal' },
	{ id: 'tech-mono', aliasId: 'professional', name: 'Tech Mono', component: Professional, description: 'Dua kolom presisi untuk agensi software & dev' },
	{ id: 'luxury-gold', aliasId: 'luxury', name: 'Luxury Gold', component: Luxury, description: 'Hero gelap dengan aksen emas premium' },
	{ id: 'clean-minimal', aliasId: 'minimal', name: 'Clean Minimal', component: Minimal, description: 'Desain monokrom esensial tanpa kartu berfokus pada kejelasan data' }
];

export function getTemplateById(id) {
	if (!id) return INVOICE_TEMPLATES[0];
	return (
		INVOICE_TEMPLATES.find((t) => t.id === id || t.aliasId === id) ||
		INVOICE_TEMPLATES[0]
	);
}
