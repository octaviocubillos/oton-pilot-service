import { Request, Response } from 'express';
import { clearProxyCache, proxyConfig } from '../proxy';
import BaseController from './base.controller';
import { RouteService } from '../services/routeService';

export default new class ProxyController extends BaseController {

    private routesService: RouteService = new RouteService();

    default = async (req: Request, res: Response) => {
        const host = req.headers.host!; // Sabemos que existe por el middleware anterior
        res.send(`
        <h1>Servidor Proxy Inverso</h1>DeploymentService
        <p>El servidor está funcionando.</p>
        <p>Prueba los siguientes subdominios (configura tu /etc/hosts si es necesario):</p>
        <ul>
        ${proxyConfig
                .map(
                    (c) =>
                        `<li><a href="http://${c.subdomain}.${host.replace('service.', '')}">${c.subdomain}.${host.replace('service.', '')}</a> -> ${c.target}</li>`
                )
                .join('')}
        </ul>
    `);
    }

    cacheClear = async (req: Request, res: Response) => {
        clearProxyCache();
        return this.resSuccess(res, 'Cache limpiado correctamente');
    }

    addProxy = async (req: Request, res: Response) => {
        this.validateInput(req.body, ['subdomain', 'target']);
        const { subdomain, target } = req.body;

        const existingConfig = await this.routesService.filterbyData({ subdomain });
        if (existingConfig.length > 0) {
            return this.resError(res, `Ya existe una ruta para el subdominio '${subdomain}'.`);
        }

        if (await this.routesService.createRoute({ subdomain, target })) {
            clearProxyCache();  
            this.resSuccess(res, { subdomain, target }, 'Ruta agregada correctamente');
        } else {
            this.resError(res, 'Error al agregar la ruta');
        }
    }

    getProxy = async (req: Request, res: Response) => {

        const { id } = req.params;
        this.options = ['last']
        const {query, options} = this.filterQuery(req.query, ['subdomain', 'target'])

        const proxyConfigs = await (id? this.routesService.findById(Number(id)) : this.routesService.filterbyData({ ...query }, options));
        return this.resSuccess(res, proxyConfigs, 'Configuraciones de proxy obtenidas correctamente');
    }

    updateProxy = async (req: Request, res: Response) => {
        const { subdomain, target } = req.body;
        const { id } = req.params;
        if (!subdomain || !target || !id) {
            return this.resError(res, 'Faltan parámetros: subdominio, target y id son requeridos.');
        }

        const existingConfig = await this.routesService.filterbyData({ subdomain });
        if (existingConfig.length > 0) {
            return this.resError(res, `Ya existe una ruta para el subdominio '${subdomain}'.`);
        }

        if (await this.routesService.updateRoute({ subdomain, target, id: Number(id) })) {
            clearProxyCache();  
            this.resSuccess(res, { subdomain, target }, 'Ruta actualizada correctamente');
        } else {
            this.resError(res, 'Error al actualizar la ruta');
        }
    }

    deleteProxy = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return this.resError(res, 'Faltan parámetros: id es requerido.');
        }

        if (await this.routesService.deleteRoute(Number(id))) {
            clearProxyCache();  
            this.resSuccess(res, { id }, 'Ruta eliminada correctamente');
        } else {
            this.resError(res, 'Error al eliminar la ruta');
        }
    }

}