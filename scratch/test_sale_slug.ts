import { gqlRequest } from '../src/lib/graphql/client';

async function testSaleSlug() {
    const query = `
        query Sales {
            sales(limit: 1) {
                data {
                    id
                    name
                    slug
                }
            }
        }
    `;
    try {
        const data = await gqlRequest<any>(query, {}, { lang: 'ua' });
        console.log('Sales Data with Slug:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error fetching sales with slug:', err);
    }
}

testSaleSlug();
