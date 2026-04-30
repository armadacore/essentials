import { Exception } from 'essentials:exceptions';
import { ResultBase } from '../core/resultBase';

export const isResult = <T>(value: unknown): value is ResultBase<T> & { value: T; error: Exception } => {
	return value instanceof ResultBase;
};
