import { createServer } from "node:http";
import { loadUsers } from "./loadUsers.js";
import { saveUsers } from "./saveUsers.js";
import { validateUser } from "./validateUser.js";

const server = createServer(async(request, response) => {
    console.log(request.method); 
    console.log(request.url);

    const url = new URL(request.url ?? "/", "http://localhost:3000")
    console.log(url.pathname);
    console.log(url.searchParams.get("page"));
    console.log(url.searchParams.get("limit"));

    const segments = url.pathname.split('/')
    if (request.method === "GET" && segments.length === 3) {
        const userId = segments[2]
        const numericId = Number(userId)
        const validId = Number.isInteger(numericId) && numericId > 0
        
        if (segments[1] === "users") {
            if (validId) {
                try {
                    const users = await loadUsers()
                    const currentUser = users.find(user => user.id === numericId)
                    if(currentUser) {
                        response.statusCode = 200
                        response.setHeader("Content-Type", "application/json")
                        response.end(JSON.stringify(currentUser))
                        return
                    } else {
                        response.statusCode = 404
                        response.setHeader("Content-Type", "text/plain")
                        response.end("Not found")
                        return
                    }
                } catch {
                    response.statusCode = 500
                    response.setHeader("Content-Type", "text/plain")
                    response.end("Internal server error")
                    return
                }
            } else {
                response.statusCode = 400
                response.setHeader("Content-Type", "text/plain")
                response.end("Bad Request")
                return
            }
        }
    }
    
    if (request.method === "GET") {
        if (url.pathname === "/") {
            response.statusCode = 200
            response.setHeader("Content-Type", "text/plain")
            response.end("Hello from Node")
            return
        }


        if (url.pathname === "/users") {
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

    if (request.method === "POST" && url.pathname === "/users") {
        const contentType = request.headers["content-type"]
        const mediaType = contentType?.split(";")[0]?.trim().toLowerCase()

        if (mediaType !== "application/json") {
            response.statusCode = 415
            response.setHeader("Content-Type", "text/plain")
            response.end("Unsupported Media Type")
            return
        }

        let body = ""
        request.setEncoding("utf8")
        request.on("data", (chunk) => {
            body += chunk
        })
        request.on("end", async() => {
            try {
                const parsedBody = JSON.parse(body)
                const validateUserObj = validateUser(parsedBody)
                if (validateUserObj !== null) {
                    const newUserName = validateUserObj.name;
                    try {
                        const users = await loadUsers()
    
                        const ids = users.map(user => user.id)
                        const newUserId = Math.max(0, ...ids) + 1
                        const newUser = {id: newUserId, name: newUserName}
    
                        await saveUsers([...users, newUser])
    
                        response.statusCode = 201
                        response.setHeader("Content-Type", "application/json")
                        response.end(JSON.stringify(newUser))
                    } catch (error) {
                        console.error("POST /users failed:", error)
                        response.statusCode = 500
                        response.setHeader("Content-Type", "text/plain")
                        response.end("Internal server error")
                    }
                } else {
                    response.statusCode = 400
                    response.setHeader("Content-Type", "text/plain")
                    response.end("Bad Request")
                }
            } catch {
                response.statusCode = 400
                response.setHeader("Content-Type", "text/plain")
                response.end("Bad Request")
            }
        })
        return
    }
    response.statusCode = 404
    response.setHeader("Content-Type", "text/plain")
    response.end("Not Found")
})


server.listen(3000, () => {
    console.log("Server started");
})