export interface HeroSlide {
  badge: string;
  title: string;
  ctaButton: {
    text: string;
    href: string;
  };
  image: string;
}

export interface Category {
  title: string;
  image: string;
  slug: string;
}

export interface CategoriesSection {
  sectionTitle: string;
  items: Category[];
}

export interface Product {
  id: number;
  title: string;
  weight: string;
  price: number;
  unit: string;
  badge: string | null;
  image: string;
}

export interface Review {
  id: number;
  name: string;
  date: string;
  rating: number;
  avatar: string;
  text: string;
}

export interface Publication {
  id: number;
  title: string;
  image: string;
  dateRange: string;
}

export interface Promotion {
  id: number;
  title: string;
  image: string;
  date: string;
  discount: string | null;
}

export interface ComplexDiscount {
  id: number;
  title: string;
  image: string;
  dateRange: string;
  discount: string;
  endDate?: string;
}

export interface BlogPageDictBreadcrumbs {
  home: string;
  blog: string;
}

export interface PromotionsPageBreadcrumbs {
  home: string;
  promotions: string;
}

export interface ComplexDiscountsPageBreadcrumbs {
  home: string;
  complexDiscounts: string;
}

export interface BlogPageDict {
  title: string;
  breadcrumbs: BlogPageDictBreadcrumbs;
  tabs: {
    all: string;
    news: string;
    recipes: string;
    events: string;
  };
  showBtn: string;
}

export interface HomeDict {
  hero: {
    slides: HeroSlide[];
  };
  categories: CategoriesSection;
  products: {
    showMoreButton: string;
    items: Product[];
  };
  actions: {
    sectionTitle: string;
    items: Promotion[];
  };
  discounts: {
    sectionTitle: string;
    items: ComplexDiscount[];
  };
  publications: {
    sectionTitle: string;
    showAllButton: string;
    items: Publication[];
  };
  reviews: {
    sectionTitle: string;
    leaveReviewButton: string;
    readMoreText: string;
    collapseText: string;
    items: Review[];
  };
  seo: {
    title: string;
    text: string;
    showBtn: string;
    hideBtn: string;
  };
  actionsPage: {
    title: string;
    breadcrumbs: PromotionsPageBreadcrumbs;
    tabs: {
      promotions: string;
      complexDiscounts: string;
    };
    showBtn: string;
  };
  complexDiscountsPage: {
    title: string;
    breadcrumbs: ComplexDiscountsPageBreadcrumbs;
    tabs: {
      promotions: string;
      complexDiscounts: string;
    };
    showBtn: string;
  };
  blogPage: BlogPageDict;
  blogPostPage: BlogPostPageDict;
  careersPage: CareersPageDict;
  applicantFormPage: ApplicantFormPageDict;
  contactsPage: ContactsPageDict;
  ourStoresPage: OurStoresPageDict;
  deliveryPage: DeliveryPageDict;
  privacyPolicyPage: PrivacyPolicyPageDict;
  loyaltyProgramRulesPage?: LoyaltyProgramRulesPageDict;
  notFoundPage: NotFoundPageDict;
}

export interface NotFoundPageDict {
  title: string;
  text: string;
  subtext: string;
  button: string;
  breadcrumbs: {
    home: string;
    notFound: string;
  };
}

export interface BlogPostPageDict {
  breadcrumbs: {
    home: string;
    blog: string;
  };
  shareText: string;
  recommendedProductsTitle: string;
}

export interface ApplicantFormPageDict {
  title: string;
  breadcrumbs: {
    home: string;
    careers: string;
    apply: string;
  };
  form: {
    fullName: string;
    dob: string;
    phone: string;
    desiredPosition: string;
    hasExperience: string;
    location: string;
    additionalInfo: string;
    consent: string;
    submitText: string;
    options: {
      chooseVariant: string;
      yes: string;
      no: string;
      kyiv: string;
      manager: string;
      cook: string;
      cashier: string;
    };
    errors: {
      required: string;
      invalidPhone: string;
    };
  };
}

export interface CareersPageDict {
  title: string;
  breadcrumbs: {
    home: string;
    careers: string;
  };
  hero: {
    title: string;
    subtitle: string;
  };
  form: {
    button: string;
  };
  about: {
    text: string;
  };
}

export interface ContactsPageDict {
  title: string;
  breadcrumbs: {
    home: string;
    contacts: string;
  };
  sections: {
    callCenter: string;
    restaurants: string;
    meatBar: string;
  };
  labels: {
    workingHours: string;
    phone: string;
    email: string;
    address: string;
    restaurantAddress: string;
    buildRoute: string;
  };
}

export interface OurStoresPageDict {
  title: string;
  loadMore: string;
  breadcrumbs: {
    home: string;
    stores: string;
  };
  filters: {
    all: string;
    restaurants: string;
    meatbar: string;
  };
  search: {
    placeholder: string;
    button: string;
  };
  viewToggle: {
    list: string;
    map: string;
  };
  storeCard: {
    workingHours: string;
    details: string;
    route: string;
    open: string;
    closed: string;
    address: string;
    workingHoursLabel: string;
    phoneLabel: string;
  };
}

export interface PolicyPageContentItem {
  type: "text" | "header" | "list";
  value: string | string[];
}

export interface PrivacyPolicyPageDict {
  title: string;
  breadcrumbs: {
    home: string;
    privacy: string;
  };
  content: PolicyPageContentItem[];
}

export interface LoyaltyProgramRulesPageDict {
  title: string;
  breadcrumbs: {
    home: string;
    loyalty: string;
  };
  content: PolicyPageContentItem[];
}

export interface DeliveryMethodCard {
  title: string;
  shippingCostLabel: string;
  shippingCostValue: string;
  minOrderLabel: string;
  minOrderValue: string;
  features: string[];
  image: string;
  badge?: string;
  isPickup?: boolean;
}

export interface DeliveryPageDict {
  title: string;
  breadcrumbs: {
    home: string;
    delivery: string;
  };
  zones: {
    title: string;
    tabs: {
      restaurants: string;
      meatbar: string;
    };
    search: {
      placeholder: string;
      button: string;
    };
    info: string;
  };
  methods: {
    title: string;
    items: DeliveryMethodCard[];
  };
  policies: {
    returns: {
      title: string;
      text: string;
    };
    payment: {
      title: string;
      items: string[];
    };
    returnableCategories: {
      title: string;
      text: string;
    };
  };
}

export interface Dictionary {
  navigation: {
    home: string;
    products: string;
  };
  home: HomeDict;
}