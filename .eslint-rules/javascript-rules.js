import js from '@eslint/js';

export default {
	...js.configs.recommended.rules,
	// Disabled due to Prettier:
	// 'max-len': ['error', {
	//     code: 120,
	//     tabWidth: 4,
	//     ignoreUrls: true,
	//     ignoreStrings: true,
	//     ignoreTemplateLiterals: true,
	// }],
	// 'indent': ['error', 4, {
	//     SwitchCase: 1,
	//     VariableDeclarator: 1,
	//     outerIIFEBody: 1,
	// }],
	// 'semi': ['error', 'always'],
	// 'comma-dangle': ['error', 'always-multiline'],

	complexity: ['error', 20],
	'max-depth': ['error', 3],
	'max-params': ['error', 5],
	'max-lines-per-function': ['off', 100],
	'max-classes-per-file': ['error', 1],
	'func-style': ['error', 'expression'],
	'prefer-arrow-callback': 'error',
	'no-useless-return': 'error',
	'arrow-body-style': ['off', 'always'],
	'padding-line-between-statements': [
		'error',
		{
			blankLine: 'always',
			prev: '*',
			next: 'return',
		},
	],
	'no-else-return': 'error',
	'consistent-return': 'warn',

	'object-shorthand': 'error',
	'prefer-destructuring': 'error',
	'no-useless-computed-key': 'error',
	'array-callback-return': 'error',

	// Disabled due to Prettier:
	// 'object-curly-spacing': ['error', 'always'],
	// 'array-bracket-spacing': ['error', 'never'],
	// 'space-infix-ops': 'error',
	// 'keyword-spacing': 'error',

	'no-script-url': 'error',
	'no-console': 'error',
	'no-debugger': 'error',
	'no-alert': 'error',
	'no-eval': 'error',
	'no-implied-eval': 'error',
	'no-new-func': 'error',
	'prefer-const': 'error',
	'no-var': 'error',
	'prefer-promise-reject-errors': 'error',
	'no-redeclare': 'warn',
	'no-inline-comments': 'error',
	'no-warning-comments': ['off', { terms: ['TODO', 'FIXME'] }],

	'no-restricted-imports': [
		'error',
		{
			patterns: ['../../*'],
		},
	],

	'no-unused-vars': [
		'off',
		{
			vars: 'all',
			varsIgnorePattern: '^_',
			args: 'after-used',
			argsIgnorePattern: '^_',
		},
	],
	'no-null/no-null': 'error',
	'no-undefined': 'error',
	'no-restricted-syntax': [
		'error',
		{
			selector: 'TSUnionType > TSNullKeyword',
			message: 'Union types with null are not allowed. Use Option<T> instead.',
		},
		{
			selector: 'TSUnionType > TSUndefinedKeyword',
			message: 'Union types with undefined are not allowed. Use Option<T> instead.',
		},
		{
			selector: 'TSLiteralType[literal.type="Literal"][literal.value=null]',
			message: 'Null literals are not allowed. Use Option.none() instead.',
		},
	],
	'prefer-arrow/prefer-arrow-functions': [
		'error',
		{
			disallowPrototype: true,
			singleReturnOnly: false,
			classPropertiesAllowed: false,
		},
	],
};
