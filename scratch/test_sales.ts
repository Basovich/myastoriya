import { gqlRequest } from '../src/lib/graphql/client';

async function testSales() {
    const query = `
        query Sales {
            sales(limit: 10) {
                data {
                    id
                    name
                    image {
                        size1x
                        size2x
                        size3x
                    }
                    banner {
                        size1x
                        size2x
                        size3x
                    }
                    expiresAt
                }
            }
        }
    `;
    try {
        const data = await gqlRequest<any>(query, {}, { lang: 'ua' });
        console.log('Sales Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error fetching sales:', err);
    }
}

testSales();
