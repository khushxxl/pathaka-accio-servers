import { logger } from '../../../common/logger';
import { configVariables } from '../../config/vars/index';

interface Speaker {
    id: string;
    gender: 'male' | 'female';
    name: string;
    voiceSettings: {
        stability: number;
        similarity_boost: number;
    };
}

const speakers: { [key: number]: Speaker } = {
    1: {
        id: '1SM7GgM6IMuvQlz2BwM3',
        gender: 'male',
        name: 'Rowan',
        voiceSettings: {
            stability: 0.45,
            similarity_boost: 0.85
        }
    },
    2: {
        id: 'kPzsL2i3teMYv0FxEYQ6',
        gender: 'female',
        name: 'Alex',
        voiceSettings: {
            stability: 0.43,
            similarity_boost: 0.7
        }
    }
};

function getRandomizedSpeakers() {
    const shouldSwap = Math.random() < 0.5;
    if (shouldSwap) {
        // Alex as host (ID 2), Rowan as cohost (ID 1)
        return {
            host: speakers[2],    // Alex
            coHost: speakers[1]   // Rowan
        };
    } else {
        // Rowan as host (ID 1), Alex as cohost (ID 2)
        return {
            host: speakers[1],    // Rowan
            coHost: speakers[2]   // Alex
        };
    }
}

const getSpeakerAudio = async (
    text: string,
    speaker: Speaker,
    apiKey: string,
    previousRequestIds: string[]
) => {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${speaker.id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'xi-api-key': apiKey
                    },
                    body: JSON.stringify({
                        text,
                        model_id: 'eleven_turbo_v2_5',
                        voice_settings: speaker.voiceSettings,
                        previous_request_ids: previousRequestIds
                    })
                }
            );

            if (response.status === 429) {
                const delay = baseDelay * Math.pow(2, attempt);
                logger.info(`Rate limited. Waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            return response;
        } catch (error) {
            if (attempt === maxRetries - 1) throw error;
        }
    }
    throw new Error('Max retries reached');
};

const generateElevenLabsPodcast = async (
    script: Array<{ id: number; text: string }>
) => {
    if (!configVariables.ELEVEN_LABS_API_KEY) {
        throw new Error('ElevenLabs API key not configured');
    }

    const { host, coHost } = getRandomizedSpeakers();
    const speakerMapping: Record<1 | 2, Speaker> = {
        1: host,
        2: coHost
    };

    const podcast_script = script;
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const previousRequestIds: string[] = [];
    let totalAudioSize = 0;

    (async () => {
        try {
            let segmentCount = 0;
            for (const entry of podcast_script) {
                segmentCount++;
                logger.info(
                    `Processing segment ${segmentCount}/${podcast_script.length}`
                );

                // Add delay only every 80 segments
                if (segmentCount % 80 === 0) {
                    logger.info('Reached 80 segments, taking a break...');
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
                }

                const speaker = speakerMapping[entry.id as 1 | 2];
                const response = await getSpeakerAudio(
                    entry.text,
                    speaker,
                    configVariables.ELEVEN_LABS_API_KEY || '',
                    previousRequestIds.slice(-3)
                );

                if (!response.ok) {
                    throw new Error(
                        `API request failed: ${response.status} ${response.statusText}`
                    );
                }

                const requestId = response.headers.get('request-id');
                if (requestId) {
                    previousRequestIds.push(requestId);
                }

                const audioData = await response.arrayBuffer();
                if (!audioData || audioData.byteLength === 0) {
                    throw new Error(
                        `Empty audio data received for segment ${segmentCount}`
                    );
                }

                totalAudioSize += audioData.byteLength;
                await writer.write(new Uint8Array(audioData));
            }

            logger.info('Finished processing all segments successfully');
            logger.info(
                `Total audio file size: ${(totalAudioSize / 1024 / 1024).toFixed(2)} MB`
            );
        } catch (error) {
            logger.error('Error while processing segments', error);
            writer.abort(error);
            throw error;
        } finally {
            logger.info('Closing writer stream');
            await writer.close();
        }
    })();

    return new Response(readable, {
        headers: {
            'Content-Type': 'audio/mpeg',
            'Transfer-Encoding': 'chunked',
            'Content-Disposition': `attachment; filename="audio-${Date.now()}.mp3"`
        }
    });
};

// Export the speaker configuration for use in prompts
export const getCurrentSpeakerConfig = () => {
    const { host, coHost } = getRandomizedSpeakers();
    return { host, coHost };
};

export { generateElevenLabsPodcast };
