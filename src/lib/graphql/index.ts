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
    getProductCostVariantsApi,
    getPopularProductsApi,
    getProductsFilterApi,
    getSpecialsByProductApi,
    getBoughtTogetherProductsApi,
    addProductToAvailabilityTrackerApi,
    findProductIdBySlug,
    getCategoriesApi,
    resolveProductImageUrl,
    getCatalogTreeApi,
    getSubcategoriesApi,
    getCategoryByIdApi,
    addProductViewApi,
    getViewedProductsApi,
    getProductsByIdsApi,
    getSearchPopularQueriesApi,
    getSearchCategoriesApi,
    getFaqQuestionsApi,
    getDefaultCostVariant,
    getRoastDegreeScore,
} from './queries/products';
export type {
    Product,
    MeatType,
    ProductCostVariant,
    ProductImage,
    ProductImageUrl,
    ProductImageEntry,
    ProductCategory,
    ProductsFilter,
    ProductsResponse,
    FilterOption,
    FilterBlock,
    ProductsFilterResponse,
    FilterStateInput,
    FaqQuestion,
    FaqGroup,
} from './queries/products';

// Re-export blog
export {
    getBlogsApi,
    getBlogBySlugApi,
    getBlogTypesApi,
    hasBlogsApi,
    resolveBlogImageUrl,
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

// Re-export sales
export {
    getSalesApi,
    getSaleApi,
    findSaleIdBySlug,
} from './queries/pages/home/sales';
export type { Sale, SaleImages, SalesResponse } from './queries/pages/home/sales';

// Re-export specials
export * from "./queries/pages/home/specials";

// Re-export policy
export { getContractOfferApi, getPrivacyPolicyApi, getTermsOfUseApi } from './queries/pages/policy';
export type { ContractOffer, PrivacyPolicy, TermsOfUse } from './queries/pages/policy';

// Re-export delivery
export { getPolicyBlocksApi, getDeliveryBlocksApi } from './queries/pages/delivery';
export type { OrderingInfoBlock, OrderingInfoBlockImage } from './queries/pages/delivery';

// Re-export localities
export {
    autoDetectLocalityApi,
    getLocalitiesApi,
    selectLocalityApi,
    getSelectedLocalityApi,
} from './queries/localities';
export type { Locality } from './queries/localities';

// Re-export deliveries
export {
    getDeliveriesApi,
    getDeliveryTimesApi,
    getWarehousesApi,
    addUserPickupPointApi,
    deleteUserPickupPointApi,
    getUserPickupPointsApi,
    markUserPickupPointAsDefaultApi,
} from './queries/deliveries';
export type { Delivery, UserPickupPoint, Warehouse, WarehousePagination, Schedule } from './queries/deliveries';

// Re-export addresses
export { getUserAddressesApi, createUserAddressApi, getStreetsApi } from './queries/addresses';
export type { UserAddress, Street } from './queries/addresses';

// Re-export shops
export { getShopsApi, getContactsShopsApi, SHOPS_QUERY } from './queries/shops';
export type { Shop, ShopSchedule, ShopsResponse } from './queries/shops';

// Re-export settings
export { getSocialLinksApi, subscribeApi, SOCIAL_LINKS_QUERY } from './queries/settings';
export type { SocialLink } from './queries/settings';

// Re-export contacts
export { getContactsCategoriesApi } from './queries/pages/contacts';
export type { Contact, ContactCategory, ContactSchedule, ContactsCategoriesResponse } from './queries/pages/contacts';

// Re-export career
export { getCareerApi } from './queries/pages/career';
export type { Career } from './queries/pages/career';

// Re-export orders
export { getOrdersApi, repeatOrderApi } from './queries/orders';
export type { Order, OrderStatus, OrderSimplePagination } from './queries/orders';

// Re-export bank cards
export {
    getUserBankCardsApi,
    deleteUserBankCardApi,
    markUserBankCardAsDefaultApi,
    requestTokenizeCardApi,
} from './queries/bankCards';
export type { UserBankCard } from './queries/bankCards';

// Re-export reviews API
export {
    getOrderReviewsApi,
    getProductReviewsApi,
    addOrderReviewApi,
    addProductReviewApi,
} from './queries/reviews';
export type {
    OrderReview,
    OrderReviewRating,
    OrderReviewSimplePagination,
    ProductReview,
    ProductReviewSimplePagination,
} from './queries/reviews';


