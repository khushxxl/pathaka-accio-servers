import { Query, Recommendation, Topic, User } from '@prisma/client';

export interface UserApi {
    Get: {
        Request: null;
        Response: User;
    };

    Create: {
        Request: Omit<User, 'id' | 'authId' | 'createdAt' | 'updatedAt'>;
        Response: User;
    };

    PersonalisationStatus: {
        Request: null;
        Response: {
            status: 'NotStarted' | 'Started' | 'Complete' | 'Failed';
            services: {
                name: string;
                status: string;
            }[];
        };
    };
}

export interface DiscoveryApi {
    GetProducts: {
        Request: null;
        Response: {
            title: string;
            seller: string;
            price: string;
            link: string;
            image: string;
            ratings: number;
            reviews: number;
        }[];
    };
}

export interface OAuthApi {
    Google: {
        GetUrl: {
            Request: null;
            Response: {
                url: string;
            };
        };
        Callback: {
            Request: {
                token: string;
            };
            Response: {
                success: boolean;
            };
        };
    };
}

export interface QueryApi {
    Get: {
        Request: string;
        Response: Query;
    };

    GetAll: {
        Request: null;
        Response: Record<string, Query[]>;
    };

    Create: {
        Request: Omit<
            Query,
            | 'id'
            | 'userId'
            | 'createdAt'
            | 'updatedAt'
            | 'podcastIdeas'
            | 'script'
            | 'podcastUrl'
            | 'category'
        >;
        Response: Query;
    };
}

export interface TopicApi {
    Get: {
        Request: string;
        Response: Topic;
    };

    GetAll: {
        Request: null;
        Response: Record<string, Topic[]>;
    };

    Create: {
        Request: Omit<
            Topic,
            'id' | 'userId' | 'createdAt' | 'updatedAt' | 'podcastIdeas'
        >;
        Response: Topic;
    };
}

export interface RecommendationApi {
    GetAll: {
        Request: null;
        Response: {
            recommendations: string[];
        };
    };
}

