import { pool } from "./db.js";

async function checkDb() {
    try {
        const result = await pool.query('SELECT current_database() AS database, current_user AS username;')
        console.log(result.rows[0]);
    } finally {
        await pool.end()
    }
}

await checkDb()