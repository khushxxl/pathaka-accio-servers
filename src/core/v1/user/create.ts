import { db } from '../../../common/db';
import { TokenPayload } from '../../../common/types';
import { ErrorHandler } from './../../../common/error';
import { UserApi } from './../../../common/types/api';

const create = async (
    newUser: any,
    payload: TokenPayload
): Promise<UserApi['Create']['Response']> => {
    try {
        const user = await db.user.create({
            data: {
                ...newUser
            }
        });
        return user;
    } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
    }
};

export default create;
