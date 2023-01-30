import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import { describe, it } from "mocha";
import server from "../../testServer.js";

chai.use(chaiHttp);

describe("Test pinCodeToAddress working properly", () => {
  it("should return address for correct pincode", (done) => {
    chai
      .request(server)
      .get("/api/pinCodeToAddress/v1/560093")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body.data, "Data should be present");
        assert.equal(res.body.data.pinCode, "560093");
        assert.equal(res.body.data.city, "Bangalore");
        assert.equal(res.body.data.state, "KARNATAKA");
        done();
      });
  });

  it("should return error for incorrect pincode", (done) => {
    chai
      .request(server)
      .get("/api/pinCodeToAddress/v1/5600931")
      .end((err, res) => {
        assert.equal(res.status, 400);
        assert.isDefined(res.body.error, "Error should be present");
        assert.equal(res.body.message, "Invalid pin code");
        done();
      });
  });
});
