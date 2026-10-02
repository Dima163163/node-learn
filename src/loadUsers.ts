import path from "node:path";
import { readFile } from "node:fs/promises"

type User = {
    id: number
    name: string
}

type UsersFile = {
    users: User[]
}

export const loadUsers = async () => {
    const fileUsersPath = path.resolve("data", "users.json")
    const file = await readFile(fileUsersPath, "utf-8")
    const resultParsed = JSON.parse(file) as UsersFile

    return resultParsed.users
}