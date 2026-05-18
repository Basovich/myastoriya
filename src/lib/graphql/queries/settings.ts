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

const SUBSCRIBE_MUTATION = /* GraphQL */ `
    mutation Subscribe($email: String!) {
        subscribe(email: $email)
    }
`;

export async function subscribeApi(email: string, lang?: string): Promise<boolean> {
    const data = await gqlRequest<{ subscribe: boolean }>(
        SUBSCRIBE_MUTATION,
        { email },
        { lang, cache: 'no-store' }
    );
    return data.subscribe;
}
