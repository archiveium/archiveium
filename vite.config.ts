import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		coverage: {
			all: true,
			exclude: ['build', 'node_modules', 'public', 'test'],
			include: ['app'],
			reporter: ['text', 'json-summary', 'json']
		}
	}
});
