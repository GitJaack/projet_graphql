import gql from "graphql-tag";
export const typeDefs = gql `
    type User {
        id: ID!
        name: String!
        email: String!
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

    type Query {
        users: [User!]!
        user(id: ID!): User
        posts: [Post!]!
        post(id: ID!): Post
    }

    type Mutation {
        signUp(name: String!, email: String!): User!
        createPost(title: String!, content: String!): Post!
        addComment(postId: ID!, content: String!): Comment!
        likePost(postId: ID!): Like!
    }
`;
