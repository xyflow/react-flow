import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		sourcemap: true
	},
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			allow: ['../..']
		}
	}
});
