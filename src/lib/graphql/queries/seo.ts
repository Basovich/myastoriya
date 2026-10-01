import { gqlRequest } from "../client";

export const SEO_BY_URL_QUERY = `
  query SeoByUrl($url: String!) {
    seoByUrl(url: $url) {
      title
      h1
      description
      keywords
      canonical
      noindex
    }
  }
`;

export interface PageSeo {
  title: string | null;
  h1: string | null;
  description: string | null;
  keywords: string | null;
  canonical: string | null;
  noindex: boolean | null;
}

export interface SeoByUrlResponse {
  seoByUrl: PageSeo | null;
}

export const getSeoByUrlApi = async (
  url: string,
  lang: string = "ua"
): Promise<PageSeo | null> => {
  try {
    const response = await gqlRequest<SeoByUrlResponse>(
      SEO_BY_URL_QUERY,
      { url },
      { lang, silent: true }
    );
    return response?.seoByUrl || null;
  } catch {
    return null;
  }
};
