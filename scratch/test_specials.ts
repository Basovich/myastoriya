import { gqlRequest } from '../src/lib/graphql/client';

async function testSpecials() {
    const query = `
        query Specials {
            specials(limit: 10) {
                data {
                    id
                    name
                    image {
                        grid2x
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
