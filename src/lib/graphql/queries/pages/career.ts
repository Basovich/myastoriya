import { gqlRequest } from "../../client";

export const CAREER_QUERY = `
  query getCareer {
    career {
      title
      text
      buttonText
      formUrl
    }
  }
`;

export interface Career {
    title: string | null;
    text: string | null;
    buttonText: string | null;
    formUrl: string | null;
}

export async function getCareerApi(lang: string): Promise<Career | null> {
    try {
        const response = await gqlRequest<{ career: Career | null }>(CAREER_QUERY, {}, {
            lang,
            next: { revalidate: 3600 }
        });
        return response.career || null;
    } catch (error) {
        console.error("[getCareerApi] Error fetching career data:", error);
        return null;
    }
}
