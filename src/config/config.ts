import dotenv from "dotenv";

dotenv.config();

export default {
  PORT: process.env.PORT ?? 3001,
  ORIGIN: process.env.ORIGIN ?? "http://localhost:3000",
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ?? "secret_key",
  BEARER_TOKEN: process.env.BEARER_TOKEN ?? "",
  PLAN_EXTERNAL_SERVICE_URL: process.env.PLAN_EXTERNAL_SERVICE_URL ?? "",
  ROUTE_GROUPS_EXTERNAL_SERVICE_URL:
    process.env.ROUTE_GROUPS_EXTERNAL_SERVICE_URL ?? "",
};
  