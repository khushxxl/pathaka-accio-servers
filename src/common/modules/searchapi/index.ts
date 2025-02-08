import axios, { AxiosResponse } from 'axios';

import { SearchResponse } from './../../types/discovery';

interface SearchRequestParams {
    keyword: string;
}

const url = 'https://www.searchapi.io/api/v1/search';

const searchProducts = async (
    i: SearchRequestParams
): Promise<SearchResponse> => {
    const params = {
        engine: 'google_shopping',
        q: i.keyword,
        location: 'London',
        gl: 'uk'
    };
    const paramsWithApiKey = {
        ...params,
        api_key: process.env.SEARCHAPI_API_KEY
    };
    const response: AxiosResponse<SearchResponse> =
        await axios.get<SearchResponse>(url, { params: paramsWithApiKey });
    return response.data;
};

export { searchProducts };
