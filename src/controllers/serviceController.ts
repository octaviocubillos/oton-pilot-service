import { Request, Response } from "express";
import { ResponseHandler } from "../utils/responseHandler";
import { DeploymentService } from "../services/deploymentService";

export default new class ServiceController {
	
    async health(req: Request, res: Response) {
        ResponseHandler.success(res, 'Servicio funcionando correctamente');
    }
}