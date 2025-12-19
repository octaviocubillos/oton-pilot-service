import { Database } from './src/database';
import { RouteModel } from './src/models/Route';

const seed = async () => {
    try {
        await Database.connect();
        await RouteModel.init();
        console.log('Conectado a SQLite y tabla inicializada');

        await RouteModel.getInstance().deleteAll();
        console.log('Rutas eliminadas');

        const routes = [
            { subdominio: 'google', target: 'https://www.google.com' },
            { subdominio: 'test', target: 'http://127.0.0.1:3001' },
            { subdominio: 'dremac', target: 'https://dremac.oton.cl' }
        ];

        for (const route of routes) {
            await RouteModel.getInstance().create(route);
        }
        console.log('Rutas insertadas');

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seed();
