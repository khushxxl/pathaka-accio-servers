import { TokenPayload } from 'common/types';

import {
    statusCodes,
    userConstants
} from '../../../../common/config/constants';
import { db } from '../../../../common/db';
import { ErrorHandler } from '../../../../common/error';
import { generateAuthUrl } from '../../../../common/modules/googleapi';
import { OAuthApi } from '../../../../common/types/api';

const getUrl = async (
    payload: TokenPayload
): Promise<OAuthApi['Google']['GetUrl']['Response']> => {
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
        const url = generateAuthUrl();
        return {
            url
        };
    } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
    }
};

export default getUrl;
