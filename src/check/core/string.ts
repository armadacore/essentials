/* eslint-disable @typescript-eslint/no-restricted-types */
export const isStringNullOrEmpty = (value: unknown): value is undefined => {
	if (typeof value !== 'string') return true;
	if (!value) return true;

	return value.trim().length === 0;
};
