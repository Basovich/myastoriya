import { gqlRequest } from "./src/lib/graphql/client";

async function test() {
    const query = /* GraphQL */ `
        query PopularCategories {
            popularCategories {
                id
                name
                productsCount
            }
        }
    `;
    try {
        const data = await gqlRequest<any>(query, undefined, { lang: 'ua' });
        console.log(JSON.stringify(data.popularCategories, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
