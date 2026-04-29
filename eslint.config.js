import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import preferArrow from 'eslint-plugin-prefer-arrow';
import jsdoc from 'eslint-plugin-jsdoc';
import noNull from 'eslint-plugin-no-null';
import stylistic from '@stylistic/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import javascriptRules from './.eslint-rules/javascript-rules.js';
import typescriptRules from './.eslint-rules/typescript-rules.js';
import jsdocRules from './.eslint-rules/jsdoc-rules.js';
import stylisticRules from './.eslint-rules/stylistic-rules.js';
import importRules from './.eslint-rules/import-rules.js';

export default defineConfig([
	{
		ignores: [
			'.github/**',
			'.hooks/**',
			'.idea/**',
			'coverage/**',
			'dist/**',
			'node_modules/**',
			'eslint.config.js',
			'.eslint-rules/**',
			'**/*.d.ts',
			'**/*.json',
			'**/*.md',
		],
	},

	// ============================================================
	// BASE: essentials/src
	// ============================================================
	{
		files: ['src/**/*.ts'],
		plugins: {
			js,
			jsdoc,
			'@typescript-eslint': tseslint.plugin,
			import: importPlugin,
			'unused-imports': unusedImports,
			'prefer-arrow': preferArrow,
			'no-null': noNull,
			'@stylistic': stylistic,
		},
		extends: [js.configs.recommended, tseslint.configs.recommended],
		settings: {
			'import/resolver': {
				typescript: {
					project: ['tsconfig.json', 'tsconfig.test.json'],
				},
				node: true,
			},
		},
		languageOptions: {
			parser: tseslint.parser,
			globals: globals.node,
			parserOptions: {
				project: ['tsconfig.json', 'tsconfig.test.json'],
				tsconfigRootDir: import.meta.dirname,
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		rules: {
			...importRules,
			...jsdocRules,
			...javascriptRules,
			...typescriptRules,
			...stylisticRules,
			...prettierConfig.rules,
		},
	},

	// ============================================================
	// IGNORE RULES FOR CERTAIN STRUCTURE
	// ============================================================
	{
		files: ['src/**/core/**/*.ts'],
		rules: {
			'import/no-restricted-paths': 'off',
		},
	},
	{
		files: ['src/**/models/E*.ts'],
		rules: {
			'no-redeclare': 'off',
		},
	},
]);
