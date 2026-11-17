// A streak is the number of consecutive calendar weeks (Monday to Sunday,
// UTC) in which a household had at least one pickup completed.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
// 5 January 1970 was a Monday.
const FIRST_MONDAY = Date.UTC(1970, 0, 5);

const weekIndex = (date) => Math.floor((new Date(date).getTime() - FIRST_MONDAY) / WEEK_MS);

// The streak after a pickup is completed at `completedAt`, given the stored
// streak and when the household's previous pickup was completed (if ever).
export const nextStreak = (storedStreak, previousCompletedAt, completedAt) => {
    if (!previousCompletedAt) return 1;
    const gap = weekIndex(completedAt) - weekIndex(previousCompletedAt);
    if (gap <= 0) return Math.max(storedStreak || 0, 1);
    if (gap === 1) return (storedStreak || 0) + 1;
    return 1;
};

// The streak to show today: it lapses once a full calendar week passes with
// no completed pickup.
export const currentStreak = (storedStreak, lastCompletedAt, now = new Date()) => {
    if (!lastCompletedAt) return 0;
    return weekIndex(now) - weekIndex(lastCompletedAt) <= 1 ? Math.max(storedStreak || 0, 1) : 0;
};
