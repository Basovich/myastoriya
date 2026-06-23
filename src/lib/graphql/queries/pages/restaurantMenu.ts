import { gqlRequest } from "../../client";

export const RESTAURANT_MENU_QUERY = `
  query RestaurantMenu($shopId: Int!) {
    restaurantMenu(shopId: $shopId) {
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
  shopId: number,
  lang: string = "ua"
): Promise<RestaurantMenuResponse> => {
  return await gqlRequest<RestaurantMenuResponse>(
    RESTAURANT_MENU_QUERY,
    { shopId },
    { lang, next: { revalidate: 300 } }
  );
};
