
import { findProductIdBySlug } from '../src/lib/graphql/queries/products';

async function test() {
    const slug = 'pinca-salyami-tryufelnaya-490-g-picca-pizza';
    const id = await findProductIdBySlug(slug, 'ua');
    console.log(`ID for ${slug}:`, id);
}

test().catch(console.error);
