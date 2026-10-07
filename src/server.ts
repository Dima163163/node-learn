import { createServer } from "node:http";
import { loadUsers } from "./loadUsers.js";

const server = createServer(async(request, response) => {
    console.log(request.method);
    console.log(request.url);
    if (request.method === "GET") {
        if (request.url === "/") {
            response.statusCode = 200
            response.setHeader("Content-Type", "text/plain")
            response.end("Hello from Node")
            return
        }
        
        if (request.url === "/users") {
            try {
                const users = await loadUsers()
                response.statusCode = 200
                response.setHeader("Content-Type", "application/json")
                response.end(JSON.stringify(users))
                return
            } catch {
                response.statusCode = 500
                response.setHeader("Content-Type", "text/plain")
                response.end("Internal Server Error")
                return
            }
        }
    }

    if (request.method === "POST") {
        if (request.url === "/users") {
            let body = ""
            request.setEncoding("utf8")
            request.on("data", (chunk) => {
                body += chunk
            })
            request.on("end", () => {
                try {
                    const parsedBody = JSON.parse(body)
                    console.log(parsedBody)
                    response.statusCode = 201
                    response.setHeader("Content-Type", "application/json")
                    response.end(JSON.stringify(parsedBody))
                } catch {
                    response.statusCode = 400
                    response.setHeader("Content-Type", "text/plain")
                    response.end("Bad Request")
                }
            })
            return
        }
    }
    response.statusCode = 404
    response.setHeader("Content-Type", "text/plain")
    response.end("Not Found")
})


server.listen(3000, () => {
    console.log("Server started");
})