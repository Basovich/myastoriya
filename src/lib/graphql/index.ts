// Re-export client
export { gqlRequest, GraphQLError } from './client';
export type { GqlError, GqlResponse } from './client';

// Re-export auth
export {
    loginApi,
    registerApi,
    refreshTokenApi,
    getMeApi,
} from './queries/auth';
export type { LoginInput, RegisterInput, AuthPayload } from './queries/auth';

// Re-export products
export {
    getProductsApi,
    getProductBySlugApi,
    getCategoriesApi,
} from './queries/products';
export type {
    Product,
    ProductImage,
    ProductCategory,
    ProductsFilter,
    ProductsResponse,
} from './queries/products';

// Re-export blog
export {
    getBlogsApi,
    getBlogBySlugApi,
    getBlogTypesApi,
} from './queries/blog';
export type {
    BlogPost,
    BlogImage,
    BlogImageUrl,
    BlogType,
    BlogProduct,
    RelatedBlog,
    BlogRecipe,
    BlogsFilter,
    BlogsPagination,
} from './queries/blog';

// Re-export slides
export { SLIDES_QUERY, getSlidesApi } from './queries/slides';
export type { Slide, SlideImage, SlideImageWeb, SlideLinkTo } from './queries/slides';

// Re-export categories
export { getPopularCategoriesApi } from './queries/categories';
export type { PopularCategory } from './queries/categories';
