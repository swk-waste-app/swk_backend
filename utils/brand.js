// The identity of the company running this deployment. Every user-facing
// string and AI prompt reads the product, company and country from here, so
// another operator only has to set three environment variables.
export const brand = {
    name: process.env.BRAND_NAME || 'Taka Kipawa',
    operator: process.env.BRAND_OPERATOR || 'SWK Ghana',
    country: process.env.BRAND_COUNTRY || 'Ghana',
};
