import dotenv from "dotenv";
import mongoose from "mongoose";
import logger, { Type } from "./src/utils/logger.js";

process.on("uncaughtException", (err) => {
  logger({
    description: "Uncaught Exception. Shutting down...",
    type: Type.error,
    ref: err,
  });
  process.exit(1);
});

dotenv.config({ path: "./.env" });

// eslint-disable-next-line import/first
import app from "./app.js";

// CONNECT MONGO
const DB = process.env.DB.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD,
).replace("<USERNAME>", process.env.DB_USERNAME);
mongoose.connect(DB, {}).then(() => {
  logger({
    description: "DB connection successful",
    type: Type.info,
    ref: {},
  });
});

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  logger({
    description: `App listening on port ${PORT}`,
    type: Type.info,
    ref: {},
  });
});

process.on("unhandledRejection", (err) => {
  logger({
    code: 500,
    description: "Unhandled Rejection. Shutting down...",
    type: Type.error,
    ref: err,
  });
  server.close(() => {
    process.exit(1);
  });
});
