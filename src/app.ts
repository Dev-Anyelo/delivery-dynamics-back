import cors from "cors";
import express from "express";
import config from "./config/config";
import cookieParser from "cookie-parser";
import indexRouter from "./api/routes/index";
import routesRouter from "./api/routes/routes";

const app = express();

const { ORIGIN } = config;

app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", indexRouter);
app.use("/api", routesRouter);

export default app;
