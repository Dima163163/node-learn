import { z } from "zod"

export const userSchema = z.object({
    name: z.string().trim().min(1)
})

export type CreateUserData = z.infer<typeof userSchema>