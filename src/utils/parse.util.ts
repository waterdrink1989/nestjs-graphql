// Parse sort string or array into Mongoose format
export const parseSort = (sort?: string | [string, string]): Record<string, 1 | -1> => {
    if (!sort) return { id: -1 };
    const [key, dir] = Array.isArray(sort) ? sort : JSON.parse(sort);
    return { [key]: dir === "DESC" ? -1 : 1 };
};

// Parse range string or array into start/limit
export const parseRange = (range?: string | [number, number]): { start: number; limit: number } => {
    if (!range) return { start: 0, limit: 24 };
    const [start, perPage] = Array.isArray(range) ? range : JSON.parse(range);
    return {
        start: Number(start),
        limit: Number(perPage),
    };
};
