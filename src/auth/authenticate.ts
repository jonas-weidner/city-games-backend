import passport from "passport";
import jwt from "jsonwebtoken";
import { User } from "../contracts/interfaces/User";
import { CookieOptions } from "express";

export const COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY as string) * 1000,
    sameSite: "none",
};

export const getToken = (user: User) => {
    return jwt.sign(user, process.env.JWT_SECRET as string, {
        expiresIn: eval(process.env.SESSION_EXPIRY as string),
    });
};

export const getRefreshToken = (user: User) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET as string, {
        expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY as string),
    });
};

export const verifyUser = passport.authenticate("jwt", { session: false });
