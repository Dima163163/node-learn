import { pool } from "./db.js"

type User = {
    id: number
    name: string
}

export async function readUsers() {
    try {
        const result = await pool.query<User>(
            "SELECT id, name FROM users ORDER BY id;"
        )
        console.log(result.rows);
    } finally {
        await pool.end()
    }
}

await readUsers()