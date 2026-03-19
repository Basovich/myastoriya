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
  promotionsPage: {
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

export interface Dictionary {
  navigation: {
    home: string;
    products: string;
  };
  home: HomeDict;
}