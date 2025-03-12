import cors from "cors";
import express from "express";
import config from "./config/config";
import cookieParser from "cookie-parser";
import indexRouter from "./api/routes/index";
import plansRouter from "./api/routes/routes";
import { errorHandler } from "./errorHandler";

const app = express();
const { ORIGIN } = config;

app.use(
  cors({
    origin: ORIGIN.split(",").filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/", indexRouter);
app.use("/api", plansRouter);

app.use(errorHandler);

export default app;
