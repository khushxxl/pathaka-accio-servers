import express from 'express';

import {
    googleCallback,
    googleGetUrl
    // Automation: importController
} from '../../../controllers/v1/oauth.controller';
import { checkJwt } from './../../../../common/middleware/auth';

const oauthRouter = express.Router();

oauthRouter.get('/google/url', checkJwt, googleGetUrl);
oauthRouter.post('/google/callback', checkJwt, googleCallback);
// Automation: addRoute

export default oauthRouter;
