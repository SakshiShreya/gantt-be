import dotenv from "dotenv";
import mongoose from "mongoose";
import logger, { Type } from "./utils/logger.js";

dotenv.config({ path: "./.env.test" });

// eslint-disable-next-line import/first
import app from "../app.js";

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

const PORT = process.env.PORT || 8100;
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

export default server;
