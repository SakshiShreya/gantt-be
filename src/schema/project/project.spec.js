import { after, describe, it } from "mocha";
import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import server from "../../testServer.js";
import Project from "../../models/projectModel.js";

chai.use(chaiHttp);

describe("Test Projects apis", () => {
  // beforeEach(() => {
  //   // create 3 projects
  //   const query1 = `mutation{
  //     createProject(name: "Project 1", startDate: "20 Nov,
  // 2022", duration: {amount: 5, unit: days}) {
  //       id, name
  //     }
  //   }`;
  //   const query2 = `mutation{
  //     createProject(name: "Project 2", startDate: "20 Nov,
  // 2022", duration: {amount: 5, unit: days}) {
  //       id, name
  //     }
  //   }`;
  //   const query3 = `mutation{
  //     createProject(name: "Test Project", startDate: "20 Nov,
  // 2022", duration: {amount: 5, unit: days}) {
  //       id, name
  //     }
  //   }`;
  //   chai.request(server)
  // });

  describe("Test CREATE Functionality", () => {
    const testProject = `mutation{
      createProject(name: "Test Project", startDate: "20 Nov, 2022", duration: {amount: 5, unit: days}) {
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
          assert.equal(
            res.body.data.createProject.name,
            "Test Project",
            "Project name should be Test Project",
          );
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

  // it("should get all projects", (done) => {
  //   const query = `{
  //     getProjects {
  //       id
  //       createdAt
  //       endDate
  //       projectID
  //     }
  //   }`;
  //   chai
  //     .request(server)
  //     .get(`/graphql?query=${query}`)
  //     .set("Content-Type", "application/json")
  //     .set("Accept", "application/json")
  //     .end((err, res) => {
  //       console.log(res.body);
  //       assert.equal(res.status, 201);
  //       done();
  //     });
  // });

  after((done) => {
    Project.db.dropCollection("projects", () => {
      done();
    });
  });
});
