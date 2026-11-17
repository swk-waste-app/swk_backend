// The investor-demo environment lives in its own database on the same
// cluster, so sample data can never mix with real customers' data.
export const DEMO_DB = 'swk_demo';

// Rewrites a MongoDB connection string so it points at the demo database,
// whatever database (if any) the original named.
export const demoMongoUri = (uri) => {
    const match = String(uri || '').match(/^(mongodb(?:\+srv)?:\/\/[^/]+)(?:\/[^?]*)?(\?.*)?$/);
    if (!match) throw new Error('MONGO_URI is missing or not a MongoDB connection string.');
    return `${match[1]}/${DEMO_DB}${match[2] || ''}`;
};
