import {CodegenConfig} from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "./src/schema.ts",
    generates: {
        "./src/types.ts": {
            plugins: ["typescript", "typescript-resolvers"],
            config: {
                contextType: "./context#DataSourceContext",
                mappers: {
                    User: "./models#User",
                    Post: "./models#Post",
                    Comment: "./models#Comment",
                    Like: "./models#Like",
                    PostResponse: "./models#PostResponse",
                    CommentResponse: "./models#CommentResponse",
                    CreateUserResponse: "./models#CreateUserResponse",
                    SignInUserResponse: "./models#SignInUserResponse",
                    LikePostResponse: "./models#LikePostResponse",
                    DeleteResponse: "./models#BaseResponse",
                },
                enumsAsTypes: true,
                inputMaybeValue: "T | null | undefined",
            },
        },
    },
};

export default config;
