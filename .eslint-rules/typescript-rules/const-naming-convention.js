export default {
	selector: 'variable',
	modifiers: ['const'],
	types: ['boolean', 'string', 'number'],
	format: ['UPPER_CASE'],
	filter: {
		regex: '^E[A-Z]',
		match: true,
	},
};
