import {
    queryConstants,
    statusCodes
} from '../../../common/config/constants';
import { db } from '../../../common/db';
import { ErrorHandler } from '../../../common/error';
import { RecommendationApi } from '../../../common/types/api';

const getAll = async (): Promise<RecommendationApi['GetAll']['Response']> => {
    try {
        const queries = await db.recommendation.findMany({
            take: 100,
            select:{
                id: false,
                recommendation: true
            }
        });
        if (!queries) {
            throw new ErrorHandler(
                statusCodes.NOT_FOUND,
                queryConstants.NOT_FOUND
            );
        }

        // Transform array of objects to array of strings
        const recommendations = queries.map(query => query.recommendation);

        return { recommendations};
    } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
    }
};

export default getAll;
