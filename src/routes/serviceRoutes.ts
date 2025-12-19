import { Router } from 'express';
import ServiceController from '../controllers/serviceController';

export const serviceRouter = Router();

serviceRouter.get('/health', ServiceController.health);
