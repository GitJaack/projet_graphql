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

export type BaseResponse = {
    code: number;
    message: string;
    success: boolean;
};

export type CreateUserResponse = BaseResponse & {
    user: Pick<User, "id" | "username"> | null;
};

export type SignInUserResponse = BaseResponse & {
    token: string | null;
};

export type PostResponse = BaseResponse & {
    post: Post | null;
};

export type CommentResponse = BaseResponse & {
    comment: Comment | null;
};

export type LikePostResponse = BaseResponse;

export type DeleteResponse = BaseResponse;

export type AuthenticatedUser = {
    id: string;
    username: string;
};

export type CreateUserInput = {
    username: string;
    password: string;
};

export type SignInInput = {
    username: string;
    password: string;
};

export type CreatePostInput = {
    title: string;
    content: string;
};

export type UpdatePostInput = CreatePostInput & {
    id: string;
};

export type CreateCommentInput = {
    postId: string;
    content: string;
};

export type DeleteCommentInput = {
    commentId: string;
};

export type LikePostInput = {
    postId: string;
};

export type PostQueryParams = {
    id: string;
};

export type CommentsQueryParams = {
    postId: string;
};

export type UserQueryParams = {
    id: string;
};
