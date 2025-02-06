import {Prisma, PrismaClient} from "@prisma/client";

// Types de base qui correspondent au schéma Prisma
export type User = {
    id: string;
    username: string;
    password: string;
    posts: Post[];
    comments: Comment[];
    likes: Like[];
};

export type Post = {
    id: string;
    title: string;
    content: string;
    author: User;
    authorId: string;
    comments: Comment[];
    likes: Like[];
    likesCount: number;
};

export type Comment = {
    id: string;
    content: string;
    author: User;
    authorId: string;
    post: Post;
    postId: string;
};

export type Like = {
    id: string;
    user: User;
    userId: string;
    post: Post;
    postId: string;
};

// Types pour les includes Prisma
export type PostInclude = Prisma.PostInclude;
export type CommentInclude = Prisma.CommentInclude;
export type LikeInclude = Prisma.LikeInclude;

// Types de réponse
export type BaseResponse = {
    code: number;
    message: string;
    success: boolean;
};

export type PostResponse = BaseResponse & {
    post: Post | null;
};

export type CommentResponse = BaseResponse & {
    comment: Comment | null;
};

export type CreateUserResponse = BaseResponse & {
    user: Pick<User, "id" | "username"> | null;
};

export type SignInUserResponse = BaseResponse & {
    token: string | null;
};

export type LikePostResponse = {
    success: boolean;
    message: string;
};

// Types pour le context
export type DataSources = {
    db: PrismaClient;
};

export type AuthenticatedUser = {
    id: string;
    username: string;
};

// Types pour les arguments des resolvers
export type CreateUserArgs = {
    username: string;
    password: string;
};

export type SignInArgs = {
    username: string;
    password: string;
};

export type CreatePostArgs = {
    title: string;
    content: string;
};

export type UpdatePostArgs = CreatePostArgs & {
    id: string;
};

export type AddCommentArgs = {
    postId: string;
    content: string;
};

export type DeleteCommentArgs = {
    commentId: string;
};

export type PostIdArg = {
    postId: string;
};

export type IdArg = {
    id: string;
};

export type UserModel = Omit<User, "password">;
