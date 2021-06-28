import user from "./user.routes";
import { Router } from "express";
import { Endpoints } from "../contracts/enums/Endpoints";

const routes = Router();

routes.use(`/${Endpoints.Users}`, user);

export default routes;
