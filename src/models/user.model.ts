import { model, PassportLocalSchema, Schema } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import { User } from "../contracts/interfaces/User";
import { AuthStrategy } from "../contracts/enums/AuthStrategy";
import { RefreshToken } from "../contracts/interfaces/RefreshToken";

const SessionSchema = new Schema<RefreshToken>({
    refreshToken: {
        type: String,
        default: "",
    },
});

const UserSchema = new Schema<User>({
    username: {
        type: String,
        required: [true, "email required for user"],
        unique: [true, "email already registered"],
    },
    firstName: {
        type: String,
        default: "",
    },
    lastName: {
        type: String,
        default: "",
    },
    profilePhoto: String,
    authStrategy: {
        type: String,
        enum: AuthStrategy,
        default: AuthStrategy.Local,
    },
    lastVisited: { type: Date, default: new Date() },
    refreshToken: {
        type: [SessionSchema],
    },
}) as PassportLocalSchema;

//Remove refreshToken from the response
UserSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.refreshToken;
        return ret;
    },
});

UserSchema.plugin(passportLocalMongoose);
export const UserModel = model<User>("User", UserSchema);
