import { gqlRequest } from "../client";

export const SHOPS_QUERY = `
  query GetShops($limit: Int, $page: Int) {
    shops(limit: $limit, page: $page) {
      data {
        id
        name
        status
        phones
        email
        schedule {
          days
          workTime
        }
        lat
        lng
      }
      per_page
      current_page
    }
  }
`;

export interface ShopSchedule {
  days: string;
  workTime: string;
}

export interface Shop {
  id: string;
  name: string;
  status: string | null;
  phones: string[];
  email: string | null;
  schedule: ShopSchedule[];
  lat: number | null;
  lng: number | null;
}

export interface ShopsResponse {
  shops: {
    data: Shop[];
    per_page: number;
    current_page: number;
  };
}

export const getShopsApi = async (
  params: { limit?: number; page?: number } = { limit: 100, page: 1 },
  lang: string = "ua"
): Promise<ShopsResponse> => {
  return await gqlRequest<ShopsResponse>(SHOPS_QUERY, params, { lang });
};
