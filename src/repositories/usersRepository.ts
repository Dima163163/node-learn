import { pool } from "../db.js"

type DbUser = {
    id: number
    name: string
}

export const getAllUsers = async () => {
    const result = await pool.query<DbUser>(
        'SELECT id, name FROM users ORDER BY id;'
    )

    return result.rows
}

export const findUserById = async (id: number) => {
    const result = await pool.query<DbUser>(
        'SELECT id, name FROM users WHERE id = $1;',
        [id]
    )

    return result.rows[0] ?? null
}