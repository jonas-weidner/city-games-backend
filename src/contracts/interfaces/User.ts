import { AuthStrategy } from "../enums/AuthStrategy";
import { PassportLocalDocument } from "mongoose";
import { RefreshToken } from "./RefreshToken";

export interface User extends PassportLocalDocument {
    _id?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    profilePhoto?: string;
    authStrategy: AuthStrategy;
    lastVisited?: Date;
    refreshToken?: RefreshToken[];
}
