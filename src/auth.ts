import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

const TOKEN_EXPIRATION = "1d";

export type AuthenticatedUser = Pick<User, "id" | "username">;

export const createJWT = (user: Pick<User, "id" | "username">) => {
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: TOKEN_EXPIRATION }
  );

  return token;
};

export const getUser = (token: string): AuthenticatedUser | null => {
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
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
