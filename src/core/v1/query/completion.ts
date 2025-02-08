import fs from 'fs';
import path from 'path';

import { db } from '../../../common/db';
import { prefetchSubtopicResearch } from '../../../common/modules/ai/prompts';
import { getCurrentSpeakerConfig } from '../../../common/modules/elevenlabs';
import { generateImage } from '../../../common/modules/image-gen';
import { generateFactSheetResearch } from '../../../common/modules/perplexity';
import { webSearch } from '../../../common/modules/search';
import { UploadParams } from '../../../common/types/s3.types';
import { configVariables } from '../../../fe-api/config/vars';
import { uploadFileToS3 } from '../../../fe-api/utils/s3-file-access.util';
import {
    queryConstants,
    statusCodes
} from './../../../common/config/constants';
import { ErrorHandler } from './../../../common/error';
import { logger } from './../../../common/logger';
import { generateCompletionClaude } from './../../../common/modules/ai';
import {
    generateConclusionPrompt,
    generateFactSheetPrompt,
    generateIntroPrompt,
    generateMainPrompt,
    generateOutlinePrompt,
    Outline
} from './../../../common/modules/ai/prompts';
import { podcastcompletion } from './podcastcompletion';

interface ClaudeResponses {
    content: string;
    error: string;
}

const saveImageToS3 = async (base64Image: string, podcastName: string) => {
    try {
        const base64Data = base64Image.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Define a temporary file path
        const tempFilePath = path.join('/tmp', `${podcastName}.png`);

        // Write the image buffer to a temporary file
        fs.writeFileSync(tempFilePath, imageBuffer);

        // Upload the temp file to S3
        const s3Url = await uploadFileToS3({
            bucketName:
                configVariables.PODCASTS_STORE_BUCKET ?? 'pathaka-podcasts',
            fileName: `${podcastName}/image.png`,
            filePath: tempFilePath
        });

        // Delete the temporary file after upload
        fs.unlinkSync(tempFilePath);
        logger.info(`Temp file deleted: ${tempFilePath}`);

        return s3Url;
    } catch (error) {
        logger.error('Error saving image to S3:', error);
        throw error;
    }
};

const saveAudioToFile = async (base64Audio: string, podcastName: string) => {
    try {
        const base64Data = base64Audio.replace(/^data:audio\/mpeg;base64,/, '');
        const audioBuffer = Buffer.from(base64Data, 'base64');

        // Define a temporary file path
        const tempFilePath = path.join('/tmp', `${podcastName}.mp3`);

        // Write the audio buffer to a temporary file
        fs.writeFileSync(tempFilePath, audioBuffer);
        // Upload the temp file to S
        const s3Url = await uploadFileToS3({
            bucketName:
                configVariables.PODCASTS_STORE_BUCKET ?? 'pathaka-podcasts',
            fileName: `${podcastName}/audio.mp3`,
            filePath: tempFilePath
        });

        // Delete the temporary file after upload
        fs.unlinkSync(tempFilePath);
        logger.debug(`Temp file deleted: ${tempFilePath}`);

        return s3Url;
    } catch (error) {
        logger.error('Error saving audio to S3:', error);
        throw error;
    }
};

interface QueryInput {
    id: string;
    query: string;
}

const createSafeFileName = (title: string): string => {
    // Log the input title for debugging
    logger.info('Creating filename from title:', title);

    if (!title || typeof title !== 'string') {
        logger.warn('Invalid title input:', title);
        return `podcast-${Date.now()}.mp3`; // Fallback filename with .mp3
    }

    // Take first 8 words, convert to lowercase, remove special chars
    const shortTitle = title
        .split(/\s+/) // Split on whitespace
        .slice(0, 8) // Take first 8 words
        .join('-') // Join with hyphens
        .toLowerCase() // Convert to lowercase
        .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric chars except hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    // Always return with .mp3 extension
    return `${shortTitle || `podcast-${Date.now()}`}`;
};

