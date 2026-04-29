export const hasNotInclude = (item: unknown, source: unknown[]): boolean => {
	if (!item) return true;
	if (!source.includes(item)) return true;

	return false;
};

export const hasInclude = (item: unknown, source: unknown[]): boolean => {
	if (!item) return false;

	return source.includes(item);
};

export const isArray = <T>(item: unknown): item is T[] => Array.isArray(item);
