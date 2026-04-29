import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

const srcRoot = resolve(__dirname, 'src');

export default defineConfig({
	resolve: {
		alias: [
			{
				find: /^essentials:(.*)$/,
				replacement: `${srcRoot}/$1`
			}
		]
	},
	test: {
		globals: false,
		environment: 'node',
		include: ['src/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			include: ['src/**/*.ts'],
			exclude: ['src/**/*.test.ts', 'src/**/index.ts', 'src/**/models/**']
		}
	}
});
