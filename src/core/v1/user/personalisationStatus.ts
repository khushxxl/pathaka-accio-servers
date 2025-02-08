import { TokenPayload } from 'common/types';

import { statusCodes, userConstants } from './../../../common/config/constants';
import { db } from './../../../common/db';
import { ErrorHandler } from './../../../common/error';
import { UserApi } from './../../../common/types/api';

enum Status {
    NotStarted = 'NotStarted',
    Started = 'Started',
    Complete = 'Complete',
    Failed = 'Failed'
}

const status = async (
    payload: TokenPayload
): Promise<UserApi['PersonalisationStatus']['Response']> => {
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
        const googleDMA = await db.googleDMA.findUnique({
            where: {
                userId: user.id
            }
        });
        const googleDMASearchStatus = {
            name: 'GOOGLE_SEARCH',
            status: !googleDMA ? Status.NotStarted : googleDMA.searchJobStatus
        };
        const googleDMAYoutubeStatus = {
            name: 'GOOGLE_YOUTUBE',
            status: !googleDMA ? Status.NotStarted : googleDMA.youtubeJobStatus
        };
        const services = [];
        services.push(googleDMASearchStatus);
        services.push(googleDMAYoutubeStatus);
        let globalStatus = Status.Complete;
        for (const service of services) {
            if (service.status === Status.Started) {
                globalStatus = Status.Started;
                break;
            }
            if (service.status === Status.NotStarted) {
                globalStatus = Status.NotStarted;
                break;
            }
        }
        const res = {
            status: globalStatus,
            services: services
        };
        return res;
    } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
    }
};

export default status;
