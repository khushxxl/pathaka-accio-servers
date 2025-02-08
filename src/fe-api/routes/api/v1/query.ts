import express from 'express';

import {
    // Automation: importController
    create,
    get,
    getAll
} from '../../../controllers/v1/query.controller';
import { checkJwt, getUser } from './../../../../common/middleware/auth';

const queryRouter = express.Router();

// Automation: addRoute
queryRouter.post('/', checkJwt, getUser, create);
queryRouter.get('/', checkJwt, getUser, getAll);
queryRouter.get('/:id', checkJwt, getUser, get);

export default queryRouter;
