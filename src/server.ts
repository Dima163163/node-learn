import { createServer } from "node:http";
import { loadUsers } from "./loadUsers.js";

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
        
        if (segments[1] === "users" && userId !== '') {
            response.statusCode = 200
            response.setHeader("Content-Type", "text/plain")
            response.end(`Requested user: ${userId}`)
            return
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

    if (request.method === "POST") {
        if (url.pathname === "/users") {
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
            request.on("end", () => {
                try {
                    const parsedBody = JSON.parse(body)
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