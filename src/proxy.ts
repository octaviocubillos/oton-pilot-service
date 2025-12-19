import { Express, Request, Response, NextFunction } from 'express';
import { logger } from '@octavio.cubillos/simple-logger-express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { RouteModel } from './models/Route';
import { config as _config } from './config';

import { AppTokenModel } from './models/AppToken';

export interface ProxyConfig {
    subdomain: string;
    target: string;
    isPublic: boolean;
    publicPaths: string[];
}

export let proxyConfig: ProxyConfig[] = [];
const proxyCache = new Map<string, RequestHandler>();

export const loadRoutes = async () => {
    try {
        const routes = await RouteModel.getInstance().findAll();
        proxyConfig = routes.map(r => ({ 
            subdomain: r.subdomain, 
            target: r.target, 
            isPublic: r.isPublic === 1,
            publicPaths: parsePublicPaths(r.publicPaths || '')
        }));
        logger.info('Rutas cargadas desde SQLite:', proxyConfig.length);
    } catch (error) {
        logger.error('Error al cargar rutas desde SQLite:', error);
    }
};

export const setupProxy = async (app: Express) => {
    await loadRoutes();
    app.use(dynamicProxyMiddleware);
};

export const clearProxyCache = async () => {
    proxyCache.clear();
    await loadRoutes();
    logger.info('Cache de proxies limpiado y rutas recargadas');
};

export const dynamicProxyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const host = String(req.headers.host).split(':')[0];
    if (!host) {
        return next();
    }

    const subdomain = host.replace(String(_config.host), '');
    if (!subdomain) {
        return next();
    }
    logger.info('Subdominio extraido:', subdomain);
    logger.info('Host:', host);
    const config = proxyConfig.find((c) => c.subdomain === subdomain.replace(".", ""));

    if (config) {
        // Verificar si la ruta es publica por excepcion
        // console.log(`[Whitelist Check] Path: ${req.path} | PublicPaths:`, config.publicPaths);
        const isWhitelisted = config.publicPaths.some(path => {
            // Caso wildcard: /product/*
            if (path.endsWith('/*')) {
                const base = path.slice(0, -2); // "/product"
                return req.path === base || req.path.startsWith(`${base}/`);
            }
            // Caso exacto: /login
            return req.path === path;
        });

        if (!config.isPublic && !isWhitelisted) {
            const token = req.headers['x-app-token'] as string;
            
            if (!token) {
                logger.warn(`Intento de acceso no autorizado a ${config.subdomain}: Falta token`);
                res.status(401).json({ error: 'Unauthorized: Token is required' });
                return;
            }

            const origin = req.headers.origin || req.headers.referer || '';
            
            AppTokenModel.getInstance().checkAccess(token, config.subdomain, origin as string).then(hasAccess => {
                if (!hasAccess) {
                    logger.warn(`Acceso denegado a ${config.subdomain}: Token inválido, sin permisos o origen no permitido (${origin})`);
                    res.status(403).json({ error: 'Forbidden: Invalid token or origin not allowed' });
                    return;
                }
                
                executeProxy(req, res, next, config);
            }).catch(err => {
                logger.error('Error validando token:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
            
            return; 
        }

        executeProxy(req, res, next, config);
        return;
    }

    next();
};

const executeProxy = (req: Request, res: Response, next: NextFunction, config: ProxyConfig) => {
    let proxy = proxyCache.get(config.subdomain);
    logger.info('Proxy encontrado');
    if (!proxy) {
        if(!config.target.startsWith("http")) {
            config.target = `http://${config.target}`;
        }
        proxy = createProxyMiddleware({
            target: config.target,
            changeOrigin: true,
        });
        proxyCache.set(config.subdomain, proxy);
        logger.info(`Proxy creado para ${config.subdomain} -> ${config.target}`);
    }

    return proxy(req, res, next);
}

const parsePublicPaths = (raw: string): string[] => {
    if (!raw) return [];
    try {
        if (raw.startsWith('[')) {
            return JSON.parse(raw);
        }
        return raw.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } catch {
        return [];
    }
}

