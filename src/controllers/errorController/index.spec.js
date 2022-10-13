import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import { describe, it } from "mocha";

chai.use(chaiHttp);

// https://www.digitalocean.com/community/tutorials/test-a-node-restful-api-with-mocha-and-chai

describe("Test", () => {
  it("should test properly", () => {
    assert.equal(1, 1);
  });
});
