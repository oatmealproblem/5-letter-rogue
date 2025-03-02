import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	compilerOptions: { runes: true },
	kit: {
		adapter: adapter(),
		router: { type: 'hash' },
		paths: {
			base: process.env.NODE_ENV === 'development' ? '' : '/REPLACEME',
		},
	},
};

export default config;
