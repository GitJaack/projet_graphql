import {User} from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const createJWT = (user: User) => {
    const token = jwt.sign(
        {
            id: user.id,
            username: user.username,
        },
        process.env.JWT_SECRET as string
    );

    return token;
};

export type AuthenticatedUser = Pick<User, "id" | "username">;

export const getUser = (token: string): AuthenticatedUser | null => {
    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        ) as AuthenticatedUser;
        return payload;
    } catch {
        return null;
    }
};

export const comparePasswords = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};
