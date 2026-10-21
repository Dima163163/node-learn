import express from "express"

import { getUserById, getUsers, createUser } from "../controllers/usersController.js"

export const usersRouter = express.Router()

usersRouter.get("/", getUsers)

usersRouter.get("/:id", getUserById)

usersRouter.post("/", createUser)