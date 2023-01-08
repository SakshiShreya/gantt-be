import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import ExpressMongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import AppError from "./src/utils/appError.js";
import { errorController } from "./src/controllers/errorController/index.js";
import graphQLResolvers from "./src/resolvers/index.js";

const app = express();

// Add security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [
          "'self'",
          /** adds graphiql support over helmet's default CSP */
          "'unsafe-inline'",
        ],
        baseUri: ["'self'"],
        blockAllMixedContent: [],
        fontSrc: ["'self'", "https:", "data:"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        scriptSrc: [
          "'self'",
          /** adds graphiql support over helmet's default CSP */
          "'unsafe-inline'",
          /** adds graphiql support over helmet's default CSP */
          "'unsafe-eval'",
        ],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

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

const schema = makeExecutableSchema({
  typeDefs: loadSchemaSync("src/schemas/**/*.graphql", {
    loaders: [new GraphQLFileLoader()],
  }),
  resolvers: graphQLResolvers,
});

app.use("/graphql", graphqlHTTP({ schema, graphiql: true }));
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 404 route
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorController);

export default app;
