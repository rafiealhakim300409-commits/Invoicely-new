<script>
	import '../app.css';
	import { theme } from '$lib/stores/theme.js';
	import { onMount } from 'svelte';

	onMount(() => theme.init());
</script>

<slot />
