import { Request, Response } from "express";
import { ResponseHandler } from "../utils/responseHandler";
import { logger } from "@octavio.cubillos/simple-logger-express";
import BaseController from "./base.controller";
import { DeploymentService } from "../services/deploymentService";

export default new class DeployController extends BaseController {

    private deploymentService: DeploymentService = new DeploymentService();

    get = async (req: Request, res: Response) => {
        // try {
        const { stackName, id } = req.params;
        this.options = ["last"];
        const {query, options} = this.filterQuery(req.query, ['status'])

        console.log({query, options});
        const deployments = await (id ? this.deploymentService.findById(Number(id)) : this.deploymentService.filterbyData({ stackName, ...query }, options));
        // const data = (Array.isArray(deployments) ? deployments : [deployments]).map((deployment: any) => ({
        //     ...deployment,
        //     resources: JSON.parse(deployment.resources)
        // }))

        // if(options.last || id){
        //     return this.resSuccess(res, deployments, "Deployment fetched successfully");
        // }
        
        return this.resSuccess(res, deployments, "Deployments fetched successfully");
        // } catch (error) {
        //     console.error('Error fetching latest deployment:', error);
        //     ResponseHandler.error(res, 'Internal server error', error);
        // }
    }

    async create(req: Request, res: Response) {
        try {
            const { stackName } = req.params;
            
            const deploymentData = req.body;
            deploymentData.stackName = stackName;
            logger.debug('Deployment data:', {deploymentData});

            const deploymentService = new DeploymentService();
            // deploymentData.resources = deplymentData.resources.map((r: any) => r.name);
            const deployment = await deploymentService.createDeployment(deploymentData);

            ResponseHandler.success(res, deployment, 'Deployment created successfully');
        } catch (error) {
            console.error('Error creating deployment:', error);
            ResponseHandler.error(res, 'Internal server error', error);
        }
    }

    async createOrUpdate(req: Request, res: Response) {
        try {
            const { stackName, id } = req.params;
            const deploymentData = req.body;
            deploymentData.stackName = stackName;
            deploymentData.id = id;
            logger.debug('Deployment data:', deploymentData);

            const deploymentService = new DeploymentService();
            const deployment = await deploymentService.createOrUpdateDeployment(deploymentData);

            ResponseHandler.success(res, deployment, 'Deployment created/updated successfully');
        } catch (error) {
            console.error('Error creating or updating deployment:', error);
            ResponseHandler.error(res, 'Internal server error', error);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { stackName, id } = req.params;
            const deploymentData = req.body;
            deploymentData.stackName = stackName;
            deploymentData.id = id;
            logger.debug('Deployment update data:', deploymentData);

            const deploymentService = new DeploymentService();
            const deployment = await deploymentService.updateDeployment(deploymentData);

            ResponseHandler.success(res, deployment, 'Deployment updated successfully');
        } catch (error) {
            console.error('Error updating deployment:', error);
            ResponseHandler.error(res, 'Internal server error', error);
        }
    }

}