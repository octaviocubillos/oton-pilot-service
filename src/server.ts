import express from 'express';
import { initLogger, logger } from '@octavio.cubillos/simple-logger-express';
import { setupProxy } from './proxy';
import { proxyRouter } from './routes/proxyRoutes';
import { config } from './config';
import { Database } from './database';
import { RouteModel } from './models/Route';
import { DeploymentModel } from './models/Deployment';
import { AppTokenModel } from './models/AppToken';
import { apiRouter } from './routes';

const app = express();
const PORT = config.port;

app.use(initLogger({ output: 'text' }));

(async () => {
    try {
        // 1. Inicializar Base de Datos
        await Database.connect();

        // 2. Inicializar Modelos (Tablas)
        await RouteModel.init();
        await DeploymentModel.init();
        await AppTokenModel.init();

        // 3. Configurar Proxy
        await setupProxy(app);

        app.use(express.json());
        app.use('/api', apiRouter);

        app.listen(PORT, () => {
            logger.info(`Servidor escuchando en http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
})();