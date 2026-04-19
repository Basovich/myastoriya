import { gqlRequest } from './src/lib/graphql/client';

async function debugCategoriesTree() {
    const QUERY = /* GraphQL */ `
        query CategoriesFullTree {
            categories {
                id
                name
                slug
                image {
                    big1x
                    big2x
                }
                children {
                    id
                    name
                    slug
                    image {
                        big1x
                    }
                }
            }
        }
    `;

    try {
        const data = await gqlRequest<any>(QUERY);
        // Filter only parent categories (those that have children or are top-level)
        // Usually top-level categories have parent_id: null, but we'll see the data first
        console.log(JSON.stringify(data.categories, null, 2));
    } catch (e) {
        console.error('Final attempt failed:', e);
    }
}

debugCategoriesTree();
