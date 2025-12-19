const ENV = process.env || {};
const getEnv = (key: string, defaultValue: string | number) => (ENV[key] || defaultValue);

export const config = {
    port: getEnv('PORT', 3000),
    host: getEnv('HOST', 'proxy.localhost'),
    dbPath: getEnv('DB_PATH', './database.db'),

}