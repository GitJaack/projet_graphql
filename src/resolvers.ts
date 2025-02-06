import {signIn} from "./signIn.js";
import {hashPassword} from "./auth.js";
import {GraphQLError} from "graphql";

export const resolvers = {
    Query: {
        posts: async (_, __, context) => {
            return await context.dataSources.db.post.findMany({
                include: {author: true},
            });
        },

        post: async (_, {id}, context) => {
            const post = await context.dataSources.db.post.findUnique({
                where: {id},
                include: {author: true},
            });

            if (!post) {
                throw new GraphQLError("Article non trouvé");
            }

            return post;
        },
    },

    Mutation: {
        createUser: async (_, {username, password}, context) => {
            try {
                const existingUser =
                    await context.dataSources.db.user.findUnique({
                        where: {username},
                    });

                if (existingUser) {
                    return {
                        code: 400,
                        message: "Nom d'utilisateur déjà pris",
                        success: false,
                        user: null,
                    };
                }

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

        createPost: async (_, {title, content}, context) => {
            try {
                if (!context.user) {
                    throw new GraphQLError("Authentification requise");
                }

                const post = await context.dataSources.db.post.create({
                    data: {
                        title,
                        content,
                        authorId: context.user.id,
                    },
                });

                return {
                    code: 201,
                    message: "Article créé avec succès",
                    success: true,
                    post,
                };
            } catch (error) {
                return {
                    code: 400,
                    message: "Erreur lors de la création de l'article",
                    success: false,
                    post: null,
                };
            }
        },

        updatePost: async (_, {id, title, content}, context) => {
            if (!context.user) {
                throw new GraphQLError("Authentification requise");
            }

            const post = await context.dataSources.db.post.findUnique({
                where: {id},
            });

            if (!post) {
                throw new GraphQLError("Article non trouvé");
            }

            if (post.authorId !== context.user.id) {
                throw new GraphQLError("Action non autorisée");
            }

            const updatedPost = await context.dataSources.db.post.update({
                where: {id},
                data: {title, content},
            });

            return {
                code: 200,
                message: "Article mis à jour avec succès",
                success: true,
                post: updatedPost,
            };
        },

        deletePost: async (_, {id}, context) => {
            if (!context.user) {
                throw new GraphQLError("Authentification requise");
            }

            const post = await context.dataSources.db.post.findUnique({
                where: {id},
            });

            if (!post) {
                throw new GraphQLError("Article non trouvé");
            }

            if (post.authorId !== context.user.id) {
                throw new GraphQLError("Action non autorisée");
            }

            await context.dataSources.db.post.delete({
                where: {id},
            });

            return {
                code: 200,
                message: "Article supprimé avec succès",
                success: true,
            };
        },

        addComment: async (_, {postId, content}, {prisma, user}) => {
            if (!user) {
                throw new Error("Authentification requise");
            }

            const comment = await prisma.comment.create({
                data: {
                    content,
                    postId,
                    authorId: user.id,
                },
            });

            return {
                code: 201,
                message: "Commentaire ajouté avec succès",
                success: true,
                comment,
            };
        },

        likePost: async (_, {postId}, {prisma, user}) => {
            if (!user) {
                throw new Error("Authentification requise");
            }

            await prisma.like.create({
                data: {
                    postId,
                    userId: user.id,
                },
            });

            return {
                code: 201,
                message: "Post liké avec succès",
                success: true,
            };
        },
    },
};
