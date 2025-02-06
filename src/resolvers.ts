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

        getComments: async (_, {postId}, context) => {
            const post = await context.dataSources.db.post.findUnique({
                where: {id: postId},
            });

            if (!post) {
                throw new GraphQLError("Article non trouvé");
            }

            const comments = await context.dataSources.db.comment.findMany({
                where: {postId},
                include: {
                    author: true,
                },
            });

            return comments;
        },

        getLikesPost: async (_, {postId}, context) => {
            const post = await context.dataSources.db.post.findUnique({
                where: {id: postId},
            });

            if (!post) {
                throw new GraphQLError("Article non trouvé");
            }

            const likes = await context.dataSources.db.like.count({
                where: {postId},
            });

            return likes;
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

        addComment: async (_, {postId, content}, context) => {
            if (!context.user) {
                throw new GraphQLError("Authentification requise");
            }

            const post = await context.dataSources.db.post.findUnique({
                where: {id: postId},
            });

            if (!post) {
                throw new GraphQLError("Article non trouvé");
            }

            const comment = await context.dataSources.db.comment.create({
                data: {
                    content,
                    postId,
                    authorId: context.user.id,
                },
                include: {
                    author: true,
                },
            });

            return {
                code: 201,
                message: "Commentaire ajouté avec succès",
                success: true,
                comment,
            };
        },

        deleteComment: async (_, {commentId}, context) => {
            try {
                if (!context.user) {
                    throw new GraphQLError("Authentification requise");
                }

                const comment = await context.dataSources.db.comment.findUnique(
                    {
                        where: {id: commentId},
                        include: {
                            author: true,
                        },
                    }
                );

                if (!comment) {
                    throw new GraphQLError("Commentaire non trouvé");
                }

                if (comment.author.id !== context.user.id) {
                    throw new GraphQLError(
                        "Vous n'etes pas autorisé à supprimer ce commentaire"
                    );
                }

                // Supprimer le commentaire
                await context.dataSources.db.comment.delete({
                    where: {id: commentId},
                });

                return {
                    code: 201,
                    message: "Commentaire supprimé avec succès",
                    success: true,
                    comment: null,
                };
            } catch (error) {
                return {
                    code: 400,
                    message:
                        error.message ||
                        "Erreur lors de la suppression du commentaire",
                    success: false,
                    comment: null,
                };
            }
        },

        likePost: async (_, {postId}, context) => {
            if (!context.user) {
                throw new Error("Authentification requise");
            }

            const post = await context.dataSources.db.post.findUnique({
                where: {id: postId},
            });

            if (!post) {
                throw new GraphQLError("Article non trouvé");
            }

            const existingLike = await context.dataSources.db.like.findUnique({
                where: {
                    userId_postId: {
                        userId: context.user.id,
                        postId,
                    },
                },
            });

            if (existingLike) {
                throw new GraphQLError("Vous avez déjà liké cet article");
            }

            await context.dataSources.db.like.create({
                data: {
                    postId,
                    userId: context.user.id,
                },
            });

            return {
                code: 201,
                message: "Article liké avec succès",
                success: true,
            };
        },

        unlikePost: async (_, {postId}, context) => {
            if (!context.user) {
                throw new Error("Authentification requise");
            }

            const post = await context.dataSources.db.post.findUnique({
                where: {id: postId},
            });

            if (!post) {
                throw new GraphQLError("Article non trouvé");
            }

            const existingLike = await context.dataSources.db.like.findUnique({
                where: {
                    userId_postId: {
                        userId: context.user.id,
                        postId,
                    },
                },
            });

            if (!existingLike) {
                throw new GraphQLError("Vous n'avez pas liké cet article");
            }

            await context.dataSources.db.like.delete({
                where: {
                    id: existingLike.id,
                },
            });

            return {
                code: 201,
                message: "Liké retiré avec succès",
                success: true,
            };
        },
    },
};
