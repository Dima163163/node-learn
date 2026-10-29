import type { Request, Response } from "express"
import { userSchema } from "../userSchema.js";
import { pool } from '../db.js';
import { findUserById, getAllUsers } from "../repositories/usersRepository.js";

type DbUser = {
    id: number
    name: string
}

export const getUsers = async (_request: Request, response: Response) => {
    const users = await getAllUsers()

    response.json(users)
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
        const user = await findUserById(numberId)
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
        const result = await pool.query<DbUser>(
            "INSERT INTO users (name) VALUES ($1) RETURNING id, name;",
            [validateUserData.data.name]
        )

        const newUser = result.rows[0]

        response.status(201).json(newUser)
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Internal server error" })
    }
}