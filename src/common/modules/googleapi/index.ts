import axios from 'axios';
import { google } from 'googleapis';

import { configVariables } from './../../config/vars';

const oauth2Client = new google.auth.OAuth2(
    configVariables.GOOGLE_CLIENT_ID,
    configVariables.GOOGLE_CLIENT_SECRET,
    `${configVariables.APP_BASE_URL}/oauth/google/callback`
);

const scopes = [
    'https://www.googleapis.com/auth/dataportability.myactivity.search',
    'https://www.googleapis.com/auth/dataportability.myactivity.youtube'
];

const generateAuthUrl = () => {
    const url = oauth2Client.generateAuthUrl({
        scope: scopes,
        response_type: 'token',
        include_granted_scopes: false,
        state: 'developer-specified-value'
    });
    return url;
};

const initiateArchiveJob = async (token: string) => {
    const url =
        'https://dataportability.googleapis.com/v1/portabilityArchive:initiate';

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
    };

    const search = {
        resources: ['myactivity.search']
    };

    const youtube = {
        resources: ['myactivity.youtube']
    };

    const { data: searchJobId } = await axios.post(url, search, { headers });
    const { data: youtubeJobId } = await axios.post(url, youtube, { headers });
    return {
        searchJobId,
        youtubeJobId
    };
};

const getArchiveJobStatus = async (
    token: string,
    jobId: string
): Promise<{
    state: string;
    urls?: string[];
}> => {
    const url = `https://dataportability.googleapis.com/v1/archiveJobs/${jobId}/portabilityArchiveState`;

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
    };

    const response = await axios.get(url, { headers });
    return response.data;
};

export { generateAuthUrl, getArchiveJobStatus, initiateArchiveJob };
