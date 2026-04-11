import { gqlRequest } from '../client';

export interface Locality {
    id: number;
    name: string;
    slug?: string;
    primary?: boolean;
}

export interface LocalitiesResponse {
    localities: {
        data: Locality[];
        per_page: number;
        current_page: number;
        has_more_pages: boolean;
    };
}

const AUTO_DETECT_LOCALITY_MUTATION = /* GraphQL */ `
    mutation AutoDetectLocality($lat: Float, $lng: Float) {
        autoDetectLocality(lat: $lat, lng: $lng) {
            id
            name
        }
    }
`;

const LOCALITIES_QUERY = /* GraphQL */ `
    query Localities($name: String, $limit: Int, $page: Int) {
        localities(name: $name, limit: $limit, page: $page) {
            data {
                id
                name
            }
            per_page
            current_page
            has_more_pages
        }
    }
`;

const SELECT_LOCALITY_MUTATION = /* GraphQL */ `
    mutation SelectLocality($id: Int) {
        selectLocality(id: $id) {
            id
            name
        }
    }
`;

const SELECTED_LOCALITY_QUERY = /* GraphQL */ `
    query SelectedLocality {
        selectedLocality {
            id
            name
        }
    }
`;

export async function autoDetectLocalityApi(lat?: number, lng?: number, lang?: string): Promise<Locality> {
    const data = await gqlRequest<{ autoDetectLocality: Locality }>(
        AUTO_DETECT_LOCALITY_MUTATION,
        { lat, lng },
        { lang }
    );
    return data.autoDetectLocality;
}

export async function getLocalitiesApi(
    name?: string, 
    limit: number = 20, 
    page: number = 1, 
    lang?: string
): Promise<LocalitiesResponse['localities']> {
    const data = await gqlRequest<LocalitiesResponse>(
        LOCALITIES_QUERY,
        { name, limit, page },
        { lang }
    );
    return data.localities;
}

export async function selectLocalityApi(id: number, lang?: string): Promise<Locality> {
    const data = await gqlRequest<{ selectLocality: Locality }>(
        SELECT_LOCALITY_MUTATION,
        { id },
        { lang }
    );
    return data.selectLocality;
}

export async function getSelectedLocalityApi(lang?: string): Promise<Locality | null> {
    const data = await gqlRequest<{ selectedLocality: Locality | null }>(
        SELECTED_LOCALITY_QUERY,
        undefined,
        { lang }
    );
    return data.selectedLocality;
}
