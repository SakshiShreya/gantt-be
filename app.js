import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import ExpressMongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import AppError from "./utils/appError.js";
import errorController from "./controllers/errorController.js";

const app = express();

// adds security headers
app.use(helmet());

// Logging (only here because heroku has its own logging on prod)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour window
  message: "Too many requests from this IP. Please try again in an hour",
});
app.use("/api", limiter);

// Get body
app.use(express.json());

// data sanitization against NoSQL query injection
app.use(ExpressMongoSanitize());

// data sanitization again XSS (cross-site scripting) attacks
app.use(xss());

// prevent parameter pollution
// If same query param is present twice, then it will take only the last one
// eg: /api/v1/users?search=a&search=b will only search for b
app.use(
  hpp({
    whitelist: [], // these params can be present twice
  }),
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 404 route
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorController);

export default app;
