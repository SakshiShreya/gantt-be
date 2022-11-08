import { after, describe, it } from "mocha";
import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import server from "../../testServer.js";
import Project from "../../models/projectModel.js";

chai.use(chaiHttp);

describe("Test Projects apis", () => {
  describe("Test CREATE Functionality", () => {
    const testProject = `mutation {
      createProject(name: "Test Project", startDate: "20 Nov, 2022", address: {address1: "Test Address 1", city: "Bangalore", state: "KARNATAKA", pinCode: 560093}, desc: "Testing a project") {
        id, name, projectID
      }
    }`;
    it("should create a project successfully", (done) => {
      chai
        .request(server)
        .post("/graphql")
        .send({ query: testProject })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(
            res.body.data.createProject,
            "Project should be present",
          );
          assert.isDefined(
            res.body.data.createProject.id,
            "Project id should be present",
          );
          assert.isDefined(
            res.body.data.createProject.name,
            "Project name should be present",
          );
          assert.equal(res.body.data.createProject.name, "Test Project");
          done();
        });
    });

    it("should create a project with same name but projectID should be different", (done) => {
      chai
        .request(server)
        .post("/graphql")
        .send({ query: testProject })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(
            res.body.data.createProject,
            "Project should be present",
          );
          assert.isDefined(
            res.body.data.createProject.projectID,
            "ProjectID should be present",
          );
          assert.notEqual(
            res.body.data.createProject.projectID,
            "TES",
            "ProjectID should not be TES",
          );
          assert.include(
            res.body.data.createProject.projectID,
            "TES",
            "ProjectID should start with TES",
          );
          done();
        });
    });
  });

  describe("Test READ Functionality", () => {
    it("should get all projects if no args are passed", (done) => {
      const query = `{
        getProjects {
          id
          projectID
          name
          desc
          createdAt
          createdBy
          scheduledStartDate
          scheduledEndDate
          actualStartDate
          actualEndDate
          status
          address {
            address1
            address2
            city
            state
            pinCode
          }
        }
      }`;

      chai
        .request(server)
        .get(`/graphql?query=${query}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(
            res.body.data.getProjects,
            "Projects should be present",
          );
          assert.equal(res.body.data.getProjects.length, 2);
          assert.isDefined(
            res.body.data.getProjects[0].id,
            "id should be present",
          );
          assert.equal(res.body.data.getProjects[0].projectID, "TES");
          assert.equal(res.body.data.getProjects[1].projectID, "TES1");
          assert.equal(res.body.data.getProjects[0].name, "Test Project");
          assert.isDefined(
            res.body.data.getProjects[0].createdAt,
            "createdAt should be present",
          );
          assert.isDefined(
            res.body.data.getProjects[0].createdBy,
            "createdBy should be present",
          );
          assert.isDefined(
            res.body.data.getProjects[0].scheduledStartDate,
            "scheduledStartDate should be present",
          );
          assert.isDefined(
            res.body.data.getProjects[0].scheduledEndDate,
            "scheduledEndDate should be present",
          );
          assert.equal(res.body.data.getProjects[0].status, "scheduled");
          assert.isDefined(
            res.body.data.getProjects[0].address,
            "address should be present",
          );
          assert.equal(
            res.body.data.getProjects[0].address.address1,
            "Test Address 1",
          );
          assert.equal(res.body.data.getProjects[0].address.city, "Bangalore");
          assert.equal(res.body.data.getProjects[0].address.state, "KARNATAKA");
          assert.equal(res.body.data.getProjects[0].address.pinCode, 560093);
          done();
        });
    });
  });

  after((done) => {
    Project.db.dropCollection("projects", () => {
      done();
    });
  });
});
