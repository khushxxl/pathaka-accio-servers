import { readFile } from 'node:fs/promises';

import {
    PutObjectCommand,
    S3Client,
    S3ServiceException
} from '@aws-sdk/client-s3';
import { UploadParams } from 'common/types/s3.types';

import { logger } from '../../common/logger';
import { configVariables } from '../config/vars';

export const uploadFileToS3 = async ({
    bucketName,
    fileName,
    filePath
}: UploadParams): Promise<string> => {
    const client = new S3Client({
        region: 'us-east-1', 
        endpoint: 'https://s3.amazonaws.com', 
        credentials: {
            accessKeyId: configVariables.ACCESS_KEY_AWS ?? '',
            secretAccessKey: configVariables.SECRET_KEY_AWS ?? ''
        }
    });

    try {
        const fileBuffer = await readFile(filePath);

        // Create the PutObjectCommand with the file and bucket details
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: fileBuffer
        });

        // Send the upload command to S3
        const response = await client.send(command);
        logger.info(
            `File uploaded successfully to s3://${bucketName}/${fileName}`,
            response
        );

        // Construct and return the S3 URL
        const s3Url = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
        logger.info(`File accessible at ${s3Url}`);
        return s3Url;
    } catch (error) {
        if (error instanceof S3ServiceException) {
            logger.error(`S3 Error: ${error.name} - ${error.message}`);
            if (error.name === 'EntityTooLarge') {
                logger.error(
                    'Error: The file is too large to upload directly. Consider using multipart upload.'
                );
            }
        } else {
            logger.error('Unexpected error occurred:', error);
        }

        // Rethrow the error to notify the caller
        throw error;
    }
};
