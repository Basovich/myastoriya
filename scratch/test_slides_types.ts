import { gqlRequest } from '../src/lib/graphql/client';

async function testSlidesActions() {
    const query = `
        query Slides($slide: String!) {
            slides(slide: $slide) {
                id
                name
            }
        }
    `;
    try {
        const data = await gqlRequest<any>(query, { slide: "actions" }, { lang: 'ua' });
        console.log('Slides Actions Data:', JSON.stringify(data, null, 2));
        
        const data2 = await gqlRequest<any>(query, { slide: "promotions" }, { lang: 'ua' });
        console.log('Slides Promotions Data:', JSON.stringify(data2, null, 2));
    } catch (err) {
        console.error('Error fetching slides:', err);
    }
}

testSlidesActions();
