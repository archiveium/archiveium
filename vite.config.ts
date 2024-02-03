import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		setupFiles: ['src/tests/setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}'],
		coverage: {
			all: true,
			exclude: ['tests'],
			include: ['src'],
			reporter: ['text', 'json-summary', 'json']
		},
		deps: {
			inline: [
				"@aws-sdk/util-user-agent-node",
				"@aws-sdk/signature-v4-multi-region"
			]
		}
	}
});
