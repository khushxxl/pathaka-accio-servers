import express from 'express';

import {
    getProducts
    // Automation: importController
} from '../../../controllers/v1/discovery.controller';
import { checkJwt } from './../../../../common/middleware/auth';

const discoveryRouter = express.Router();

discoveryRouter.get('/products', checkJwt, getProducts);
// Automation: addRoute

export default discoveryRouter;
