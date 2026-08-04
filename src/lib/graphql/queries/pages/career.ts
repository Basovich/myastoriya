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

export interface CareerPosition {
    id: string;
    name: string;
}

export interface SubmitCareerApplicationInput {
    fullName: string;
    dob: string;
    phone: string;
    desiredPosition?: string;
    careerPositionId?: number;
    localityId?: number;
    hasExperience?: boolean;
    experience?: boolean;
    additionalInfo?: string;
    email?: string;
    consent: boolean;
}

export interface CareerApplicationResult {
    success: boolean;
    message?: string | null;
    applicationId?: number | null;
}

export const CAREER_POSITIONS_QUERY = /* GraphQL */ `
  query GetCareerPositions($localityId: Int) {
    careerPositions(localityId: $localityId) {
      id
      name
    }
  }
`;

export const SUBMIT_CAREER_APPLICATION_MUTATION = /* GraphQL */ `
  mutation SubmitCareerApplication(
    $fullName: String!
    $dob: String!
    $phone: String!
    $desiredPosition: String
    $careerPositionId: Int
    $localityId: Int
    $hasExperience: Boolean
    $experience: Boolean
    $additionalInfo: String
    $email: String
    $consent: Boolean!
  ) {
    submitCareerApplication(
      fullName: $fullName
      dob: $dob
      phone: $phone
      desiredPosition: $desiredPosition
      careerPositionId: $careerPositionId
      localityId: $localityId
      hasExperience: $hasExperience
      experience: $experience
      additionalInfo: $additionalInfo
      email: $email
      consent: $consent
    ) {
      success
      message
      applicationId
    }
  }
`;

export async function getCareerApi(lang: string): Promise<Career | null> {
    try {
        const response = await gqlRequest<{ career: Career | null }>(CAREER_QUERY, {}, {
            lang,
            next: { revalidate: 3600 },
        });
        return response.career || null;
    } catch (error) {
        console.error("[getCareerApi] Error fetching career data:", error);
        return null;
    }
}

export async function getCareerPositionsApi(localityId?: number, lang?: string): Promise<CareerPosition[]> {
    try {
        const response = await gqlRequest<{ careerPositions: CareerPosition[] }>(
            CAREER_POSITIONS_QUERY,
            { localityId },
            { lang }
        );
        return response.careerPositions || [];
    } catch (error) {
        console.error("[getCareerPositionsApi] Error fetching career positions:", error);
        return [];
    }
}

export async function submitCareerApplicationApi(
    input: SubmitCareerApplicationInput,
    lang?: string
): Promise<CareerApplicationResult> {
    const response = await gqlRequest<{ submitCareerApplication: CareerApplicationResult }>(
        SUBMIT_CAREER_APPLICATION_MUTATION,
        input,
        { lang }
    );
    return response.submitCareerApplication;
}

