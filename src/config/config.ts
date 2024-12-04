import dotenv from "dotenv";

dotenv.config();

export default {
  PORT: process.env.PORT ?? 3001,
  ORIGIN: process.env.ORIGIN ?? "",
  EXTERNAL_SERVICE_URL: process.env.EXTERNAL_SERVICE_URL ?? "",
};
