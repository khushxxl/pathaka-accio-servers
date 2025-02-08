import dotenv from 'dotenv';
dotenv.config();

import { GoogleDMA } from '@prisma/client';
import axios from 'axios';
import fs from 'fs';
import OpenAI from 'openai';
import path from 'path';
import unzipper from 'unzipper';

import { db } from './../common/db';
import { logger } from './../common/logger';
import { generateCompletionClaude } from './../common/modules/ai';
import { getArchiveJobStatus } from './../common/modules/googleapi';
import { configVariables } from './config/vars';
import { prompts } from './prompts';

logger.info(
    `STARTING DATA CRON: ${configVariables.NODE_ENV} - ${configVariables.IMAGE_TAG}`
);

enum GoogleFiles {
    discover = 'Discover',
    lens = 'Google Lens',
    search = 'Search',
    image = 'Image Search',
    video = 'Video Search',
    youtube = 'YouTube'
}

export interface ICleanedData {
    googleSearchQueries: string[];
    googleVideoWatches: string[];
    googleImageSearches: string[];
    googleDiscoverData: string[];
    youtubeData: string[];
}

async function executeJobs() {
    try {
        const googleJobs = runGoogleJobs();
        Promise.all([googleJobs]);
    } catch (err) {
        logger.error('Error processing job:', err);
    }
}

const runGoogleJobs = async () => {
    try {
        const jobs = await db.$transaction([
            db.googleDMA.findMany({
                where: {
                    searchJobStatus: 'Started',
                    lockedBy: ''
                }
            }),
            db.googleDMA.updateMany({
                where: {
                    searchJobStatus: 'Started',
                    lockedBy: ''
                },
                data: {
                    lockedBy: process.pid.toString()
                }
            })
        ]);

        logger.info(`Running ${jobs[0].length} google jobs`);

        const promises = [];
        for (const job of jobs[0]) {
            try {
                if (!job.token) {
                    throw new Error('Token is missing');
                }
                if (job.searchJobId) {
                    promises.push(processGoogleSearchJob(job));
                }
                if (job.youtubeJobId) {
                    promises.push(processGoogleYoutubeJob(job));
                }
            } catch (err) {
                logger.error('Error processing job:', err);
            }
        }
        return Promise.all(promises);
    } catch (err) {
        logger.error('Error running google jobs:', err);
    }
};

const processGoogleSearchJob = async (job: GoogleDMA) => {
    try {
        const searchJob = await getArchiveJobStatus(
            job.token,
            job.searchJobId as string
        );
        if (searchJob.state === 'COMPLETE' && searchJob.urls) {
            for (const url of searchJob.urls) {
                await downloadGoogleFiles(url, 'search', job.userId);
            }
            await db.googleDMA.update({
                where: {
                    id: job.id
                },
                data: {
                    searchJobStatus: 'Complete',
                    lockedBy: ''
                }
            });
        } else {
            await db.googleDMA.update({
                where: {
                    id: job.id
                },
                data: {
                    lockedBy: ''
                }
            });
        }
    } catch (error) {
        logger.error('Error processing search job:', error);
        await db.googleDMA.update({
            where: {
                id: job.id
            },
            data: {
                searchJobStatus: 'Failed',
                lockedBy: ''
            }
        });
    }
};

const processGoogleYoutubeJob = async (job: GoogleDMA) => {
    try {
        const youtubeJob = await getArchiveJobStatus(
            job.token,
            job.youtubeJobId as string
        );
        if (youtubeJob.state === 'COMPLETE' && youtubeJob.urls) {
            for (const url of youtubeJob.urls) {
                await downloadGoogleFiles(url, 'youtube', job.userId);
            }
            await db.googleDMA.update({
                where: {
                    id: job.id
                },
                data: {
                    youtubeJobStatus: 'Complete',
                    lockedBy: ''
                }
            });
        } else {
            await db.googleDMA.update({
                where: {
                    id: job.id
                },
                data: {
                    lockedBy: ''
                }
            });
        }
    } catch (error) {
        logger.error('Error processing youtube job:', error);
        await db.googleDMA.update({
            where: {
                id: job.id
            },
            data: {
                youtubeJobStatus: 'Failed',
                lockedBy: ''
            }
        });
    }
};

const downloadGoogleFiles = async (
    url: string,
    type: 'search' | 'youtube',
    userId: string
) => {
    try {
        logger.info(`Downloading file for user ${userId} of type ${type}`);

        // Create directory "data-files" if it doesn't exist
        const baseDir = path.join(__dirname, 'data-files');
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir);
        }

        // Create a subdirectory for the user
        const userDir = path.join(baseDir, userId);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir);
        }

        // Create a subdirectory for the type
        const typeDir = path.join(userDir, type);
        if (!fs.existsSync(typeDir)) {
            fs.mkdirSync(typeDir);
        }

        // Define the file path
        const filePath = path.join(typeDir, 'data.zip');

        // Define the directory for extraction
        const unzipPath = path.join(typeDir, 'unzipped_content');

        // Download the file
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        // Create a write stream to save the file at the specified filePath
        const fileStream = fs.createWriteStream(filePath);

        // Pipe the response data to the file
        response.data.pipe(fileStream);

        // Wait for the file to be fully written
        await new Promise((resolve, reject) => {
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
        });

        logger.info(`File downloaded successfully to ${filePath}`);

        // Ensure the unzip directory exists
        if (!fs.existsSync(unzipPath)) {
            fs.mkdirSync(unzipPath);
        }

        // Unzip the file into the unzipPath directory
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(unzipper.Extract({ path: unzipPath }))
                .on('close', resolve)
                .on('error', reject);
        });

        // Parse the files
        await parseGoogleFiles(type, userId);
    } catch (error) {
        logger.error('Error downloading files:', error);
    }
};

