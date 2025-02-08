interface SearchQuery {
    original: string;
    show_strict_warning: boolean;
    is_navigational: boolean;
    is_news_breaking: boolean;
    spellcheck_off: boolean;
    country: string;
    bad_results: boolean;
    should_fallback: boolean;
    postal_code: string;
    city: string;
    header_country: string;
    more_results_available: boolean;
    state: string;
}

interface InfoboxAttribute {
    [index: number]: string;
}

interface InfoboxProfile {
    name: string;
    url: string;
    long_name: string;
    img: string;
}

interface InfoboxImage {
    src: string;
    alt: string;
    original: string;
    logo: boolean;
}

interface InfoboxProvider {
    type: string;
    name: string;
    url: string;
    img: string;
}

interface InfoboxResult {
    title: string;
    url: string;
    is_source_local: boolean;
    is_source_both: boolean;
    description: string;
    family_friendly: boolean;
    type: string;
    position: number;
    long_desc: string;
    attributes: InfoboxAttribute[][];
    profiles: InfoboxProfile[];
    website_url: string;
    providers: InfoboxProvider[];
    images: InfoboxImage[];
    subtype: string;
}

interface Infobox {
    type: string;
    results: InfoboxResult[];
}

interface MixedMainItem {
    type: string;
    index: number;
    all: boolean;
}

interface Mixed {
    type: string;
    main: MixedMainItem[];
    top: MixedMainItem[];
}

interface WebMetaUrl {
    scheme: string;
    netloc: string;
    hostname: string;
    favicon: string;
    path: string;
}

interface WebProfile {
    name: string;
    url: string;
    long_name: string;
    img: string;
}

interface WebThumbnail {
    src: string;
    original: string;
    logo: boolean;
}

interface WebArticleAuthor {
    type: string;
    name: string;
    url: string;
}

interface WebArticlePublisherThumbnail {
    src: string;
    original: string;
}

interface WebArticlePublisher {
    type: string;
    name: string;
    url: string;
    thumbnail: WebArticlePublisherThumbnail;
}

interface WebArticle {
    author: WebArticleAuthor[];
    date: string;
    publisher: WebArticlePublisher;
}

interface WebResult {
    title: string;
    url: string;
    is_source_local: boolean;
    is_source_both: boolean;
    description: string;
    page_age: string;
    profile: WebProfile;
    language: string;
    family_friendly: boolean;
    type: string;
    subtype: string;
    meta_url: WebMetaUrl;
    age: string;
    extra_snippets: string[];
    thumbnail?: WebThumbnail;
    article?: WebArticle;
}

interface Web {
    type: string;
    results: WebResult[];
    family_friendly: boolean;
}

interface RawSearchResponse {
    query: SearchQuery;
    infobox: Infobox;
    mixed: Mixed;
    type: string;
    web: Web;
    news: Web;
}

interface SearchResponse {
    web: {
        url: string;
        title: string;
        description: string;
        website: string;
    }[];
}

export { RawSearchResponse, SearchResponse };
