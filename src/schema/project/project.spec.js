import { after, before, describe, it } from "mocha";
import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import { add, sub } from "date-fns";
import server from "../../testServer.js";
import Project from "../../models/projectModel.js";

chai.use(chaiHttp);

describe("Test Projects apis", () => {
  describe("Test CREATE Functionality", () => {
    const testProject = `mutation {
      createProject(name: "Test Project", scheduledStartDate: "${add(new Date(), {
        days: 10,
      }).toJSON()}", address: {address1: "Test Address 1", city: "Bangalore", state: "KARNATAKA", pinCode: 560093}, desc: "Testing a project") {
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
    before(async () => {
      // create more projects

      // 1. 2 active projects
      await Project.create({
        projectID: "PRO1",
        name: "Project abc 1",
        status: "started",
        actualStartDate: add(new Date(), { days: 10 }),
        scheduledStartDate: sub(new Date(), { days: 10 }),
        address: {
          address1: "ABC",
          city: "Bangalore",
          state: "KARNATAKA",
          pinCode: 560093,
        },
        createdBy: "admin",
        desc: "Testing a project",
      });

      await Project.create({
        projectID: "PRO2",
        name: "Project 2",
        status: "started",
        actualStartDate: sub(new Date(), { days: 10 }),
        scheduledStartDate: sub(new Date(), { days: 10 }),
        address: {
          address1: "ABC",
          city: "Bangalore",
          state: "KARNATAKA",
          pinCode: 560093,
        },
        createdBy: "admin",
        desc: "Testing a project",
      });

      await Project.create({
        projectID: "PRO3",
        name: "Project 2",
        scheduledStartDate: sub(new Date(), { days: 10 }),
        address: {
          address1: "ABC",
          city: "Bangalore",
          state: "KARNATAKA",
          pinCode: 560093,
        },
        createdBy: "admin",
        desc: "Testing a project",
      });

      await Project.create({
        projectID: "PRO4",
        name: "Project abcd 2",
        status: "started",
        actualStartDate: sub(new Date(), { days: 10 }),
        scheduledStartDate: sub(new Date(), { days: 10 }),
        address: {
          address1: "ABC",
          city: "Bangalore",
          state: "KARNATAKA",
          pinCode: 560093,
        },
        createdBy: "admin",
        desc: "Testing a project",
      });
    });

    it("should get all active projects, sorted on -_id if no args are passed", (done) => {
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
          assert.equal(res.body.data.getProjects.length, 3);
          assert.isDefined(
            res.body.data.getProjects[0].id,
            "id should be present",
          );
          assert.isDefined(
            res.body.data.getProjects[0].name,
            "name should be present",
          );
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
            res.body.data.getProjects[0].actualStartDate,
            "actualStartDate should be present in active projects",
          );
          assert.isDefined(
            res.body.data.getProjects[0].scheduledEndDate,
            "scheduledEndDate should be present",
          );
          assert.isDefined(
            res.body.data.getProjects[0].address,
            "address should be present",
          );
          assert.isDefined(
            res.body.data.getProjects[0].address.address1,
            "address1 should be present",
          );
          assert.isDefined(
            res.body.data.getProjects[0].address.city,
            "city should be present",
          );
          assert.isDefined(
            res.body.data.getProjects[0].address.state,
            "state should be present",
          );
          assert.isDefined(
            res.body.data.getProjects[0].address.pinCode,
            "pinCode should be present",
          );
          // sorted on -_id
          assert.equal(res.body.data.getProjects[0].projectID, "PRO4");
          assert.equal(res.body.data.getProjects[1].projectID, "PRO2");
          assert.equal(res.body.data.getProjects[2].projectID, "PRO1");
          // status should be "inProgress"/"completed"/"delayed"
          assert.equal(
            ["inProgress", "completed", "delayed"].includes(
              res.body.data.getProjects[0].status,
            ),
            true,
          );
          done();
        });
    });

    it("should get all inactive projects, sorted on -_id", (done) => {
      const query = `{getProjects(type: inactive) {projectID, status}}`;

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
          assert.equal(res.body.data.getProjects.length, 3);
          // sorted on -_id
          assert.equal(res.body.data.getProjects[0].projectID, "PRO3");
          assert.equal(res.body.data.getProjects[1].projectID, "TES1");
          assert.equal(res.body.data.getProjects[2].projectID, "TES");
          // status should be "inProgress"/"completed"/"delayed"
          assert.equal(
            ["scheduled", "closed", "onHold", "delayed"].includes(
              res.body.data.getProjects[0].status,
            ),
            true,
          );
          done();
        });
    });

    it("should get projects with search string 'abc'", (done) => {
      const query = `{getProjects(search: "abc") {projectID, name, status}}`;

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

          res.body.data.getProjects.forEach((project) => {
            assert.include(project.name.toLowerCase(), "abc");
          });
          done();
        });
    });

    describe("should get projects starting after today", () => {
      it("should get correct active projects", (done) => {
        const query = `{getProjects(fromDate: "${new Date().toJSON()}") {projectID, status}}`;

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

            assert.equal(res.body.data.getProjects.length, 1);
            assert.equal(res.body.data.getProjects[0].projectID, "PRO1");
            done();
          });
      });

      it("should get correct inactive projects", (done) => {
        const query = `{getProjects(type: inactive, fromDate: "${new Date().toJSON()}") {projectID, status}}`;

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
            assert.equal(res.body.data.getProjects[0].projectID, "TES1");
            assert.equal(res.body.data.getProjects[1].projectID, "TES");
            done();
          });
      });
    });

    describe("should get projects starting before today", () => {
      it("should get correct active projects", (done) => {
        const query = `{getProjects(toDate: "${new Date().toJSON()}") {projectID, status}}`;

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
            assert.equal(res.body.data.getProjects[0].projectID, "PRO4");
            assert.equal(res.body.data.getProjects[1].projectID, "PRO2");
            done();
          });
      });

      it("should get correct inactive projects", (done) => {
        const query = `{getProjects(type: inactive, toDate: "${new Date().toJSON()}") {projectID, status}}`;

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

            assert.equal(res.body.data.getProjects.length, 1);
            assert.equal(res.body.data.getProjects[0].projectID, "PRO3");
            done();
          });
      });
    });

    describe("should get projects starting from -10 to +5 days from today", () => {
      it("should get correct active projects", (done) => {
        const query = `{getProjects(fromDate: "${sub(new Date(), {
          days: 11,
        }).toJSON()}", toDate: "${add(new Date(), {
          days: 5,
        }).toJSON()}") {projectID, status}}`;

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
            assert.equal(res.body.data.getProjects[0].projectID, "PRO4");
            assert.equal(res.body.data.getProjects[1].projectID, "PRO2");
            done();
          });
      });

      it("should get correct inactive projects", (done) => {
        const query = `{getProjects(type: inactive, fromDate: "${sub(
          new Date(),
          {
            days: 11,
          },
        ).toJSON()}", toDate: "${add(new Date(), {
          days: 5,
        }).toJSON()}") {projectID, status}}`;

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

            assert.equal(res.body.data.getProjects.length, 1);
            assert.equal(res.body.data.getProjects[0].projectID, "PRO3");
            done();
          });
      });
    });

    describe("check sorting", () => {
      it("should sort in increasing order on projectID field", (done) => {
        const query = `{getProjects(sort: "projectID") {projectID}}`;

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

            assert.equal(res.body.data.getProjects.length, 3);
            assert.equal(res.body.data.getProjects[0].projectID, "PRO1");
            assert.equal(res.body.data.getProjects[1].projectID, "PRO2");
            assert.equal(res.body.data.getProjects[2].projectID, "PRO4");
            done();
          });
      });

      it("should sort in decreasing order on projectID field", (done) => {
        const query = `{getProjects(sort: "-projectID") {projectID}}`;

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

            assert.equal(res.body.data.getProjects.length, 3);
            assert.equal(res.body.data.getProjects[0].projectID, "PRO4");
            assert.equal(res.body.data.getProjects[1].projectID, "PRO2");
            assert.equal(res.body.data.getProjects[2].projectID, "PRO1");
            done();
          });
      });
    });
  });

  after((done) => {
    Project.db.dropCollection("projects", () => {
      done();
    });
  });
});
