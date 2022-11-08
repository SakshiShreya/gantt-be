import { after, before } from "mocha";
import dotenv from "dotenv";

before(() => {
  dotenv.config({ path: "./.env.test" });
});

after(() => {
  setTimeout(() => [
    process.exit(0),
  ]);
});
