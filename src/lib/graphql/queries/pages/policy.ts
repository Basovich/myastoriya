import { gqlRequest } from "../../client";

export const CONTRACT_OFFER_QUERY = `
  query getContractOffer {
    contractOffer {
      webText
    }
  }
`;

export interface ContractOffer {
    webText: string;
}

export async function getContractOfferApi(): Promise<ContractOffer | null> {
    const response = await gqlRequest<{ contractOffer: ContractOffer }>(CONTRACT_OFFER_QUERY, {}, {  });
    return response.contractOffer || null;
}

export const PRIVACY_POLICY_QUERY = `
  query getPrivacyPolicy {
    privacyPolicy {
      webText
    }
  }
`;

export interface PrivacyPolicy {
    webText: string;
}

export async function getPrivacyPolicyApi(): Promise<PrivacyPolicy | null> {
    const response = await gqlRequest<{ privacyPolicy: PrivacyPolicy }>(PRIVACY_POLICY_QUERY, {}, {  });
    return response.privacyPolicy || null;
}

export const TERMS_OF_USE_QUERY = `
  query getTermsOfUse {
    termsOfUse {
      webText
    }
  }
`;

export interface TermsOfUse {
    webText: string;
}

export async function getTermsOfUseApi(): Promise<TermsOfUse | null> {
    const response = await gqlRequest<{ termsOfUse: TermsOfUse }>(TERMS_OF_USE_QUERY, {}, {  });
    return response.termsOfUse || null;
}
