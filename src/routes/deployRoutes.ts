import { Router } from 'express';
import deployController from '../controllers/deployController';

export const deployRouter = Router();
deployRouter.get('/:stackName{/:id}', deployController.get);
deployRouter.post('/:stackName', deployController.create);
deployRouter.put('/:stackName{/:id}', deployController.update);