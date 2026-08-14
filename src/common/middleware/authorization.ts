export const authorization = async (roles: string[], role: string) => {
    if (!roles.includes(role)) {
        throw new Error("Unauthorized");
    }
};