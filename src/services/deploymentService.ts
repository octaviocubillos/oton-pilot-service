import { DeploymentModel, IDeployment } from '../models/Deployment';

export class DeploymentService {

    private instance: DeploymentModel;

    constructor() {
        this.instance = DeploymentModel.getInstance();
    }

    async createOrUpdateDeployment(data: Omit<IDeployment, 'id' | 'createdAt'> & Partial<Pick<IDeployment, 'id'>>): Promise<IDeployment> {
        return await (!data.id? this.instance.create(data) : this.instance.update(data));
    }

    async updateDeployment(data: Partial<IDeployment>): Promise<IDeployment> {
        return await this.instance.update(data);
    }


    async createDeployment(data: Omit<IDeployment, 'id'>): Promise<IDeployment | undefined> {
        return await this.instance.create(data);
    }

    async getLatestDeployment(stackName: string): Promise<IDeployment | undefined> {
        return await this.instance.findLatestByStack(stackName);
    }

    async filterbyData(data: Partial<IDeployment>, options?: { last?: boolean, id?: number }): Promise<IDeployment[] | IDeployment> {
        const r = await this.instance.filterbyData(data, options);
        return options?.last ? r.at(-1) as IDeployment : r;
    }

    async findAll(): Promise<IDeployment[]> {
        return await this.instance.findAll();
    }

    async findById(id: number): Promise<IDeployment> {
        return await this.instance.findById(id);
    }

    async deleteById(id: number): Promise<void> {
        return await this.instance.deleteById(id);
    }

    async deleteAll(): Promise<void> {
        return await this.instance.deleteAll();
    }
}
