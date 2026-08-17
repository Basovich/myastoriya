import { gqlRequest } from "../../client";

export const RESTAURANT_MENU_QUERY = `
  query RestaurantMenu($shopSlug: String, $shopId: Int) {
    restaurantMenu(shopSlug: $shopSlug, shopId: $shopId) {
      id
      name  
      products {
        id
        name
        cost
        oldCost
        available
        portionSize
        text
        unit
        multiplier
        images {
          url {
            main2x
          }
        }
      }
    }
  }
`;

export interface Modifier {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  modifiers: Modifier[];
}

export interface ProductImage {
  url: {
    grid2x?: string | null;
    main2x: string | null;
  };
  alt?: string | null;
  title?: string | null;
}

export interface RestaurantProduct {
  id: string;
  name: string;
  cost: number;
  oldCost: number;
  available: number;
  portionSize: string | null;
  text: string | null;
  images: ProductImage[] | null;
  modifierGroups: ModifierGroup[];
  unit: string | null;
  multiplier: number | null;
}

export interface RestaurantMenuCategory {
  id: string;
  name: string;
  products: RestaurantProduct[];
}

export interface RestaurantMenuResponse {
  restaurantMenu: RestaurantMenuCategory[];
}

export const getRestaurantMenuApi = async (
  shopIdentifier: string | number | { shopSlug?: string; shopId?: number },
  lang: string = "ua"
): Promise<RestaurantMenuResponse> => {
  const variables = typeof shopIdentifier === "object"
    ? shopIdentifier
    : typeof shopIdentifier === "string"
      ? { shopSlug: shopIdentifier }
      : { shopId: shopIdentifier };

  return await gqlRequest<RestaurantMenuResponse>(
    RESTAURANT_MENU_QUERY,
    variables,
    { lang, next: { revalidate: 300 } }
  );
};

export interface ShopCustomMenuProduct {
  id: string;
  name: string;
  volume: string | null;
  price: number;
}

export interface ShopCustomMenuCategory {
  id: string;
  name: string;
  subtitle: string | null;
  volume: string | null;
  products: ShopCustomMenuProduct[];
}

export interface ShopCustomMenuResponse {
  shopCustomMenu: ShopCustomMenuCategory[];
}

export const SHOP_CUSTOM_MENU_QUERY = `
  query ShopCustomMenu($shopSlug: String, $shopId: Int) {
    shopCustomMenu(shopSlug: $shopSlug, shopId: $shopId) {
      id
      name
      subtitle
      volume
      products {
        id
        name
        volume
        price
      }
    }
  }
`;

export const getShopCustomMenuApi = async (
  shopIdentifier: string | number | { shopSlug?: string; shopId?: number },
  lang: string = "ua"
): Promise<ShopCustomMenuResponse> => {
  const variables = typeof shopIdentifier === "object"
    ? shopIdentifier
    : typeof shopIdentifier === "string"
      ? { shopSlug: shopIdentifier }
      : { shopId: shopIdentifier };

  return await gqlRequest<ShopCustomMenuResponse>(
    SHOP_CUSTOM_MENU_QUERY,
    variables,
    { lang, next: { revalidate: 300 } }
  );
};

export interface ElectronicMenuProduct {
  id: string;
  name: string;
  volume: string | null;
  price: number;
}

export interface ElectronicMenuCategory {
  id: string;
  name: string;
  subtitle: string | null;
  volume: string | null;
  products: ElectronicMenuProduct[];
}

export interface StoreFullMenuResponse {
  restaurantMenu: RestaurantMenuCategory[] | null;
  shop: {
    id: string;
    electronicMenu: ElectronicMenuCategory[] | null;
  } | null;
  shopCustomMenu: ShopCustomMenuCategory[] | null;
}

export const STORE_FULL_MENU_QUERY = `
  query GetStoreFullMenu($shopSlug: String) {
    restaurantMenu(shopSlug: $shopSlug) {
      id
      name
      products {
        id
        siteId
        productType
        cost
        oldCost
        available
        portionSize
        text
        unit
        multiplier
        name
        images {
          url {
            main2x
          }
        }
      }
    }
    shop(slug: $shopSlug) {
      id
      electronicMenu {
        id
        name
        subtitle
        volume
        products {
          id
          name
          volume
          price
        }
      }
    }
    shopCustomMenu(shopSlug: $shopSlug) {
      id
      name
      subtitle
      volume
      products {
        id
        name
        volume
        price
      }
    }
  }
`;

export const getStoreFullMenuApi = async (
  shopSlug: string,
  lang: string = "ua"
): Promise<StoreFullMenuResponse> => {
  return await gqlRequest<StoreFullMenuResponse>(
    STORE_FULL_MENU_QUERY,
    { shopSlug },
    { lang, next: { revalidate: 300 } }
  );
};


