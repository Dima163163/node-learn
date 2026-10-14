import path from "node:path"
import { writeFile, readFile } from "node:fs/promises";
import type { User } from "./loadUsers.js"


export const saveUsers = async (users: User[]): Promise<void> => {
    const fileUsersPath = path.resolve("data", "users.json")
    const file = await readFile(fileUsersPath, "utf-8")
    const oldData = JSON.parse(file)
    const jsonUsers = JSON.stringify({...oldData, users}, null, 2)
    await writeFile(fileUsersPath, jsonUsers, "utf-8")
}