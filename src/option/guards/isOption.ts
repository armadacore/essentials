import { OptionBase } from '../core/optionBase';

export const isOption = <T>(option: unknown): option is OptionBase<T> => {
	if (
		option &&
		typeof option === 'object' &&
		'isSome' in option &&
		'isNone' in option &&
		('value' in option || option.isSome === false)
	) {
		return true;
	}

	return false;
};