const generateScriptSequentially = async (
    parsedFactSheet: any,
    outlineObj: Outline,
    speakerConfig: any
) => {
    try {
        let fullScript = '';

        // Generate Introduction
        logger.info('Generating introduction...');
        const introductionPrompt = generateIntroPrompt({
            factSheet: parsedFactSheet.factsheet,
            outline: outlineObj,
            sectionName: 'Introduction',
            wordCountGoal: 230,
            speakerConfig
        });

        const introduction = await generateCompletionClaude(
            introductionPrompt.messages,
            introductionPrompt.systemPrompt
        );
        fullScript += introduction.toString().trim();
        logger.info('Introduction generated');

        // Generate each section sequentially
        for (let i = 0; i < outlineObj.subtopics.length; i++) {
            logger.info(`Generating section ${i + 1}...`);
            const sectionPrompt = await generateMainPrompt({
                factSheet: parsedFactSheet.factsheet,
                sectionName: `Section ${i + 1}`,
                wordCountGoal: 775,
                subtopic: outlineObj.subtopics[i],
                outline: outlineObj,
                speakerConfig,
                previousScript: fullScript
            });

            const section = await generateCompletionClaude(
                sectionPrompt.messages,
                sectionPrompt.systemPrompt
            );
            fullScript += '\n' + section.toString().trim();
            logger.info(`Section ${i + 1} generated`);
        }

        // Generate Conclusion
        logger.info('Generating conclusion...');
        const conclusionPrompt = generateConclusionPrompt({
            factSheet: parsedFactSheet.factsheet,
            outline: outlineObj,
            sectionName: 'Conclusion',
            wordCountGoal: 230,
            speakerConfig,
            previousScript: fullScript
        });

        const conclusion = await generateCompletionClaude(
            conclusionPrompt.messages,
            conclusionPrompt.systemPrompt
        );
        fullScript += '\n' + conclusion.toString().trim();
        logger.info('Conclusion generated');

        return fullScript.trim();
    } catch (error) {
        logger.error('Error in sequential script generation:', error);
        throw error;
    }
};

