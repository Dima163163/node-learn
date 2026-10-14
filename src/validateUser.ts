export const validateUser = (input: unknown): {name: string} | null => { 
    if (input === null) {
        return null
    }

    if (Array.isArray(input)) {
        return null
    }
    
    if (typeof input !== "object") {
        return null
    }

    if (!("name" in input)) {
        return null
    }

    if (typeof input["name"] !== "string") {
        return null
    }

    if (input["name"].trim().length === 0) {
        return null
    }

    return {name: input.name.trim()}
}
