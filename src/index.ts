import {loadUsers} from "./loadUsers.js"

const port: number = 4000;

console.log(port);

const users = await loadUsers()

console.log(users);