const completion = async (query: QueryInput): Promise<any> => {
    try {
        logger.info('Starting completion for query:', query);

        // 1. Use Brave search for factsheet (not Perplexity)
        const searchResults = await webSearch(query.query);

        const factSheetPrompt = generateFactSheetPrompt({
            query: query.query,
            searchResults: searchResults.results // Pass Brave search results
        });

        logger.info('Fact sheet prompt generated');
        logger.info('Fact sheet prompt generated', factSheetPrompt);

        const factSheet: ClaudeResponses | string =
            await generateCompletionClaude(
                factSheetPrompt.messages,
                factSheetPrompt.systemPrompt
            );
        if (!factSheet) {
            throw new ErrorHandler(
                statusCodes.NOT_FOUND,
                queryConstants.NO_FACTSHEET_FOUND
            );
        }

        // Add validation and parsing
        try {
            // Try to parse it as JSON first
            const factSheetContent = factSheet.toString();
            logger.info('Raw factsheet content:', factSheetContent);

            if (!factSheetContent.startsWith('{')) {
                logger.error('Invalid factsheet format:', factSheetContent);
                throw new Error('Response is not in JSON format');
            }

            const parsedFactSheet = JSON.parse(factSheetContent);
            logger.info('Parsed factsheet:', parsedFactSheet);

            if (!parsedFactSheet.imagePrompt) {
                logger.error('No imagePrompt in factsheet:', parsedFactSheet);
                throw new Error('Factsheet missing imagePrompt');
            }

            logger.info('Image generation started in background');

            logger.info(
                '=================== FACT SHEET RESPONSE ==================='
            );
            logger.info(JSON.stringify(parsedFactSheet, null, 2)); // Pretty prints the entire JSON
            logger.info('=================== IMAGE PROMPT ===================');
            logger.info(parsedFactSheet.imagePrompt.description);
            logger.info(
                '========================================================'
            );

            // Continue with outline generation
            const outlinePrompt = generateOutlinePrompt({
                factSheet: parsedFactSheet.factsheet
            });
            logger.info('Outline prompt generated');

            logger.info('Outline prompt', outlinePrompt);

            const outlineResponse: ClaudeResponses | string =
                await generateCompletionClaude(
                    outlinePrompt.messages,
                    outlinePrompt.systemPrompt
                );

            if (!outlineResponse) {
                throw new ErrorHandler(
                    statusCodes.NOT_FOUND,
                    'No outline generated'
                );
            }

            logger.info('=============== OUTLINE AND TAGS =================');
            console.log(outlineResponse.toString()); // Log the full response
            logger.info('========================================');

            const { outline: outlineObj, tags } = JSON.parse(
                outlineResponse.toString()
            );

            const podcastName = createSafeFileName(outlineObj.title);

            const generatedImage = await generateImage(
                parsedFactSheet.imagePrompt
            ).catch((error) => {
                logger.error('Image generation failed:', error);
                // Non-critical error, don't throw
            });

            const imageURL = await saveImageToS3(
                generatedImage?.base64 ?? '',
                podcastName
            );

            logger.info('Outline object', outlineObj);
            logger.info('Tags:', tags);

            // Create safe filename from the outline title instead of factsheet

            logger.info('Generated audio filename:', podcastName);

            // 2. After outline is generated, prefetch all subtopic research from Perplexity
            await prefetchSubtopicResearch(outlineObj);

            // Make the speaker selection once at the start
            const speakerConfig = getCurrentSpeakerConfig();

            // Replace the Promise.all section with sequential generation
            const fullScript = await generateScriptSequentially(
                parsedFactSheet,
                outlineObj,
                speakerConfig
            );

            // Check word count
            const wordCount = fullScript.split(/\s+/).length;
            if (wordCount < 4000) {
                // If short, you can re-prompt for expansion. For now, just log a warning.
                logger.warn(
                    `Script is too short. Word count: ${wordCount}. Consider expanding some segments.`
                );
                // You might implement another prompt call here to expand content.
            }

            // YOU MAY WANT TO SEE THE SCRIPT BEFORE OR AFTER CLEANING. THE OTHER CONSOLE LOG IS IN PODCASTCOMPLETION.TS
            //    logger.info(`Full script assembled ${fullScript}`);

            logger.info('Starting podcast generation');

            let s3Url = undefined;

            // Handle audio generation first - this is critical
            let base_64 = '';
            try {
                const output_audio = await podcastcompletion(fullScript);
                base_64 = output_audio.toString('base64');

                // Saving file to S3
                s3Url = await saveAudioToFile(base_64, podcastName);
                logger.info('Audio file saved to S3:', s3Url);

                // Update DB with script and audio
                await db.query.update({
                    where: { id: query.id },
                    data: {
                        // script: fullScript,
                        podcastUrl: s3Url,
                        imageUrl: imageURL
                        // -> commenting this out, cause this cause schema error, we need to save this in the s3 bucket as well, at the moment we get base 64, convert into URL
                    }
                });
                logger.info('Script and audio saved to DB');
            } catch (audioError) {
                logger.error('Audio generation failed:', audioError);
                throw audioError; // Audio generation is critical, so we throw the error
            }

            return {
                script: fullScript,
                podcastUrl: s3Url,
                imageUrl: imageURL
            };
        } catch (error) {
            logger.error('Failed to parse factsheet:', error);
            logger.error('Original factsheet content:', factSheet);
            throw new ErrorHandler(
                statusCodes.BAD_REQUEST,
                'Invalid factsheet format received'
            );
        }
    } catch (error) {
        logger.error('Error in completion:', error);
        throw error;
    }
};

export { completion };
