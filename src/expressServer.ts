import express, { type Express, type NextFunction, type Request, type Response } from "express"
import { loadUsers } from "./loadUsers.js";
import { request } from "node:http";
import { userSchema } from "./userSchema.js";
import { log } from "node:console";
import { saveUsers } from "./saveUsers.js";

const app: Express = express()
const port = 3001

const middleWare = (request: Request, response: Response, next: NextFunction) => {
    console.log(request.method,  request.path);
    next()
}

app.use(middleWare)

app.use(express.json())

app.get("/health", (request: Request, response: Response) => {
    response.status(200).json({ status: "ok" })
})

app.post("/echo", (request, response) => {
    response.status(200).json({ received: request.body})
})

app.get("/users", async (request, response) => {
    try {
        const users = await loadUsers()

        response.json(users)
    } catch (error) {
        console.error(error);
        
        response.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/users/:id", async (request, response) => {
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
})


app.post("/users", async (request, response) => {
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
})


app.listen(port, () => {
    console.log("Server is running on http://localhost:" + port);
})