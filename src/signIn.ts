import {comparePasswords, createJWT} from "./auth.js";
import {MutationResolvers} from "./types.js";

export const signIn: MutationResolvers["signIn"] = async (
    _,
    {username, password},
    {dataSources}
) => {
    try {
        const user = await dataSources.db.user.findUnique({
            where: {username},
            select: {
                id: true,
                username: true,
                password: true,
            },
        });

        if (!user) {
            return {
                code: 401,
                message: "Utilisateur non trouvé",
                success: false,
                token: null,
            };
        }

        const isValidPassword = await comparePasswords(password, user.password);

        if (!isValidPassword) {
            return {
                code: 401,
                message: "Mot de passe invalide",
                success: false,
                token: null,
            };
        }

        const token = createJWT(user);

        return {
            code: 200,
            message: "Utilisateur connecté avec succès",
            success: true,
            token,
        };
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        return {
            code: 401,
            message: "Nom d'utilisateur ou mot de passe incorrect",
            success: false,
            token: null,
        };
    }
};
