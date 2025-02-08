import express from 'express';

import {
    // Automation: importController
    create,
    get,
    getAll
} from '../../../controllers/v1/topic.controller';
import { checkJwt, getUser } from './../../../../common/middleware/auth';

const topicRouter = express.Router();

// Automation: addRoute
topicRouter.post('/', checkJwt, getUser, create);
topicRouter.get('/', checkJwt, getUser, getAll);
topicRouter.get('/:id', checkJwt, getUser, get);

export default topicRouter;
