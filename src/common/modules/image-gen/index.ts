import { logger } from '../../logger';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

const SEED_IMAGES = [
    'seed-image-1.png',
    'seed-image-2.png',
    'seed-image-3.png',
    'seed-image-4.png'
];

interface ImagePrompt {
    description: string;
}

export async function generateImage(
    imagePrompt: ImagePrompt
): Promise<{ base64: string; filePath: string }> {
    logger.info('Starting image generation with prompt:', imagePrompt);
    logger.info(
        'Using API key:',
        process.env.STABILITY_AI_API_KEY ? 'Present' : 'Missing'
    );

    if (!process.env.STABILITY_AI_API_KEY) {
        throw new Error('Stability AI API key not configured');
    }

    try {
        // Select random seed image
        const randomSeedImage =
            SEED_IMAGES[Math.floor(Math.random() * SEED_IMAGES.length)];
        logger.info('Selected seed image:', randomSeedImage);
        const seedImagePath = path.join(
            __dirname,
            '../../../../assets/seed-images',
            randomSeedImage
        );
        logger.info('Seed image path:', seedImagePath);

        // Create payload matching the sample code
        const payload = {
            image: fs.createReadStream(seedImagePath),
            prompt: imagePrompt.description,
            output_format: 'png'
        };

        const response = await axios.postForm(
            'https://api.stability.ai/v2beta/stable-image/control/style',
            axios.toFormData(payload, new FormData()),
            {
                validateStatus: undefined,
                responseType: 'arraybuffer',
                headers: {
                    Authorization: `Bearer ${process.env.STABILITY_AI_API_KEY}`,
                    Accept: 'image/*'
                }
            }
        );

        if (response.status !== 200) {
            logger.error('API Error:', response.status, response.statusText);
            throw new Error(
                `API request failed: ${response.status} ${response.data.toString()}`
            );
        }

        // Save the image
        const uploadsDir = path.join(__dirname, '../../../../uploads/images');
        logger.info(`Saving to directory: ${uploadsDir}`);

        if (!fs.existsSync(uploadsDir)) {
            logger.info('Creating uploads directory...');
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filename = `image-${Date.now()}.png`;
        const filePath = path.join(uploadsDir, filename);

        logger.info(`Writing file to: ${filePath}`);
        const imageBuffer = Buffer.from(response.data);
        fs.writeFileSync(filePath, imageBuffer);
        logger.info('File written successfully');

        return {
            base64: imageBuffer.toString('base64'),
            filePath: `/uploads/images/${filename}`
        };
    } catch (error) {
        if (error.response) {
            logger.error(
                'Stability AI Error Response:',
                error.response.data.toString()
            );
        }
        logger.error('Error generating/saving image:', error);
        throw error;
    }
}
