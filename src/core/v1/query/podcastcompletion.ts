// THIS FILE SERVES TO CLEAN THE FINAL SCRIPT FROM THE LLM AND THEN SENDS IT TO ELEVEN LABS TO BE CONVERTED TO AN AUDIO FILE

import { generateElevenLabsPodcast } from '../../../common/modules/elevenlabs/index';
import { logger } from './../../../common/logger';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

const VALID_SPEAKERS = ['Rowan', 'Alex'];
const INTRO_AUDIO_PATH =
    process.env.INTRO_AUDIO_PATH ||
    path.join(__dirname, '../../../../assets/audio/intro.mp3');
const OUTRO_AUDIO_PATH =
    process.env.OUTRO_AUDIO_PATH ||
    path.join(__dirname, '../../../../assets/audio/outro.mp3');

// Function to concatenate intro, main audio, and outro
async function concatenateAudio(mainAudioBuffer: Buffer): Promise<Buffer> {
    try {
        // Create temporary files for processing
        const tempDir = os.tmpdir();
        const tempMainPath = path.join(tempDir, `main-${Date.now()}.mp3`);
        const tempOutputPath = path.join(tempDir, `output-${Date.now()}.mp3`);

        // Write the main audio buffer to a temporary file
        await fs.writeFile(tempMainPath, mainAudioBuffer);

        // Check which audio files exist
        const [introExists, outroExists] = await Promise.all([
            fs
                .access(INTRO_AUDIO_PATH)
                .then(() => true)
                .catch(() => false),
            fs
                .access(OUTRO_AUDIO_PATH)
                .then(() => true)
                .catch(() => false)
        ]);

        // Return a promise that resolves with the concatenated audio buffer
        return new Promise((resolve, reject) => {
            const ffmpegCommand = ffmpeg();

            // Add intro if it exists
            if (introExists) {
                ffmpegCommand.input(INTRO_AUDIO_PATH);
            }

            // Add main audio
            ffmpegCommand.input(tempMainPath);

            // Add outro if it exists
            if (outroExists) {
                ffmpegCommand.input(OUTRO_AUDIO_PATH);
            }

            ffmpegCommand
                .on('error', async (error: Error) => {
                    // Clean up temp files
                    await Promise.all([
                        fs.unlink(tempMainPath).catch(() => {}),
                        fs.unlink(tempOutputPath).catch(() => {})
                    ]);
                    logger.error('Error concatenating audio:', error);
                    reject(error);
                })
                .on('end', async () => {
                    try {
                        // Read the output file
                        const outputBuffer = await fs.readFile(tempOutputPath);

                        // Clean up temp files
                        await Promise.all([
                            fs.unlink(tempMainPath).catch(() => {}),
                            fs.unlink(tempOutputPath).catch(() => {})
                        ]);

                        resolve(outputBuffer);
                    } catch (err) {
                        reject(err);
                    }
                })
                .mergeToFile(tempOutputPath, tempDir);
        });
    } catch (error) {
        logger.error('Error in concatenateAudio:', error);
        throw error;
    }
}

const podcastcompletion = async (fullScript: string) => {
    try {
        const json_script = getScriptJSON(fullScript as string);
        logger.info(
            `Processing podcast script with ${json_script.length} segments`
        );

        const mainAudioResponse = await generateElevenLabsPodcast(json_script);
        const arrayBuffer = await mainAudioResponse.arrayBuffer();
        const mainAudioBuffer = Buffer.from(new Uint8Array(arrayBuffer));

        // Concatenate intro with main audio
        // logger.info('Concatenating intro with main audio...');
        // const finalAudioBuffer = await concatenateAudio(mainAudioBuffer);
        // logger.info('Audio concatenation completed successfully');

        return mainAudioBuffer;
    } catch (error) {
        logger.error('Error in podcast completion:', error);
        throw error;
    }
};

interface SpeakerSegment {
    id: number;
    text: string;
}

const getScriptJSON = (script: string): Array<SpeakerSegment> => {
    if (!VALID_SPEAKERS.some((name) => script.includes(`<${name}>`))) {
        logger.error('No valid speaker tags found in script');
        throw new Error('Invalid script format: No valid speaker tags found');
    }

    const result: Array<SpeakerSegment> = [];
    let currentSpeakerId: number | null = null;
    let currentText = '';

    // Updated pattern to capture speaker names
    const parts = script.split(/(?=<(?:Rowan|Alex)>)/);

    parts.forEach((part) => {
        // Match either Rowan or Alex and map to their IDs
        const speakerMatch = part.match(/<(Rowan|Alex)>/);

        if (speakerMatch) {
            // Save previous segment if exists
            if (currentSpeakerId !== null && currentText.trim()) {
                result.push({
                    id: currentSpeakerId,
                    text: currentText.trim()
                });
            }
            // Map speaker names to IDs (Rowan = 1, Alex = 2)
            currentSpeakerId = speakerMatch[1] === 'Rowan' ? 1 : 2;
            // Remove speaker tag and clean the remaining text
            currentText = part
                .replace(/<(?:Rowan|Alex)>:?\s*/g, '') // Remove speaker tags
                .replace(/\n\s*\n/g, ' ')
                .replace(/['"]\s*<[^>]+>\s*['"]/g, '') // Remove quoted emotion tags
                .replace(/<(?!break\b)[^>]+>/g, '') // Remove all angle bracket tags except break
                .replace(/\.{3,}/g, '...') // Normalize any sequence of 3+ dots to exactly 3
                .replace(/\\"/g, '"') // Replace escaped quotes with regular quotes
                .trim();
        } else if (currentSpeakerId !== null) {
            // Append text with proper spacing
            const cleanText = part
                .replace(/['"]\s*<[^>]+>\s*['"]/g, '')
                .replace(/<[^>]+>/g, '')
                .trim();
            if (cleanText) {
                currentText = currentText
                    ? `${currentText} ${cleanText}`
                    : cleanText;
            }
        }
    });

    // Handle final segment
    if (currentSpeakerId !== null && currentText.trim()) {
        result.push({
            id: currentSpeakerId,
            text: currentText.trim()
        });
    }

    // Add logging to see the cleaned script
    logger.info(
        '=================== SCRIPT AFTER CLEANING OPERATIONS ==================='
    );
    logger.info(
        'Cleaned text after removing tags, normalizing spaces, and formatting:'
    );
    const formattedScript = result
        .map(
            (segment) =>
                `${segment.id === 1 ? 'Rowan' : 'Alex'}: ${segment.text}`
        )
        .join('\n\n');
    logger.info(formattedScript);
    logger.info(
        '===================================================================='
    );

    return result;
};

export { podcastcompletion };
