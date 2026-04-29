export default {
	selector: 'property',
	filter: {
		regex: '^handle[A-Z]',
		match: true,
	},
	format: ['camelCase'],
};
