import { gqlRequest } from "../client";

export const USER_BANK_CARDS_QUERY = `
  query GetUserBankCards {
    userBankCards {
      id
      isDefault
      number
      expire
      formattedExpire
      fio
      icon
    }
  }
`;

export const DELETE_USER_BANK_CARD_MUTATION = `
  mutation DeleteUserBankCard($id: ID!) {
    deleteUserBankCard(id: $id)
  }
`;

export const MARK_USER_BANK_CARD_AS_DEFAULT_MUTATION = `
  mutation MarkUserBankCardAsDefault($id: Int!) {
    markUserBankCardAsDefault(id: $id)
  }
`;

export const REQUEST_TOKENIZE_CARD_MUTATION = `
  mutation RequestTokenizeCard {
    requestTokenizeCard
  }
`;

export interface UserBankCard {
  id: string;
  isDefault: boolean;
  number: string;
  expire: string;
  formattedExpire: string;
  fio: string | null;
  icon: string | null;
}

export const getUserBankCardsApi = async (
  token: string,
  lang?: string
): Promise<UserBankCard[]> => {
  const data = await gqlRequest<{ userBankCards: UserBankCard[] }>(
    USER_BANK_CARDS_QUERY,
    {},
    { token, lang }
  );
  return data.userBankCards || [];
};

export const deleteUserBankCardApi = async (
  id: string,
  token: string,
  lang?: string
): Promise<boolean> => {
  const data = await gqlRequest<{ deleteUserBankCard: boolean }>(
    DELETE_USER_BANK_CARD_MUTATION,
    { id },
    { token, lang }
  );
  return data.deleteUserBankCard;
};

export const markUserBankCardAsDefaultApi = async (
  id: number,
  token: string,
  lang?: string
): Promise<boolean> => {
  const data = await gqlRequest<{ markUserBankCardAsDefault: boolean }>(
    MARK_USER_BANK_CARD_AS_DEFAULT_MUTATION,
    { id },
    { token, lang }
  );
  return data.markUserBankCardAsDefault;
};

export const requestTokenizeCardApi = async (
  token: string,
  lang?: string
): Promise<string | null> => {
  const data = await gqlRequest<{ requestTokenizeCard: string | null }>(
    REQUEST_TOKENIZE_CARD_MUTATION,
    {},
    { token, lang }
  );
  return data.requestTokenizeCard;
};
