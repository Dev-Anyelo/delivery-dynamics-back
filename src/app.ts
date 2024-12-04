import cors from "cors";
import express from "express";
import config from "./config/config";
import cookieParser from "cookie-parser";
import indexRouter from "./api/routes/index";
import routesRouter from "./api/routes/routes";
import { loadDriversFromCSV } from "./lib/lib";

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

// Cargar conductores desde el archivo CSV
loadDriversFromCSV()
  .then(() => {
    console.log("Conductores cargados correctamente");
  })
  .catch((error) => {
    console.error("Error al cargar conductores:", error);
  });

// Routes
app.use("/", indexRouter);
app.use("/api", routesRouter);

export default app;
