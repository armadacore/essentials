import { Exception } from 'essentials:exceptions';
import { ResultBase } from '../core/resultBase';

export const isResult = <T>(result: unknown): result is ResultBase<T> & { value: T; error: Exception } => {
	if (
		result &&
		typeof result === 'object' &&
		'isOk' in result &&
		'isErr' in result &&
		('value' in result || result.isOk === false)
	) {
		return true;
	}

	return false;
};
