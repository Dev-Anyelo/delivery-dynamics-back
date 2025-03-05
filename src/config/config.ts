import dotenv from "dotenv";

dotenv.config();

export default {
  PORT: process.env.PORT ?? 3001,
  ORIGIN: process.env.ORIGIN ?? "",
  BEARER_TOKEN: process.env.BEARER_TOKEN ?? "",

  PLAN_EXTERNAL_SERVICE_URL:
    process.env.PLAN_EXTERNAL_SERVICE_URL ?? "",

  ROUTE_GROUPS_EXTERNAL_SERVICE_URL:
    process.env.ROUTE_GROUPS_EXTERNAL_SERVICE_URL ?? "",
};
