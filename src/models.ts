import { User, Post, Comment, Like } from "@prisma/client";

export type UserModel = Omit<User, "password">;

export type PostModel = Post;

export type CommentModel = Comment;

export type LikeModel = Like;

// Types de réponse
export type BaseResponse = {
  code: number;
  message: string;
  success: boolean;
};

export type PostResponseModel = BaseResponse & {
  post: PostModel | null;
};

export type CommentResponseModel = BaseResponse & {
  comment: CommentModel | null;
};

export type CreateUserResponseModel = BaseResponse & {
  user: Pick<User, "id" | "username"> | null;
};

export type SignInUserResponseModel = BaseResponse & {
  token: string | null;
};

export type LikePostResponseModel = {
  success: boolean;
  message: string;
};
