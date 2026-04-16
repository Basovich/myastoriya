import { gqlRequest } from "../client";

export const SHOPS_QUERY = `
  query GetShops($limit: Int, $page: Int, $onlyCompanyStores: Boolean) {
    shops(limit: $limit, page: $page, onlyCompanyStores: $onlyCompanyStores) {
      data {
        id
        name
        status
        phones
        email
        isOpen
        isCompanyStore
        schedule {
          days
          workTime
        }
        lat
        lng
        image {
          size1x
          size2x
          size3x
        }
        icon {
          size1x
          size2x
          size3x
        }
      }
      per_page
      current_page
    }
  }
`;

export const SHOP_BY_ID_QUERY = `
  query GetShop($id: Int!) {
    shop(id: $id) {
      id
      name
      status
      phones
      email
      isOpen
      isCompanyStore
      schedule {
        days
        workTime
      }
      lat
      lng
      image {
        size1x
        size2x
        size3x
      }
      icon {
        size1x
        size2x
        size3x
      }
    }
  }
`;

export const CONTACTS_SHOPS_QUERY = `
  query GetContactsShops($limit: Int, $onlyCompanyStores: Boolean) {
    shops(limit: $limit, onlyCompanyStores: $onlyCompanyStores) {
      data {
        id
        name
        phones
        email
        lat
        lng
        schedule {
          days
          workTime
        }
      }
    }
  }
`;

export interface ShopSchedule {
  days: string;
  workTime: string;
}

export interface ShopSizeImages {
  size1x: string | null;
  size2x: string | null;
  size3x: string | null;
}

export interface Shop {
  id: string;
  name: string;
  status: string | null;
  phones: string[];
  email: string | null;
  isOpen: boolean;
  isCompanyStore: boolean;
  schedule: ShopSchedule[];
  lat: number | null;
  lng: number | null;
  image?: ShopSizeImages | null;
  icon?: ShopSizeImages | null;
}

export interface ShopsResponse {
  shops: {
    data: Shop[];
    per_page: number;
    current_page: number;
  };
}

export interface SingleShopResponse {
  shop: Shop;
}

export const getShopsApi = async (
  params: { limit?: number; page?: number; onlyCompanyStores?: boolean } = { limit: 100, page: 1, onlyCompanyStores: true },
  lang: string = "ua"
): Promise<ShopsResponse> => {
  return await gqlRequest<ShopsResponse>(SHOPS_QUERY, params, { lang });
};

export const getContactsShopsApi = async (
  params: { limit?: number; onlyCompanyStores?: boolean } = { limit: 100, onlyCompanyStores: true },
  lang: string = "ua"
): Promise<ShopsResponse> => {
  return await gqlRequest<ShopsResponse>(CONTACTS_SHOPS_QUERY, params, { lang });
};

export const getShopApi = async (
  id: string,
  lang: string = "ua"
): Promise<SingleShopResponse> => {
  return await gqlRequest<SingleShopResponse>(SHOP_BY_ID_QUERY, { id: parseInt(id) }, { lang });
};
