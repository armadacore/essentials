export default {
	'import/no-duplicates': ['error'],
	'import/newline-after-import': 'error',
	'import/no-anonymous-default-export': 'error',
	'import/no-default-export': 'error',
	'import/prefer-default-export': 'off',
	'no-restricted-imports': [
		'error',
		{
			patterns: [
				{
					group: ['../../*'],
					message: 'Relative imports across more than one level are forbidden. Use a path alias instead.',
				},
			],
		},
	],
	'import/order': [
		'error',
		{
			groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
			'newlines-between': 'never',
			alphabetize: {
				order: 'asc',
				caseInsensitive: true,
			},
			pathGroups: [
				{
					pattern: '~/**',
					group: 'internal',
					position: 'before',
				},
			],
			pathGroupsExcludedImportTypes: ['builtin'],
		},
	],
	'unused-imports/no-unused-imports': 'error',
	'unused-imports/no-unused-vars': [
		'warn',
		{
			vars: 'all',
			varsIgnorePattern: '^_',
			args: 'after-used',
			argsIgnorePattern: '^_',
		},
	],
};
