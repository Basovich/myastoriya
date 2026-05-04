import { gqlRequest } from '../src/lib/graphql/client';

async function checkDiscountedProducts() {
    const query = `
        query Products {
            products(limit: 100) {
                data {
                    id
                    name
                    cost
                    oldCost
                }
            }
        }
    `;
    try {
        const data = await gqlRequest<any>(query, {}, { lang: 'ua' });
        const discounted = data.products.data.filter((p: any) => p.oldCost && p.oldCost > p.cost);
        console.log('Discounted Products Found:', discounted.length);
        if (discounted.length > 0) {
            console.log('Sample:', JSON.stringify(discounted.slice(0, 2), null, 2));
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

checkDiscountedProducts();
