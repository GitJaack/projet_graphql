import {signIn} from "./signIn.js";
import {hashPassword} from "./auth.js";
import {GraphQLError} from "graphql";
import {DataSourceContext} from "./context";
import {Resolvers} from "./types";
import {Post, User, Comment, Like} from "./models.js";

export const resolvers: Resolvers = {
    Query: {
        posts: async (_, __, context: DataSourceContext) => {
            try {
                const posts = await context.dataSources.db.post.findMany({
                    include: {
                        author: {
                            include: {
                                posts: true,
                                comments: true,
                                likes: true,
                            },
                        },
                        comments: {
                            include: {
                                author: true,
                                post: true,
                            },
                        },
                        likes: {
                            include: {
                                user: true,
                                post: true,
                            },
                        },
                    },
                });

                // Transformation pour correspondre au type GraphQL
                return posts.map((post) => ({
                    ...post,
                    author: {
                        ...post.author,
                        posts: post.author.posts || [],
                        comments: post.author.comments || [],
                        likes: post.author.likes || [],
                    },
                    comments: post.comments || [],
                    likes: post.likes || [],
                    likesCount: post.likesCount || 0,
                }));
            } catch (e) {
                console.log(e);
                throw new GraphQLError(
                    "Erreur lors de la récupération des posts"
                );
            }
        },

        post: async (_, {id}, context: DataSourceContext) => {
            const post = await context.dataSources.db.post.findUnique({
                where: {id},
                include: {
                    author: true,
                    comments: {
                        include: {author: true},
                    },
                    likes: {
                        include: {user: true},
                    },
                },
            });

            if (!post) {
                throw new GraphQLError("Article non trouvé");
            }

            return {
                ...post,
                comments: post.comments || [],
                likes: post.likes || [],
                likesCount: post.likesCount || 0,
            };
        },

        getComments: async (_, {postId}, context: DataSourceContext) => {
            const comments = await context.dataSources.db.comment.findMany({
                where: {postId},
                include: {
                    author: true,
                    post: true,
                },
            });

            return comments;
        },

        getLikesPost: async (_, {postId}, context: DataSourceContext) => {
            const post = await context.dataSources.db.post.findUnique({
                where: {id: postId},
            });

            if (!post) {
                throw new GraphQLError("Article non trouvé");
            }

            return post.likesCount;
        },
    },

    Mutation: {
        createUser: async (
            _,
            {username, password},
            context: DataSourceContext
        ) => {
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

        createPost: async (_, {title, content}, context: DataSourceContext) => {
            if (!context.user) {
                throw new GraphQLError("Authentification requise");
            }

            try {
                const post = await context.dataSources.db.post.create({
                    data: {
                        title,
                        content,
                        authorId: context.user.id,
                    },
                    include: {
                        author: true,
                        comments: true,
                        likes: true,
                    },
                });

                return {
                    code: 201,
                    message: "Article créé avec succès",
                    success: true,
                    post: {
                        ...post,
                        comments: [],
                        likes: [],
                        likesCount: 0,
                    },
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

        updatePost: async (
            _,
            {id, title, content},
            context: DataSourceContext
        ) => {
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
                include: {
                    author: true,
                    comments: true,
                    likes: true,
                },
            });

            return {
                code: 200,
                message: "Article mis à jour avec succès",
                success: true,
                post: updatedPost,
            };
        },

        deletePost: async (_, {id}, context: DataSourceContext) => {
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

        addComment: async (
            _,
            {postId, content},
            context: DataSourceContext
        ) => {
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
                    post: true,
                },
            });

            return {
                code: 201,
                message: "Commentaire ajouté avec succès",
                success: true,
                comment,
            };
        },

        deleteComment: async (_, {commentId}, context: DataSourceContext) => {
            if (!context.user) {
                throw new GraphQLError("Authentification requise");
            }

            const comment = await context.dataSources.db.comment.findUnique({
                where: {id: commentId},
                include: {
                    author: true,
                },
            });

            if (!comment) {
                throw new GraphQLError("Commentaire non trouvé");
            }

            if (comment.authorId !== context.user.id) {
                throw new GraphQLError(
                    "Vous n'êtes pas autorisé à supprimer ce commentaire"
                );
            }

            await context.dataSources.db.comment.delete({
                where: {id: commentId},
            });

            return {
                code: 201,
                message: "Commentaire supprimé avec succès",
                success: true,
                comment: null,
            };
        },

        likePost: async (_, {postId}, context: DataSourceContext) => {
            if (!context.user) {
                throw new GraphQLError("Authentification requise");
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

            await context.dataSources.db.post.update({
                where: {id: postId},
                data: {likesCount: {increment: 1}},
            });

            return {
                success: true,
                message: "Post liké avec succès",
            };
        },

        unlikePost: async (_, {postId}, context: DataSourceContext) => {
            if (!context.user) {
                throw new GraphQLError("Authentification requise");
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

            await context.dataSources.db.post.update({
                where: {id: postId},
                data: {likesCount: {decrement: 1}},
            });

            return {
                success: true,
                message: "Like retiré avec succès",
            };
        },
    },

    Post: {
        comments: async (parent: Post, _, context: DataSourceContext) => {
            const comments = await context.dataSources.db.comment.findMany({
                where: {postId: parent.id},
                include: {
                    author: true,
                    post: true,
                },
            });
            return comments;
        },
        author: async (parent: Post, _, context: DataSourceContext) => {
            const author = await context.dataSources.db.user.findUnique({
                where: {id: parent.authorId},
            });
            return author!;
        },
        likes: async (parent: Post, _, context: DataSourceContext) => {
            const likes = await context.dataSources.db.like.findMany({
                where: {postId: parent.id},
                include: {
                    user: true,
                    post: true,
                },
            });
            return likes;
        },
        likesCount: async (parent: Post, _, context: DataSourceContext) => {
            return parent.likesCount;
        },
    },

    User: {
        posts: async (parent: User, _, context: DataSourceContext) => {
            const posts = await context.dataSources.db.post.findMany({
                where: {authorId: parent.id},
                include: {
                    author: true,
                    comments: true,
                    likes: true,
                },
            });
            return posts;
        },
        comments: async (parent: User, _, context: DataSourceContext) => {
            const comments = await context.dataSources.db.comment.findMany({
                where: {authorId: parent.id},
                include: {
                    author: true,
                    post: true,
                },
            });
            return comments;
        },
        likes: async (parent: User, _, context: DataSourceContext) => {
            const likes = await context.dataSources.db.like.findMany({
                where: {userId: parent.id},
                include: {
                    user: true,
                    post: true,
                },
            });
            return likes;
        },
    },
};
