import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { AddressInfo } from "net";
import cors from "cors";
import passport from "passport";
import routes from "./routes";
import { corsOptions } from "./constants/cors-options";

if (!["prod", "dev"].includes(process.env.APP_ENV as string)) dotenv.config();

// Passport Strategies
require("./auth/strategies/local.strategy");
require("./auth/strategies/jwt.strategy");

// Initialize Express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors(corsOptions));
app.use(passport.initialize());
app.use("/", routes);

// Start server
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING as string, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
        });
        const server = app.listen(process.env.PORT || 8081, () => {
            const port = (server.address() as AddressInfo)?.port;
            console.log(`🚀 server started on port ${port} 🚀`);
        });
    } catch (e) {
        throw new Error(e);
    }
};
startServer().then();
