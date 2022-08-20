import app from "./app";

process.on("uncaughtException", err => {
  console.log("Uncaught Exception. Shutting down...");
  console.log(err);
  server.close(() => {
    process.exit(1);
  })
});

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log("App listening on port" + PORT);
})

process.on("unhandledRejection", err => {
  console.log("Unhandled Rejection. Shutting down...");
  console.log(err);
  server.close(() => {
    process.exit(1);
  })
});
