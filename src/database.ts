
import sqlite3 from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';
import { config } from './config';

export class Database {
    private static instance: SQLiteDatabase | null = null;

    static async connect() {
        if (this.instance) return this.instance;

        try {
            this.instance = await open({
                filename: config.dbPath as string,
                driver: sqlite3.Database
            });
            console.log('SQLite conectado correctamente');
            return this.instance;
        } catch (error) {
            console.error('Error al conectar a SQLite:', error);
            process.exit(1);
        }
    }

    static get() {
        if (!this.instance) {
            throw new Error('Base de datos no inicializada. Llama a Database.connect() primero.');
        }
        return this.instance;
    }
}
