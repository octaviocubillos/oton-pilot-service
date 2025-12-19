import { logger } from '@octavio.cubillos/simple-logger-express';
import { RouteModel, IRoute } from '../models/Route';
import { config } from '../config';

export class RouteService {

    private instance: RouteModel;

    constructor() {
        this.instance = RouteModel.getInstance();
    }

    async createRoute(data: Omit<IRoute, 'id' | 'createdAt'>): Promise<IRoute|undefined> {
        return await this.instance.create(data);
    }

    async updateRoute(data: Omit<IRoute, 'createdAt'>): Promise<IRoute|undefined> {
        return await this.instance.update(data);
    }

    async deleteRoute(id: number): Promise<boolean> {
        return await this.instance.deleteById(id);
    }

    async filterbyData(data: Partial<IRoute>, options?: { last?: boolean, id?: number }): Promise<IRoute[] | IRoute> {
        const r = (await this.instance.filterbyData(data, options)).map((r) => {
            r.url = `http://${r.subdomain}.${config.host}`;
            return r;
        });
        return options?.last ? r.at(-1) as IRoute : r;
    }

    async findAll(): Promise<IRoute[]> {
        return await this.instance.findAll();
    }

    async findById(id: number): Promise<IRoute | undefined> {
        const r = await this.instance.findById(id);
        r.url = `http://${r.subdomain}.${config.host}`;
        return r;
    }

    async deleteById(id: number): Promise<void> {
        await this.instance.deleteById(id);
    }

    async deleteAll(): Promise<void> {
        await this.instance.deleteAll();
    }
}
