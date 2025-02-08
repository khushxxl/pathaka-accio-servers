import { logger } from './../common/logger';
import { app } from './app';
import { configVariables } from './config/vars';

// Define port to run the server on
const PORT = process.env.PORT || 8080;

// Start the server
logger.info(`ENVIRONMENT: ${configVariables.NODE_ENV}`);
app.listen(PORT, () => logger.info(`PORT: ${PORT}`));
