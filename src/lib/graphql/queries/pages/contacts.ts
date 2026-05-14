import { gqlRequest } from "../../client";

export const GET_CONTACT_CATEGORIES_QUERY = `
  query GetContactsCategories {
    contactCategories {
      id
      name
      contacts {
        id
        name
        address
        phone
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

export interface ContactSchedule {
  days: string;
  workTime: string;
}

export interface Contact {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  lat: number | null;
  lng: number | null;
  schedule: ContactSchedule[];
}

export interface ContactCategory {
  id: string;
  name: string;
  contacts: Contact[];
}

export interface ContactsCategoriesResponse {
  contactCategories: ContactCategory[];
}

export const getContactsCategoriesApi = async (
  lang: string = "ua"
): Promise<ContactsCategoriesResponse> => {
  return await gqlRequest<ContactsCategoriesResponse>(GET_CONTACT_CATEGORIES_QUERY, {}, { lang });
};
