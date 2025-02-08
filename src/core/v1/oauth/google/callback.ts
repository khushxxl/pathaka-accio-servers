import { GoogleDMAStatus } from '@prisma/client';
import { TokenPayload } from 'common/types';

import {
    statusCodes,
    userConstants
} from '../../../../common/config/constants';
import { db } from '../../../../common/db';
import { ErrorHandler } from '../../../../common/error';
import { OAuthApi } from '../../../../common/types/api';
import { initiateArchiveJob } from './../../../../common/modules/googleapi';

const callback = async (
    callbackPayload: OAuthApi['Google']['Callback']['Request'],
    payload: TokenPayload
): Promise<OAuthApi['Google']['Callback']['Response']> => {
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
        const data = await initiateArchiveJob(callbackPayload.token);
        await db.googleDMA.upsert({
            where: {
                userId: user.id
            },
            update: {
                token: callbackPayload.token,
                searchJobStatus: GoogleDMAStatus.Started,
                youtubeJobStatus: GoogleDMAStatus.Started,
                searchJobId: data.searchJobId.archiveJobId,
                youtubeJobId: data.youtubeJobId.archiveJobId,
                lockedBy: ''
            },
            create: {
                token: callbackPayload.token,
                userId: user.id,
                searchJobStatus: GoogleDMAStatus.Started,
                youtubeJobStatus: GoogleDMAStatus.Started,
                searchJobId: data.searchJobId.archiveJobId,
                youtubeJobId: data.youtubeJobId.archiveJobId,
                lockedBy: ''
            }
        });
        return {
            success: true
        };
    } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
    }
};

export default callback;
