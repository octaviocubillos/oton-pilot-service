import { BaseModel } from './base';

export interface IAppToken {
    id?: number;
    appName: string;
    token: string;
    description?: string;
    isActive: number; // 1 = true, 0 = false (SQLite uses 0/1 for booleans)
    scopes: string; // "*" for all, or comma separated subdomains "app1,app2"
    allowedOrigins: string; // "*" for all, or comma separated origins "https://app.com,http://localhost"
    createdAt: string;
}

export class AppTokenModel extends BaseModel<IAppToken> {
    constructor() {
        super('app_tokens', {
            appName: 'TEXT NOT NULL',
            token: 'TEXT UNIQUE NOT NULL',
            description: 'TEXT',
            isActive: 'INTEGER DEFAULT 1',
            scopes: 'TEXT DEFAULT "*"',
            allowedOrigins: 'TEXT DEFAULT "*"',
            createdAt: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP'
        });
    }

    static async init() {
        await AppTokenModel.getInstance().init();
    }

    // Singleton instance
    private static instance: AppTokenModel;

    static getInstance(): AppTokenModel {
        if (!AppTokenModel.instance) {
            AppTokenModel.instance = new AppTokenModel();
        }
        return AppTokenModel.instance;
    }

    /**
     * Valida si el token existe, está activo y tiene permiso para el subdominio especificado y el origen.
     */
    async checkAccess(token: string, subdomain: string, origin: string = ''): Promise<boolean> {
        const tokens = await this.filterbyData({ token: token, isActive: 1 });
        
        if (tokens.length === 0) return false;
        
        const tokenData = tokens[0];
        
        let tokenAllowedOrigins = tokenData.allowedOrigins || '*';
        let tokenScopes = tokenData.scopes || '*';

        // 1. Origin Check (si NO es *, validamos)
        // Check wildcard string or wildcard array
        const isWildcard = tokenAllowedOrigins === '*' || (Array.isArray(tokenAllowedOrigins) && tokenAllowedOrigins.includes('*'));

        if (!isWildcard) {
            // Si se definen origenes restrictivos y no viene origen en la petición -> Denegar
            if (!origin) return false;

            let allowedOrigins: string[] = [];

            if (Array.isArray(tokenAllowedOrigins)) {
                allowedOrigins = tokenAllowedOrigins;
            } else if (typeof tokenAllowedOrigins === 'string') {
                try {
                    if (tokenAllowedOrigins.startsWith('[')) {
                        allowedOrigins = JSON.parse(tokenAllowedOrigins);
                    } else {
                        allowedOrigins = tokenAllowedOrigins.split(',').map(s => s.trim());
                    }
                } catch (e) {
                    allowedOrigins = tokenAllowedOrigins.split(',').map(s => s.trim());
                }
            }

            if (!allowedOrigins.includes(origin) && !allowedOrigins.includes(origin + '/')) {
                 return false;
            }
        }

        // 2. Super admin check (Scopes)
        if (tokenScopes === '*') return true;
        // Si scopes llego como array y contiene '*'
        if (Array.isArray(tokenScopes) && tokenScopes.includes('*')) return true;

        // 3. Scope check
        let allowedScopes: string[] = [];
        console.log("DEBUG: tokenScopes type:", typeof tokenScopes, "Value:", JSON.stringify(tokenScopes));
        
        if (Array.isArray(tokenScopes)) {
            allowedScopes = tokenScopes;
        } else if (typeof tokenScopes === 'string') {
             try {
                if (tokenScopes.startsWith('[')) {
                    allowedScopes = JSON.parse(tokenScopes);
                } else {
                    allowedScopes = tokenScopes.split(',').map(s => s.trim());
                }
            } catch {
                allowedScopes = tokenScopes.split(',').map(s => s.trim());
            }
        }
        
        console.log("DEBUG: allowedScopes final:", JSON.stringify(allowedScopes));

        return allowedScopes.includes(subdomain);
    }
}
