import { gqlRequest } from '../src/lib/graphql/client';

async function testSpecials() {
    const query = `
        query Specials {
            specials(limit: 50) {
                data {
                    id
                    title
                    oldCost
                    cost
                    amount
                    discountType
                    images {
                        url {
                            grid2x
                            grid3x
                        }
                    }
                }
            }
        }
    `;
    try {
        const data = await gqlRequest<any>(query, {}, { lang: 'ua' });
        console.log('Specials Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error fetching specials:', err);
    }
}

testSpecials();
