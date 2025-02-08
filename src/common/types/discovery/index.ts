interface SearchMetadata {
    id: string;
    status: string;
    created_at: string;
    request_time_taken: number;
    parsing_time_taken: number;
    total_time_taken: number;
    request_url: string;
    html_url: string;
    json_url: string;
}

interface SearchParameters {
    engine: string;
    q: string;
    location: string;
    location_used: string;
    google_domain: string;
    hl: string;
    gl: string;
    num: string;
}

interface FilterOption {
    text: string;
    tbs: string;
}

interface Filter {
    type: string;
    options: FilterOption[];
}

interface ShoppingAd {
    position: number;
    block_position: string;
    title: string;
    seller: string;
    link: string;
    price: string;
    extracted_price: number;
    image: string;
}

interface ShoppingResult {
    position: number;
    product_id: string;
    title: string;
    link: string;
    product_link: string;
    seller: string;
    offers: string;
    extracted_offers: number;
    offers_link: string;
    price: string;
    extracted_price: number;
    rating: number;
    reviews: number;
    delivery: string;
    thumbnail: string;
}

interface FeaturedResult extends ShoppingResult {
    remark: string;
    extensions?: string[];
}

interface CategoryOption {
    title: string;
    link: string;
    thumbnail: string;
}

interface Category {
    type: string;
    options: CategoryOption[];
}

interface Pagination {
    current: number;
    next: string;
    other_pages: Record<number, string>;
}

interface SearchResponse {
    search_metadata: SearchMetadata;
    search_parameters: SearchParameters;
    search_information: {
        query_displayed: string;
        page: number;
        detected_location: string;
    };
    filters: Filter[];
    shopping_ads: ShoppingAd[];
    shopping_results: ShoppingResult[];
    featured_results: FeaturedResult[];
    categories: Category[];
    pagination: Pagination;
}

export { SearchResponse };
