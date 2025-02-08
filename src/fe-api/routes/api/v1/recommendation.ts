import express from 'express';

import {
    getAll
} from '../../../controllers/v1/recommendation.controller';
import { checkJwt } from './../../../../common/middleware/auth';

const recommendationRouter = express.Router();

recommendationRouter.get('/', checkJwt, getAll);

export default recommendationRouter;

