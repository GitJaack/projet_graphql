const config = {
    schema: "./src/schema.ts",
    generates: {
        "./src/types.ts": {
            plugins: ["typescript", "typescript-resolvers"],
            config: {
                contextType: "./context#DataSourceContext",
                mappers: {
                    User: "./models#UserModel",
                    Post: "./models#PostModel",
                    Comment: "./models#CommentModel",
                    Like: "./models#LikeModel",
                    PostResponse: "./models#PostResponseModel",
                    CommentResponse: "./models#CommentResponseModel",
                    CreateUserResponse: "./models#CreateUserResponseModel",
                    SignInUserResponse: "./models#SignInUserResponseModel",
                    LikePostResponse: "./models#LikePostResponseModel",
                    DeleteResponse: "./models#BaseResponse",
                },
            },
        },
    },
};
export default config;
