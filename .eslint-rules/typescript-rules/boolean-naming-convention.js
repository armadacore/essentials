export default {
	selector: ['variable', 'parameter', 'property'],
	types: ['boolean'],
	format: ['camelCase'],
	custom: {
		regex: '^(it|is|has|should|can|will|was|were|with|requires)[A-Z]',
		match: true,
	},
};
