import { Router } from "express";
import { verifyUser } from "../auth/authenticate";
import { AuthStrategy } from "../contracts/enums/AuthStrategy";
import passport from "passport";
import UserController from "../controllers/user/UserController";

const router = Router();

router.post("/login", passport.authenticate(AuthStrategy.Local), UserController.login);
router.get("/me", verifyUser, (req, res) => res.send(req.user));
router.post("/refreshToken", UserController.refreshToken);
router.get("/logout", verifyUser, UserController.logout);
router.post("/signup", UserController.signup);

export default router;
