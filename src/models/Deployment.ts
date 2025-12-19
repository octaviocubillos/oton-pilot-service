import { BaseModel } from './base';
import { Database } from '../database';

export interface IDeployment {
    id?: number;
    stackName: string;
    resources: string; // JSON string
    status: string;
    createdAt: string;
}

export class DeploymentModel extends BaseModel<IDeployment> {
    constructor() {
        super('deployments', {
            stackName: 'TEXT NOT NULL',
            resources: 'TEXT NOT NULL',
            status: 'TEXT NOT NULL DEFAULT "PENDING"',
            createdAt: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP'
        });
    }

    static async init() {
        await DeploymentModel.getInstance().init();
    }

    // Singleton instance
    private static instance: DeploymentModel;

    static getInstance(): DeploymentModel {
        if (!DeploymentModel.instance) {
            DeploymentModel.instance = new DeploymentModel();
        }
        return DeploymentModel.instance;
    }

    async findLatestByStack(stackName: string): Promise<IDeployment | undefined> {
        const db = Database.get();
        return await db.get<IDeployment>(
            `SELECT * FROM ${this.tableName} WHERE stackName = ? AND status = 'SUCCESS' ORDER BY createdAt DESC LIMIT 1`,
            stackName
        );
    }
}
