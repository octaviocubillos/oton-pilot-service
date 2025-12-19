import { logger } from "@octavio.cubillos/simple-logger-express";

interface D {[x: string]: string}

export class CreateError extends Error {
    success: boolean;
    data: D;
    status: number;
    message: string;



    constructor(error: unknown | D, status?:number, data?: D, filename?: string) {
        const _error = error as {[x: string]: string};
        const msg = typeof _error.message == "string" ? _error.message : typeof error == "string"? String(error) : "Error";
        super(msg);
        this.message = msg;
        this.success = false;
        this.data = data || {};
        this.status = status || Number(_error.status) || 200;
        if (typeof error === 'string') logger.error("Error capturado", this.toJson());
    }

    private toJson = () => JSON.stringify({...this, message: this.message}, null, 2);
}

export const createError = (error: unknown) => ({
    data: {
        success: false,
        message: (error as CreateError)?.message || error,
        data: (error as CreateError)?.data || {},
    },
    status: (error as CreateError)?.status || 200
})