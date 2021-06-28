import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { UserModel } from "../../models/user.model";

//Called during login/sign up.
// @ts-ignore
passport.use(new LocalStrategy(UserModel.authenticate()));

//called while after logging in / signing up to set user details in req.user
// @ts-ignore
passport.serializeUser(UserModel.serializeUser());
