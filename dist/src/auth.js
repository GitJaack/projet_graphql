import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const TOKEN_EXPIRATION = "1d";
export const createJWT = (user) => {
    const token = jwt.sign({
        id: user.id,
        username: user.username,
    }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
    return token;
};
export const getUser = (token) => {
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return payload;
    }
    catch {
        return null;
    }
};
export const comparePasswords = async (password, hash) => {
    return bcrypt.compare(password, hash);
};
export const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
};
