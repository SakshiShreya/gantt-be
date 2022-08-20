import dotenv from "dotenv";
import mongoose from "mongoose";

process.on("uncaughtException", err => {
  console.log("Uncaught Exception. Shutting down...");
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

dotenv.config({ path: "./.env" });

import app from "./app";

// CONNECT MONGO
const DB = process.env.DB.replace("<PASSWORD>", process.env.DB_PASSWORD).replace("<USERNAME>", process.env.DB_USERNAME);
mongoose
  .connect(DB, {})
  // eslint-disable-next-line no-console
  .then(() => {
    console.log("DB connection successful");
  });

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log("App listening on port" + PORT);
});

process.on("unhandledRejection", err => {
  console.log("Unhandled Rejection. Shutting down...");
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
