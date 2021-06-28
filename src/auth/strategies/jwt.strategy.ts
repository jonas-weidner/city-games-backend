import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { UserModel } from "../../models/user.model";
import { User } from "../../contracts/interfaces/User";

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

// Used by the authenticated requests to deserialize the user,
// i.e., to fetch user details from the JWT.
passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
        // Check against the DB only if necessary.
        // This can be avoided if you don't want to fetch user details in each request.
        UserModel.findOne({ _id: jwt_payload._id }, (err: Error, user: User) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
    }),
);
