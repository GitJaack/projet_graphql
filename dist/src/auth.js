import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
export const createJWT = (user) => {
    const token = jwt.sign({
        id: user.id,
        username: user.username,
    }, process.env.JWT_SECRET);
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
export const comparePasswords = (password, hash) => {
    return bcrypt.compare(password, hash);
};
export const hashPassword = (password) => {
    return bcrypt.hash(password, 5);
};
