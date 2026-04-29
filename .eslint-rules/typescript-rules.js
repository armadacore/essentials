import interfaceNamingConvention from './typescript-rules/interface-naming-convention.js';
import typeAliasNamingConvention from './typescript-rules/type-alias-naming-convention.js';
import enumNamingConvention from './typescript-rules/enum-naming-convention.js';
import constNamingConvention from './typescript-rules/const-naming-convention.js';
import booleanNamingConvention from './typescript-rules/boolean-naming-convention.js';
import propertyNamingConvention from './typescript-rules/property-naming-convention.js';
import variableNamingConvention from './typescript-rules/variable-naming-convention.js';
import defaultNamingConvention from './typescript-rules/default-naming-convention.js';
import classNamingConvention from './typescript-rules/class-naming-convention.js';
import functionNamingConvention from './typescript-rules/function-naming-convention.js';
import typeLikeNamingConvention from './typescript-rules/type-like-naming-convention.js';
import parameterNamingConvention from './typescript-rules/parameter-naming-convention.js';
import memberLikeNamingConvention from './typescript-rules/member-like-naming-convention.js';
import objectLiteralPropertNamingConvention from './typescript-rules/object-literal-propert-naming-convention.js';
import objectLiteralMethodNamingConvention from './typescript-rules/object-literal-method-naming-convention.js';

export default {
	'@typescript-eslint/naming-convention': [
		'error',
		defaultNamingConvention,
		enumNamingConvention,
		objectLiteralPropertNamingConvention,
		objectLiteralMethodNamingConvention,
		typeAliasNamingConvention,
		typeLikeNamingConvention,
		memberLikeNamingConvention,
		interfaceNamingConvention,
		functionNamingConvention,
		classNamingConvention,
		constNamingConvention,
		variableNamingConvention,
		booleanNamingConvention,
		parameterNamingConvention,
		propertyNamingConvention,
	],
	'@typescript-eslint/no-unused-vars': [
		'warn',
		{
			vars: 'all',
			varsIgnorePattern: '^_',
			args: 'after-used',
			argsIgnorePattern: '^_',
		},
	],
	'@typescript-eslint/strict-boolean-expressions': 'off',
	'@typescript-eslint/prefer-readonly': 'error',
	'@typescript-eslint/no-floating-promises': 'error',
	'@typescript-eslint/require-array-sort-compare': 'error',
	'@typescript-eslint/prefer-string-starts-ends-with': 'error',
	'@typescript-eslint/no-explicit-any': 'error',
	'@typescript-eslint/prefer-optional-chain': 'error',
	'@typescript-eslint/prefer-nullish-coalescing': 'off',
	'@typescript-eslint/promise-function-async': 'error',
	'@typescript-eslint/no-non-null-assertion': 'error',
	'@typescript-eslint/prefer-as-const': 'error',

	// ========================================
	// NULL/UNDEFINED RESTRICTIONS (Option/Result Pattern)
	// ========================================

	'@typescript-eslint/no-restricted-types': [
		'error',
		{
			types: {
				null: {
					message: 'Use Option<T> instead of null',
					fixWith: 'Option<T>',
				},
				undefined: {
					message: 'Use Option<T> instead of undefined',
					fixWith: 'Option<T>',
				},
			},
		},
	],

	'@typescript-eslint/explicit-function-return-type': [
		'warn',
		{
			allowExpressions: true,
			allowTypedFunctionExpressions: true,
			allowHigherOrderFunctions: true,
			allowDirectConstAssertionInArrowFunctions: false,
		},
	],
};
