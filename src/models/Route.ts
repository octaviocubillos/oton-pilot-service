import { BaseModel } from './base';

export interface IRoute {
    id?: number;
    subdomain: string;
    target: string;
    description?: string;
    createdAt: string;
    url?: string;
    isPublic: number; // 1 = true, 0 = false
    publicPaths: string; // JSON Array or CSV: ["/login", "/assets"]
}

export class RouteModel extends BaseModel<IRoute> {
    constructor() {
        super('routes', {
            subdomain: 'TEXT UNIQUE NOT NULL',
            target: 'TEXT NOT NULL',
            description: 'TEXT',
            createdAt: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP',
            isPublic: 'INTEGER DEFAULT 1',
            publicPaths: 'TEXT DEFAULT "[]"' 
        });
    }

    static async init() {
        await RouteModel.getInstance().init();
    }

    // Singleton instance
    private static instance: RouteModel;

    static getInstance(): RouteModel {
        if (!RouteModel.instance) {
            RouteModel.instance = new RouteModel();
        }
        return RouteModel.instance;
    }
}
