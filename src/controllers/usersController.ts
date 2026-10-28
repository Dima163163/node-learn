import type { Request, Response } from "express"
import { loadUsers } from "../loadUsers.js";
import { userSchema } from "../userSchema.js";
import { saveUsers } from "../saveUsers.js";
import { pool } from '../db.js';

type DbUser = {
    id: number
    name: string
}

export const getUsers = async (_request: Request, response: Response) => {
    const result = await pool.query<DbUser>(
        'SELECT id, name FROM users ORDER BY id;'
    )

    response.json(result.rows)
}

export const getUserById =  async(request: Request, response: Response) => {
    const id = request.params.id
    const numberId = Number(id)

    const validId = Number.isInteger(numberId) && numberId > 0
    if (!validId) {
        response.status(400).json({ error: "Bad request" })
        return
    }

    try {
        const result = await pool.query<DbUser>(
            "SELECT id, name FROM users WHERE id = $1",
            [numberId]
        )
        const user = result.rows[0]
        if (user) {
            response.json(user)
        } else {
            response.status(404).json({error: "Not found"})
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Internal server error" })
    }
}


export const createUser = async(request: Request, response: Response) => {
    const validateUserData = userSchema.safeParse(request.body)
    if (!validateUserData.success) {
        response.status(400).json({
            error: "Validation failed",
            issues: validateUserData.error.issues
        })
        return
    }

    try {
        const users = await loadUsers()
        const ids = users.map(user => user.id)
        const newUserId = Math.max(0, ...ids) + 1
        const newUser = {
            id: newUserId,
            name: validateUserData.data.name
        }
        await saveUsers([...users, newUser])
        response.status(201).json(newUser)
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Internal server error" })
    }
}