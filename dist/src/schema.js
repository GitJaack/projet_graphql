import gql from "graphql-tag";
export const typeDefs = gql `
    type User {
        id: ID!
        username: String!
        posts: [Post!]!
        comments: [Comment!]!
        likes: [Like!]!
    }

    type Post {
        id: ID!
        title: String!
        content: String!
        author: User!
        comments: [Comment!]!
        likes: [Like!]!
    }

    type Comment {
        id: ID!
        content: String!
        author: User!
        post: Post!
    }

    type Like {
        id: ID!
        user: User!
        post: Post!
    }

    type CreateUserResponse {
        code: Int!
        success: Boolean!
        message: String!
        user: User
    }

    type SignInUserResponse {
        code: Int!
        success: Boolean!
        message: String!
        token: String
    }

    type Query {
        users: [User!]!
        user(id: ID!): User
        posts: [Post!]!
        post(id: ID!): Post
    }

    type Mutation {
        createUser(username: String!, password: String!): CreateUserResponse
        signIn(username: String!, password: String!): SignInUserResponse
        createPost(title: String!, content: String!): Post!
        addComment(postId: ID!, content: String!): Comment!
        likePost(postId: ID!): Like!
    }
`;
