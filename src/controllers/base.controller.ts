
import { Response } from 'express';
import { ParsedQs } from "qs";
import { CreateError, createError } from '../utils/apiError';
// import { Opts as CrudOpts} from "../services/crud.service";

// import { createError, CreateError } from "../utils/error";

interface D {
    [x: string]: string
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: any;
}



export interface Opts extends /* CrudOpts,  */D { }
type ValidationInput = Record<string, string>;

export default class BaseController {
    public options: string[] = []

    filterQuery = <T=D>(query:string | string[] | ParsedQs | ParsedQs[] | undefined | {[x: string]: string}, filter?: string[]): {query:T, options: Opts} => {

        const tras = (v:string, op?: boolean) => {
            const _v = {"false": false,"true": true,"null": null}[v];
            if(op && v == "") return true;
            return _v;
        }
        console.log({query, filter});
        return {
            query: Object.entries(query as D).reduce((acc, [k, v]) => (!([...["id"], ...(filter || [])]).includes(k) ? acc : {...acc, [k]: tras(v) || v}), {}) as T,
            options: Object.entries(query as D).reduce((acc, [k, v]) => (!([...["startDate", "endDate", "date", "sortField", "sortOrder", "status", "limit"], ...this.options].includes(k)) ? acc : {...acc, [k]: tras(v, true) || v}), {}) as Opts
        }
    }

    validateInput = (input: ValidationInput, values: string[]) => {
        for (const value of values) {
            if (input[value] == undefined || String(input[value]).trim() == "")
                throw new CreateError(`Invalid field, "${value}" is required`);
        }
    }
    
    resError = (res: Response, error: unknown): Response => res.status(createError(error).status).json(createError(error).data);

    resSuccess = <T=D>(res: Response, data?: T, msg?: string) => {
        const response: ApiResponse<T> = {
            success: true,
            data,
            message: msg || 'successful'
        };
        
        res.status(200).json(response);
    };

} 
