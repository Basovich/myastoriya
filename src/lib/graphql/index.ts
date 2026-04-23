// Re-export client
export { gqlRequest, GraphQLError } from './client';
export type { GqlError, GqlResponse } from './client';

// Re-export auth
export {
    sendSmsApi,
    smsVerifyApi,
    loginApi,
    registrationApi,
    resetPasswordApi,
    refreshTokenApi,
    authAsGuestApi,
    logoutApi,
    checkUserPhoneApi,
    getMeApi,
} from './queries/auth';
export type {
    BackendUser,
    AuthFields,
    LoggedInUser,
    SMSTokenResponse,
    ActionTokenResponse,
    LoginInput,
    RegisterInput,
    AuthPayload,
} from './queries/auth';

// Re-export products
export {
    getProductsApi,
    getProductByIdApi,
    findProductIdBySlug,
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
    hasBlogsApi,
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
export { SLIDES_QUERY, getSlidesApi } from './queries/pages/home/slides';
export type { Slide, SlideImage, SlideImageWeb, SlideLinkTo } from './queries/pages/home/slides';

// Re-export categories
export { getPopularCategoriesApi } from './queries/pages/home/categories';
export type { PopularCategory } from './queries/pages/home/categories';

// Re-export reviews
export { getReviewsApi } from './queries/pages/home/reviews';
export type { HomeReview, ReviewUser } from './queries/pages/home/reviews';

// Re-export localities
export {
    autoDetectLocalityApi,
    getLocalitiesApi,
    selectLocalityApi,
    getSelectedLocalityApi,
} from './queries/localities';
export type { Locality } from './queries/localities';

// Re-export shops
export { getShopsApi, getContactsShopsApi, SHOPS_QUERY } from './queries/shops';
export type { Shop, ShopSchedule, ShopsResponse } from './queries/shops';

// Re-export settings
export { getSocialLinksApi, SOCIAL_LINKS_QUERY } from './queries/settings';
export type { SocialLink } from './queries/settings';
