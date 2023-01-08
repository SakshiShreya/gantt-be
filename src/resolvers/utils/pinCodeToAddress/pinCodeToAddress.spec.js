import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import { describe, it } from "mocha";
import server from "../../../testServer.js";

chai.use(chaiHttp);

describe("Test pinCodeToAddress working properly", () => {
  it("should return address for correct pincode", (done) => {
    chai
      .request(server)
      .get("/graphql?query={pinCodeToAddress(pinCode:560093){city,state}}")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body.data, "Data should be present");
        assert.isDefined(
          res.body.data.pinCodeToAddress,
          "pinCodeToAddress should be present",
        );
        assert.isDefined(
          res.body.data.pinCodeToAddress.city,
          "City should be present",
        );
        assert.equal(res.body.data.pinCodeToAddress.city, "Bangalore");
        assert.isDefined(
          res.body.data.pinCodeToAddress.state,
          "State should be present",
        );
        assert.equal(res.body.data.pinCodeToAddress.state, "KARNATAKA");
        done();
      });
  });

  it("should return error for incorrect pincode", (done) => {
    chai
      .request(server)
      .get("/graphql?query={pinCodeToAddress(pinCode:5600931){city,state}}")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body.data, "Data should be present");
        assert.isNull(res.body.data.pinCodeToAddress, "pinCodeToAddress should not be present");
        assert.isDefined(res.body.errors, "Errors should be present");
        assert.equal(res.body.errors[0].message, "Error: Invalid pin code");
        done();
      });
  });
});
