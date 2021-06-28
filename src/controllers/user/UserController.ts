import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import { AuthStrategy } from "../../contracts/enums/AuthStrategy";
import { User } from "../../contracts/interfaces/User";
import { COOKIE_OPTIONS, getRefreshToken, getToken } from "../../auth/authenticate";
import jwt from "jsonwebtoken";

export default class UserController {
    public static signup = (req: Request, res: Response): void => {
        if (!req.body.username) {
            res.statusCode = 500;
            res.send({
                name: "EmailError",
                message: "An email address is required",
            });
        } else {
            UserModel.register(
                new UserModel({
                    username: req.body.username,
                    authStrategy: AuthStrategy.Local,
                    firstName: req.body.firstName ?? "",
                    lastName: req.body.lastName ?? "",
                    lastVisited: new Date(),
                }),
                req.body.password,
                (err: Error, user: User) => {
                    if (err) {
                        res.statusCode = 500;
                        res.send(err);
                    } else {
                        const refreshToken = getRefreshToken({ _id: user._id } as User);
                        user.refreshToken = [{ refreshToken }];
                        new UserModel(user).save((err: Error) => {
                            if (err) {
                                res.status(500).send(err);
                            } else {
                                const token = getToken({ _id: user._id } as User);
                                res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
                                res.send({ success: true, token });
                            }
                        });
                    }
                },
            );
        }
    };

    public static login = (req: Request, res: Response): void => {
        const user = req.user as User;
        const refreshToken = getRefreshToken({ _id: user._id } as User);

        UserModel.findById(user._id).then((user: User | null) => {
            if (!user) return res.status(404).send();
            if (!user.refreshToken) user.refreshToken = [];
            user.refreshToken.push({ refreshToken });
            user.save((err) => {
                if (err) {
                    res.statusCode = 500;
                    res.send(err);
                } else {
                    const token = getToken({ _id: user._id } as User);
                    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
                    res.send({ success: true, token });
                }
            });
        });
    };

    public static refreshToken = (req: Request, res: Response, next: NextFunction): void => {
        const { signedCookies = {} } = req;
        const { refreshToken } = signedCookies;
        if (refreshToken) {
            try {
                const payload: any = jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET ?? "",
                );
                const userId = payload._id;

                UserModel.findById(userId).then(
                    (user) => {
                        const tokenIndex = user?.refreshToken?.findIndex(
                            (item) => item.refreshToken === refreshToken,
                        ) as number;

                        if (tokenIndex !== -1 && user?.refreshToken) {
                            const newRefreshToken = getRefreshToken({ _id: userId } as User);
                            user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };
                            user.save((err) => {
                                if (err) {
                                    res.status(500).send(err);
                                } else {
                                    const token = getToken({ _id: userId } as User);
                                    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
                                    res.send({ success: true, token });
                                }
                            });
                        }
                    },
                    (err) => next(err),
                );
            } catch (e) {
                res.status(401).send(e);
            }
        } else {
            res.status(401).send("Unauthorized");
        }
    };

    public static logout = (req: Request, res: Response, next: NextFunction): void => {
        const { signedCookies = {} } = req;
        const { refreshToken } = signedCookies;

        UserModel.findById((req.user as User)?._id).then(
            (user) => {
                const tokenIndex = user?.refreshToken?.findIndex(
                    (item) => item.refreshToken === refreshToken,
                ) as number;

                if (tokenIndex !== -1 && user?.refreshToken) {
                    (user.refreshToken as any).id(user.refreshToken[tokenIndex]._id).remove();
                }

                user?.save((err) => {
                    if (err) {
                        res.statusCode = 500;
                        res.send(err);
                    } else {
                        res.clearCookie("refreshToken", COOKIE_OPTIONS);
                        res.send({ success: true });
                    }
                });
            },
            (err) => next(err),
        );
    };
}
