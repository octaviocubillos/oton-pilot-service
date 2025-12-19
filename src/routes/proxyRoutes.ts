import { Router } from 'express';
import proxyController from '../controllers/proxyController';

export const proxyRouter = Router();




proxyRouter.get('/cache-clear', proxyController.cacheClear);

proxyRouter.get('/default', proxyController.default);

proxyRouter.post('/', proxyController.addProxy);

proxyRouter.get('{/:id}', proxyController.getProxy);

proxyRouter.put('/:id', proxyController.updateProxy);

proxyRouter.delete('/:id', proxyController.deleteProxy);
