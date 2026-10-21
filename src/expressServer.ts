import express, { type Express, type NextFunction, type Request, type Response } from "express"
import { usersRouter } from "./routes/usersRouter.js";
import type { ErrorRequestHandler } from "express"

const app: Express = express()
const port = 3001

const requestLogger = (request: Request, response: Response, next: NextFunction) => {
    console.log(request.method,  request.path);
    next()
}

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    console.error(error)
    if (typeof error === "object" && error !== null && "type" in error && error.type === "entity.parse.failed") {
        response.status(400).json({ error: "invalid JSON" })
        return
    }
    response.status(500).json({ error: "Internal server error" })
}

app.use(requestLogger)

app.use(express.json())

app.get("/health", (_request: Request, response: Response) => {
    response.status(200).json({ status: "ok" })
})

app.post("/echo", (request, response) => {
    response.status(200).json({ received: request.body})
})

app.use("/users", usersRouter)

app.use((_request, response) => {
    response.status(404).json({
        error: "Route not found"
    })
})

app.use(errorHandler)

app.listen(port, () => {
    console.log("Server is running on http://localhost:" + port);
})