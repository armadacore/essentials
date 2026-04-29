export default {
	'jsdoc/check-alignment': 'error',
	'jsdoc/check-param-names': 'error',
	'jsdoc/require-returns-type': 'error',
	'jsdoc/require-param-type': 'error',
	'jsdoc/require-jsdoc': [
		'warn',
		{
			require: {
				FunctionDeclaration: false,
				MethodDefinition: false,
				ClassDeclaration: false,
				ArrowFunctionExpression: false,
				FunctionExpression: false,
			},
			contexts: [
				'Program > VariableDeclaration[kind="const"] > VariableDeclarator > ArrowFunctionExpression[params.length > 2]',
				'Program > FunctionDeclaration[params.length > 2]',
			],
		},
	],
	'jsdoc/require-description': [
		'warn',
		{
			contexts: ['any'],
			checkConstructors: false,
			checkGetters: false,
			checkSetters: false,
		},
	],
};
