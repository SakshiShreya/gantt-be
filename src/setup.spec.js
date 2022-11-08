import { after, before } from "mocha";
import dotenv from "dotenv";
import Project from "./models/projectModel.js";

before((done) => {
  dotenv.config({ path: "./.env.test" });
  Project.db.dropCollection("projects", () => {
    done();
  });
});

after(() => {
  setTimeout(() => [
    process.exit(0),
  ]);
});
