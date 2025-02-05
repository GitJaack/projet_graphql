import {signIn} from "./signIn.js";
import {hashPassword} from "./auth.js";

export const resolvers = {
    Query: {},

    Mutation: {
        createUser: async (_, {username, password}, context) => {
            try {
                const createdUser = await context.dataSources.db.user.create({
                    data: {
                        username,
                        password: await hashPassword(password),
                    },
                });

                return {
                    code: 201,
                    message: "Utilisateur créé avec succès",
                    success: true,
                    user: {
                        id: createdUser.id,
                        username: createdUser.username,
                    },
                };
            } catch (error) {
                // Vérifier si l'erreur vient d'une contrainte d'unicité (P2002)
                if (error.code === "P2002") {
                    return {
                        code: 409,
                        message:
                            "Nom d'utilisateur déjà pris, choisissez-en un autre.",
                        success: false,
                        user: null,
                    };
                }

                return {
                    code: 400,
                    message:
                        "Une erreur s'est produite lors de la création de l'utilisateur",
                    success: false,
                    user: null,
                };
            }
        },
        signIn,
    },
};
