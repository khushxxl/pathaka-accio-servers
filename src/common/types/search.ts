export interface RawSearchResponse {
    web: {
        results: {
            url: string;
            title: string;
            description: string;
            meta_url: {
                favicon: string;
                hostname: string;
            };
        }[];
    };
}

export interface SearchResponse {
    web: {
        url: string;
        title: string;
        description: string;
        website: string;
        content?: string;
    }[];
}

export interface SubtopicSearchResult {
    url: string;
    website: string;
    content: string;
}

export interface SubtopicSearchResponse {
    web: SubtopicSearchResult[];
}
