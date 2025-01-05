import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: []
	},
	optimizeDeps: {
		exclude: ['@libsql/client']
	},
	build: {
		target: 'esnext',
		commonjsOptions: {
			dynamicRequireTargets: [
				'node_modules/@libsql/linux-x64-musl/**/*.node'
			]
		}
	},
	// below three lines for development in code-server only
	server: {
		host: "127.0.0.1"
	}
});