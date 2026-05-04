import { gqlRequest } from '../src/lib/graphql/client';

async function testShowcases() {
    const query = `
        query Showcases {
            showcases {
                id
                name
                slug
            }
        }
    `;
    try {
        const data = await gqlRequest<any>(query, {}, { lang: 'ua' });
        console.log('Showcases Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error fetching showcases:', err);
    }
}

testShowcases();
