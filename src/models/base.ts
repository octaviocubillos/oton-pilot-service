import { logger } from '@octavio.cubillos/simple-logger-express';
import { Database } from '../database';

export abstract class BaseModel<T> {
    protected tableName: string;
    protected schema: Record<string, string>;

    constructor(tableName: string, schema: Record<string, string>) {
        this.tableName = tableName;
        this.schema = schema;
    }

    async init() {
        const db = Database.get();
        const columns = Object.entries(this.schema)
            .map(([key, definition]) => `${key} ${definition}`)
            .join(', ');

        const sql = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ${columns}
        )`;

        await db.exec(sql);

        // Migración simple: agregar columnas faltantes
        const existingColumns = await db.all(`PRAGMA table_info(${this.tableName})`);
        const existingColumnNames = existingColumns.map((col: any) => col.name);

        for (const [key, definition] of Object.entries(this.schema)) {
            if (!existingColumnNames.includes(key)) {
                console.log(`Agregando columna faltante: ${key} a ${this.tableName}`);
                await db.exec(`ALTER TABLE ${this.tableName} ADD COLUMN ${key} ${definition}`);
            }
        }
    }

    async findAll(): Promise<T[]> {
        logger.debug(`Finding all ${this.tableName}`);
        const db = Database.get();
        return await db.all<T[]>(`SELECT * FROM ${this.tableName}`);
    }

    async findById(id: number | string): Promise<T> {
        logger.debug(`Finding ${this.tableName} by id: ${id}`);
        const db = Database.get();
        const r = await db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, id);
        if(!r) throw new Error(`Deployment not found with id ${id}`);
        for (const i of Object.keys(r)) {
            if (typeof r[i] === 'string' && this.isJson(r[i])) {
                console.log(r[i]);
                r[i] = JSON.parse(r[i]);
            }
        }
        return r;
    }

    async create(data: Partial<T>): Promise<T> {
        logger.debug(`Creating ${this.tableName} with data: ${JSON.stringify(data)}`);
        const db = Database.get();
        if (Object.prototype.hasOwnProperty.call(this.schema, 'createdAt')) {
            (data as any).createdAt = new Date().toISOString();
        }

        const keys = Object.keys(data);
        const values = Object.values(data);
        for (let i = 0; i < values.length; i++) {
            if (typeof values[i] === 'object') {
                values[i] = JSON.stringify(values[i]);
            }
        }
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const r = await db.run(sql, ...values);
        if (!r.lastID) throw new Error('Deployment not created');
        const d = await this.findById(r.lastID);
        if (!d) throw new Error('Deployment not found');
        return d;
    }

    async update(data: Partial<T>): Promise<T> {
        logger.debug(`Updating ${this.tableName} with data: ${JSON.stringify(data)}`);
        const id = (data as any).id;
        const db = Database.get();

        if (Object.prototype.hasOwnProperty.call(this.schema, 'updatedAt')) {
            (data as any).updatedAt = new Date().toISOString();
        }
        const keys = Object.keys(data);
        const values = Object.values(data);

        for (let i = 0; i < values.length; i++) {
            if (typeof values[i] === 'object') {
                values[i] = JSON.stringify(values[i]);
            }
        }
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;

        await db.run(sql, ...values, id);
        const d = await this.findById(id);
        if (!d) throw new Error('Deployment not updated');
        return d;
    }

    async deleteById(id: number | string): Promise<boolean> {
        logger.debug(`Deleting ${this.tableName} with id: ${id}`);
        const db = Database.get();
        const r = await db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, id);
        if (!r || !r.changes || r.changes === 0) throw new Error('Deployment not deleted');
        return true;
    }

    async deleteAll(): Promise<void> {
        logger.debug(`Deleting all ${this.tableName}`);
        const db = Database.get();
        await db.run(`DELETE FROM ${this.tableName}`);
    }

    async filterbyData(data: Partial<T>, options?: { last?: boolean, id?: number }): Promise<T[]> {
        logger.debug(`Filtering ${this.tableName} by data: ${JSON.stringify(data)}`);
        const db = Database.get();
        const keys = Object.keys(data);
        const values = Object.values(data);

        if (keys.length === 0) {
            return this.findAll();
        }

        const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
        let sql = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;

        if(options?.last){
            sql = `${sql} ORDER BY id DESC LIMIT 1`;
        }
        const r = await db.all(sql, ...values);
        for(const i of r){
            for(const j of Object.keys(i)){
                if(typeof i[j] === 'string' && this.isJson(i[j])){
                    i[j] = JSON.parse(i[j]);
                }
            }
        }
        return r;
    }

    private isJson(str: string): boolean {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }


}