const parseGoogleFiles = async (type: 'search' | 'youtube', userId: string) => {
    try {
        logger.info(`Parsing files for user ${userId} of type ${type}`);

        // Define the directory for extraction
        const mainDir = path.join(__dirname, 'data-files');
        const typeDir = path.join(mainDir, userId, type);
        const unzipPath = path.join(typeDir, 'unzipped_content');

        const filePaths: string[] = [];

        // Recursive function to read and log files
        const readFilesRecursively = (dir: string) => {
            if (!fs.existsSync(dir)) {
                logger.warn(`Directory not found: ${dir}`);
                return;
            }

            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                if (!fs.existsSync(filePath)) {
                    logger.warn(`File not found: ${filePath}`);
                    continue;
                }

                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    // If the file is a directory, recursively read its contents
                    readFilesRecursively(filePath);
                } else if (stat.isFile()) {
                    // If the file is a regular file and file extension is .json, log the file path
                    if (
                        file.endsWith('.json') &&
                        !file.endsWith('archive_browser.json')
                    ) {
                        filePaths.push(filePath);
                    }
                }
            }
        };

        // Start reading from the unzipPath
        readFilesRecursively(unzipPath);

        const cleanedData: ICleanedData = {
            googleSearchQueries: [],
            googleVideoWatches: [],
            googleImageSearches: [],
            googleDiscoverData: [],
            youtubeData: []
        };

        // Read the files
        for (const filePath of filePaths) {
            if (!fs.existsSync(filePath)) {
                logger.warn(`File not found: ${filePath}`);
                continue;
            }

            // Take the top 100 results for search, video, image, and youtube
            const numResults = 100;
            // Take the top 30 results for discover
            const numDiscoverResults = 30;
            // Get the file type from the file path
            const fileType =
                filePath.split('/')[filePath.split('/').length - 2];
            // Check which of the GoogleFiles enum the fileType is
            const googleFileType = Object.values(GoogleFiles).find(
                (file) => file === fileType
            );

            const data = fs.readFileSync(filePath, 'utf8');

            if (googleFileType === GoogleFiles.search) {
                const topResults: {
                    title: string;
                }[] = JSON.parse(data).slice(0, numResults);
                for (const result of topResults) {
                    cleanedData.googleSearchQueries.push(result.title);
                }
            }

            if (googleFileType === GoogleFiles.video) {
                const topResults: {
                    title: string;
                }[] = JSON.parse(data).slice(0, numResults);
                for (const result of topResults) {
                    cleanedData.googleVideoWatches.push(result.title);
                }
            }

            if (googleFileType === GoogleFiles.image) {
                const topResults: {
                    title: string;
                }[] = JSON.parse(data).slice(0, numResults);
                for (const result of topResults) {
                    cleanedData.googleImageSearches.push(result.title);
                }
            }

            if (googleFileType === GoogleFiles.discover) {
                const topResults: {
                    details?: {
                        name: string;
                    }[];
                }[] = JSON.parse(data).slice(0, numDiscoverResults);
                for (const result of topResults) {
                    if (result.details) {
                        for (const detail of result.details) {
                            cleanedData.googleDiscoverData.push(detail.name);
                        }
                    }
                }
            }

            if (googleFileType === GoogleFiles.youtube) {
                const topResults: {
                    title: string;
                }[] = JSON.parse(data).slice(0, numResults);
                for (const result of topResults) {
                    cleanedData.youtubeData.push(result.title);
                }
            }
        }

        // Remove all files from typeDir
        fs.rm(typeDir, { recursive: true }, (err) => {
            if (err) {
                logger.error('Error removing files:', err);
            }
        });

        const promptContent =
            prompts.google[
                type === 'search' ? 'searchPrompt' : 'youtubePrompt'
            ](cleanedData);
        const prompt: { message: string } = {
            message: promptContent.message
        };

        // Generate completion
        const parsedData = await getParsedData(prompt);
        if (!parsedData) {
            throw new Error('Failed to parse data');
        }

        // Save the parsed data to the database
        let userPersonalisation = await db.userPersonalisation.findUnique({
            where: {
                userId: userId
            }
        });

        if (userPersonalisation) {
            userPersonalisation = await db.userPersonalisation.update({
                where: { userId: userId },
                data: {
                    searchTopics: {
                        push: parsedData.topics
                    },
                    ecommerceTopics: {
                        push: parsedData.ecommerce
                    }
                }
            });
        }

        if (!userPersonalisation) {
            userPersonalisation = await db.userPersonalisation.create({
                data: {
                    userId: userId,
                    provider: 'Google',
                    searchTopics: parsedData.topics,
                    ecommerceTopics: parsedData.ecommerce
                }
            });
        }

        logger.info(`Parsed data saved for user ${userId} of type ${type}`);
    } catch (error) {
        logger.error('Error parsing files:', error);
    }
};

const getParsedData = async (
    prompt: { message: string }
) => {
    try {
        const messages = [{ role: 'user' as const, content: prompt.message }];
        const systemPrompt = 'You are a data analysis assistant that processes Google activity data and returns structured JSON responses.';

        const res = await generateCompletionClaude(messages, systemPrompt);

        if (typeof res === 'string') {
            // Clean the string by removing the code block
            const cleanedString = res.replace(/```json|```/g, '').trim();

            try {
                const parsedData: {
                    topics: string[];
                    ecommerce: string[];
                } = JSON.parse(cleanedString);
                return parsedData;
            } catch (error) {
                logger.error('Error parsing JSON:', error);
                throw new Error('Failed to parse JSON');
            }
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        logger.error('Error getting parsed data:', error);
        throw error;
    }
};

executeJobs();
