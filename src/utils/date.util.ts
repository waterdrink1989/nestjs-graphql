// Get start and end of a day
export const getDateRange = (value: string): { $gte: Date; $lte: Date } => {
    const from = new Date(value);
    const to = new Date(value);
    from.setHours(0, 0, 0);
    to.setHours(23, 59, 59);
    return { $gte: from, $lte: to };
};

export const convertDate = (
    filter: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    fromKey: string,
    toKey: string,
    target: string
) => {
    const from = filter[fromKey];
    const to = filter[toKey];

    delete filter[fromKey];
    delete filter[toKey];

    if (from || to) {
        const fromDate = from ? new Date(from) : null;
        const toDate = to ? new Date(to) : null;

        if (fromDate) fromDate.setHours(0, 0, 0);
        if (toDate) toDate.setHours(23, 59, 59);

        filter[target] = {
            ...(fromDate && { $gte: fromDate }),
            ...(toDate && { $lte: toDate }),
        };
    }
};
