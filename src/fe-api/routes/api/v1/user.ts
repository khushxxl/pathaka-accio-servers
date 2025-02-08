import express from 'express';

import {
    create,
    // Automation: importController
    get,
    personalisationStatus
} from '../../../controllers/v1/user.controller';
import { checkJwt } from './../../../../common/middleware/auth';

const userRouter = express.Router();

userRouter.post('/', checkJwt, create);
// Automation: addRoute
userRouter.get('/', checkJwt, get);
userRouter.get('/personalisation/status', checkJwt, personalisationStatus);

export default userRouter;
