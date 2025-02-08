import { TokenPayload } from 'common/types';

import { statusCodes, userConstants } from './../../../common/config/constants';
import { db } from './../../../common/db';
import { ErrorHandler } from './../../../common/error';
import { searchProducts } from './../../../common/modules/searchapi';
import { DiscoveryApi } from './../../../common/types/api';

const NUM_PRODUCTS = 5;

interface IProduct {
    title: string;
    seller: string;
    price: string;
    link: string;
    image: string;
    ratings: number;
    reviews: number;
}

const getProducts = async (
    payload: TokenPayload
): Promise<DiscoveryApi['GetProducts']['Response']> => {
    try {
        const user = await db.user.findUnique({
            where: {
                authId: payload.sub
            }
        });
        if (!user) {
            throw new ErrorHandler(
                statusCodes.NOT_FOUND,
                userConstants.NOT_FOUND
            );
        }
        const userPersonalization = await db.userPersonalisation.findUnique({
            where: {
                userId: user.id
            }
        });
        let keywords: string[] = [];
        if (userPersonalization) {
            const getRandomItems = (arr: string[], num: number) => {
                const shuffled = [...arr].sort(() => 0.5 - Math.random());
                return shuffled.slice(0, num);
            };
            keywords = getRandomItems(
                userPersonalization.ecommerceTopics,
                NUM_PRODUCTS
            );
        }
        const promises = [];
        for (const keyword of keywords) {
            promises.push(searchProducts({ keyword }));
        }
        const apiResponse = await Promise.all(promises);
        const responses = apiResponse.map((response) => {
            return response.shopping_results.map((item) => {
                return {
                    title: item.title,
                    seller: item.seller,
                    price: item.price,
                    link: item.link,
                    image: item.thumbnail,
                    ratings: item.rating,
                    reviews: item.reviews
                };
            });
        });
        let flattenedArray = responses.flat();
        const shuffleArray = (arr: IProduct[]) =>
            arr.sort(() => 0.5 - Math.random());
        flattenedArray = shuffleArray(flattenedArray);
        return flattenedArray;
    } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
    }
};

export default getProducts;
