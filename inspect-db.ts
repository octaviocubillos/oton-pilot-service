import { Database } from './src/database';

(async () => {
    try {
        await Database.connect();
        const db = Database.get();
        const tokens = await db.all('SELECT * FROM app_tokens');
        console.log("=== Tokens in DB ===");
        console.log(JSON.stringify(tokens, null, 2));
    } catch (e) {
        console.error(e);
    }
})();
