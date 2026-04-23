import { gqlRequest } from "../client";

export const SOCIAL_LINKS_QUERY = `
  query getSocialLinks {
    socialLinks {
      id
      name
      link
    }
  }
`;

export interface SocialLink {
    id: string;
    name: string;
    link: string;
}

export async function getSocialLinksApi(): Promise<SocialLink[]> {
    const response = await gqlRequest<{ socialLinks: SocialLink[] }>(SOCIAL_LINKS_QUERY);
    return response.socialLinks || [];
}
