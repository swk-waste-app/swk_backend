// Helpers for the sort, limit and skip query parameters that list endpoints share.

const SORT_DIRECTIONS = [1, -1, 'asc', 'desc'];

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

// Reads ?sort={"field":-1}. Bad input becomes a 400 from the global error
// handler instead of a 500. An absent or empty sort falls back to `fallback`.
export const parseSort = (raw, fallback = {}) => {
    if (raw === undefined || raw === '') return fallback;
    let sort;
    try {
        sort = JSON.parse(raw);
    } catch {
        throw badRequest('sort must be valid JSON, for example {"createdAt":-1}');
    }
    const isPlainObject = sort !== null && typeof sort === 'object' && !Array.isArray(sort);
    if (!isPlainObject || !Object.values(sort).every((direction) => SORT_DIRECTIONS.includes(direction))) {
        throw badRequest('sort must be an object of field names mapped to 1, -1, "asc" or "desc"');
    }
    return Object.keys(sort).length > 0 ? sort : fallback;
};

// A whole number of documents for limit or skip; anything else uses `fallback`.
export const parseCount = (raw, fallback) => {
    const count = Number(raw);
    return Number.isInteger(count) && count >= 0 ? count : fallback;
};
