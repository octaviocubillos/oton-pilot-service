import {deployRouter} from './deployRoutes';
import {serviceRouter} from './serviceRoutes';
import { Router, Request, Response, NextFunction } from 'express';
import { proxyRouter } from './proxyRoutes';

export const apiRouter = Router();

// Middleware para restringir acceso solo al subdominio "service"
// Si no coincide, saltamos todo el router usando next('router')
// apiRouter.use((req: Request, res: Response, next: NextFunction) => {
//     console.log(req.headers.host, req.path);
//     const host = req.headers.host;
//     if (host && host.startsWith('service.')) {
//         next();
//     } else {
//         next('router'); // Salta al siguiente router/middleware fuera de este router
//     }
// });

apiRouter.use('/deploy', deployRouter);
apiRouter.use('/service', serviceRouter);
apiRouter.use('/proxy', proxyRouter);

