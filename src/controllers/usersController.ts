import type { Request, Response } from "express"
import { loadUsers } from "../loadUsers.js";
import { userSchema } from "../userSchema.js";
import { saveUsers } from "../saveUsers.js";


export const getUsers = async (_request: Request, response: Response) => {
    const users = await loadUsers()

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
        const users = await loadUsers()
        const currentUser = users.find(user => user.id === numberId)
        if (currentUser) {
            response.json(currentUser)
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