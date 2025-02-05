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
                    message: `User ${username} has been created`,
                    success: true,
                    user: {
                        id: createdUser.id,
                        username: createdUser.username,
                    },
                };
            } catch {
                return {
                    code: 400,
                    message: "Something bad happened",
                    success: false,
                    user: null,
                };
            }
        },
        signIn,
    },
};
