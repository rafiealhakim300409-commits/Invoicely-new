import { json } from '@sveltejs/kit';
import { API_TEMPLATES } from '$lib/services/api.js';

export async function GET() {
	return json({
		status: 'success',
		templates: API_TEMPLATES
	});
}
