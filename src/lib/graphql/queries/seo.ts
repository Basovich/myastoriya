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

export const REDIRECT_BY_URL_QUERY = /* GraphQL */ `
  query RedirectByUrl($url: String!) {
    redirectByUrl(url: $url)
  }
`;

export interface RedirectByUrlResponse {
  redirectByUrl: string | null;
}

/**
 * Отримує новий URL сторінки по її старому URL з бекенду (Wezom CMS) для 301 редиректу.
 * Повертає string з новим адресом або null, якщо редирект не потрібен.
 */
export const getRedirectByUrlApi = async (
  url: string,
  lang: string = "ua"
): Promise<string | null> => {
  if (!url || typeof url !== "string") return null;

  try {
    const cleanUrl = url.trim();
    // 1. Запит з переданим URL
    const response = await gqlRequest<RedirectByUrlResponse>(
      REDIRECT_BY_URL_QUERY,
      { url: cleanUrl },
      { lang, silent: true, cache: "no-store" }
    );

    let redirectTarget = response?.redirectByUrl;

    // 2. Якщо не знайдено і URL починається з /ua/ або /ru/, спробуємо без мовного префіксу
    if (!redirectTarget && /^\/(?:ua|ru)(?:\/|$)/.test(cleanUrl)) {
      const strippedUrl = cleanUrl.replace(/^\/(?:ua|ru)/, '') || '/';
      const strippedResponse = await gqlRequest<RedirectByUrlResponse>(
        REDIRECT_BY_URL_QUERY,
        { url: strippedUrl },
        { lang, silent: true, cache: "no-store" }
      );
      redirectTarget = strippedResponse?.redirectByUrl;
    }

    if (!redirectTarget || typeof redirectTarget !== "string") {
      return null;
    }

    const trimmedTarget = redirectTarget.trim();

    // Захист від зациклення редиректу на той самий URL
    if (trimmedTarget === cleanUrl || trimmedTarget === url) {
      return null;
    }

    // Захист від зациклення без урахування завершального слеша
    if (trimmedTarget.replace(/\/$/, '') === cleanUrl.replace(/\/$/, '')) {
      return null;
    }

    return trimmedTarget;
  } catch {
    return null;
  }
};

