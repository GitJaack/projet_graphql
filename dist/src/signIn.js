import { comparePasswords, createJWT } from "./auth.js";
export const signIn = async (_, { username, password }, { dataSources }) => {
    try {
        const user = await dataSources.db.user.findFirstOrThrow({
            where: { username },
        });
        const isValidPassword = comparePasswords(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid password");
        }
        const token = createJWT(user);
        return {
            code: 200,
            message: "User is signed in",
            success: true,
            token,
        };
    }
    catch {
        return {
            code: 401,
            message: "bah non",
            success: false,
            token: null,
        };
    }
};
