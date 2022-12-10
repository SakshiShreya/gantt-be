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
      createProject(name: "Test Project", scheduledStartDate: "${add(
        new Date(),
        { days: 10 },
      ).toJSON()}", address: {address1: "Test Address 1", city: "Bangalore", state: "KARNATAKA", pinCode: 560093}, desc: "Testing a project") {
        id, name, projectID, status, createdAt, createdBy, updatedAt, updatedBy
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
          assert.isDefined(
            res.body.data.createProject.status,
            "Project status should be present",
          );
          assert.equal(
            res.body.data.createProject.status,
            "scheduled",
            "Status should be scheduled by default",
          );
          assert.approximately(
            new Date(res.body.data.createProject.createdAt).getTime(),
            new Date().getTime(),
            1000,
          );
          assert.equal(res.body.data.createProject.createdBy, "admin");
          assert.approximately(
            new Date(res.body.data.createProject.updatedAt).getTime(),
            new Date().getTime(),
            1000,
          );
          assert.equal(res.body.data.createProject.updatedBy, "admin");
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
      let query = `mutation {createProject(name: "Project abc 1", scheduledStartDate: "${add(
        new Date(),
        { days: 10 },
      )}", address: {address1: "ABC", city: "Bangalore", state: "KARNATAKA", pinCode: 560093}, desc: "Testing a project") {id}}`;
      await chai.request(server).post("/graphql").send({ query });
      query = `mutation{updateProject(projectID: "PRO", status: started){ok}}`;
      await chai.request(server).post("/graphql").send({ query });
      await Project.updateOne(
        { projectID: "PRO" },
        { $set: { actualStartDate: add(new Date(), { days: 10 }) } },
      );

      query = `mutation {createProject(name: "Project 2", scheduledStartDate: "${sub(
        new Date(),
        { days: 10 },
      )}", address: {address1: "ABC", city: "Bangalore", state: "KARNATAKA", pinCode: 560093}, desc: "Testing a project") {id}}`;
      await chai.request(server).post("/graphql").send({ query });
      query = `mutation{updateProject(projectID: "PRO1", status: started){ok}}`;
      await chai.request(server).post("/graphql").send({ query });
      await Project.updateOne(
        { projectID: "PRO1" },
        { $set: { actualStartDate: sub(new Date(), { days: 10 }) } },
      );

      // 2. 1 inactive project
      query = `mutation {createProject(name: "Project 2", scheduledStartDate: "${sub(
        new Date(),
        { days: 10 },
      )}", address: {address1: "ABC", city: "Bangalore", state: "KARNATAKA", pinCode: 560093}, desc: "Testing a project") {id}}`;
      await chai.request(server).post("/graphql").send({ query });

      // 3. 1 more active project
      query = `mutation {createProject(name: "Project abcd 2", scheduledStartDate: "${sub(
        new Date(),
        { days: 10 },
      )}", address: {address1: "ABC", city: "Bangalore", state: "KARNATAKA", pinCode: 560093}, desc: "Testing a project") {id}}`;
      await chai.request(server).post("/graphql").send({ query });
      query = `mutation{updateProject(projectID: "PRO3", status: started){ok}}`;
      await chai.request(server).post("/graphql").send({ query });
      await Project.updateOne(
        { projectID: "PRO3" },
        { $set: { actualStartDate: sub(new Date(), { days: 10 }) } },
      );
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
          updatedAt
          updatedBy
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
            res.body.data.getProjects[0].updatedAt,
            "updatedAt should be present",
          );
          assert.isDefined(
            res.body.data.getProjects[0].updatedBy,
            "updatedBy should be present",
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
          assert.equal(res.body.data.getProjects[0].projectID, "PRO3");
          assert.equal(res.body.data.getProjects[1].projectID, "PRO1");
          assert.equal(res.body.data.getProjects[2].projectID, "PRO");
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
          assert.equal(res.body.data.getProjects[0].projectID, "PRO2");
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
            assert.equal(res.body.data.getProjects[0].projectID, "PRO");
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
            assert.equal(res.body.data.getProjects[0].projectID, "PRO3");
            assert.equal(res.body.data.getProjects[1].projectID, "PRO1");
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
            assert.equal(res.body.data.getProjects[0].projectID, "PRO2");
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
            assert.equal(res.body.data.getProjects[0].projectID, "PRO3");
            assert.equal(res.body.data.getProjects[1].projectID, "PRO1");
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
            assert.equal(res.body.data.getProjects[0].projectID, "PRO2");
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
            assert.equal(res.body.data.getProjects[0].projectID, "PRO");
            assert.equal(res.body.data.getProjects[1].projectID, "PRO1");
            assert.equal(res.body.data.getProjects[2].projectID, "PRO3");
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
            assert.equal(res.body.data.getProjects[0].projectID, "PRO3");
            assert.equal(res.body.data.getProjects[1].projectID, "PRO1");
            assert.equal(res.body.data.getProjects[2].projectID, "PRO");
            done();
          });
      });
    });
  });

  describe("Test UPDATE Functionality", () => {
    it("should update a project successfully", (done) => {
      const testProject = `mutation {
        updateProject(projectID: "TES", name: "Test Project100", scheduledStartDate: "${sub(
          new Date(),
          { days: 10 },
        ).toJSON()}") { ok, nModified }
      }`;
      chai
        .request(server)
        .post("/graphql")
        .send({ query: testProject })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(
            res.body.data.updateProject,
            "Project should be present",
          );
          assert.equal(res.body.data.updateProject.ok, 1);
          assert.equal(res.body.data.updateProject.nModified, 1);

          const query = `{getProjects(projectID: "TES", type: inactive) {name, projectID, status, scheduledStartDate, updatedAt, updatedBy}}`;

          chai
            .request(server)
            .get(`/graphql?query=${query}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .end((err1, res1) => {
              assert.isDefined(
                res1.body.data.getProjects[0].name,
                "Project name should be present",
              );
              assert.equal(
                res1.body.data.getProjects[0].name,
                "Test Project100",
              );
              assert.isDefined(
                res1.body.data.getProjects[0].projectID,
                "Project projectID should be present",
              );
              assert.equal(res1.body.data.getProjects[0].projectID, "TES");
              assert.isDefined(
                res1.body.data.getProjects[0].status,
                "Project status should be present",
              );
              assert.equal(res1.body.data.getProjects[0].status, "delayed");
              assert.equal(res1.body.data.getProjects[0].updatedBy, "admin");
              assert.approximately(
                new Date(res1.body.data.getProjects[0].updatedAt).getTime(),
                new Date().getTime(),
                1000,
              );
              done();
            });
        });
    });

    let actualStartDate;
    it("should set actualStartDate to current time if status is set to started for the first time", (done) => {
      const testProject = `mutation {
        updateProject(projectID: "TES", status: started) { ok, nModified }
      }`;
      chai
        .request(server)
        .post("/graphql")
        .send({ query: testProject })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(
            res.body.data.updateProject,
            "Project should be present",
          );
          assert.equal(res.body.data.updateProject.ok, 1);
          assert.equal(res.body.data.updateProject.nModified, 1);

          const query = `{getProjects(projectID: "TES") {projectID, status, actualStartDate, actualEndDate}}`;

          chai
            .request(server)
            .get(`/graphql?query=${query}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .end((err1, res1) => {
              assert.isDefined(
                res1.body.data.getProjects[0].projectID,
                "ProjectID should be present",
              );
              assert.equal(res1.body.data.getProjects[0].projectID, "TES");
              assert.isDefined(
                res1.body.data.getProjects[0].status,
                "Project status should be present",
              );
              assert.equal(res1.body.data.getProjects[0].status, "inProgress");
              assert.isDefined(
                res1.body.data.getProjects[0].actualStartDate,
                "Project actualStartDate should be present",
              );
              assert.approximately(
                new Date(
                  res1.body.data.getProjects[0].actualStartDate,
                ).getTime(),
                new Date().getTime(),
                1000,
              );
              ({ actualStartDate } = res1.body.data.getProjects[0]);
              assert.isNull(
                res1.body.data.getProjects[0].actualEndDate,
                "Project actualEndDate should not be present",
              );
              done();
            });
        });
    });

    it("should set project to hold without affecting actualStartDate", (done) => {
      const testProject = `mutation {
        updateProject(projectID: "TES", status: onHold) { ok, nModified }
      }`;
      chai
        .request(server)
        .post("/graphql")
        .send({ query: testProject })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(
            res.body.data.updateProject,
            "Project should be present",
          );
          assert.equal(res.body.data.updateProject.ok, 1);
          assert.equal(res.body.data.updateProject.nModified, 1);

          const query = `{getProjects(projectID: "TES", type: inactive) {projectID, status, actualStartDate, actualEndDate}}`;

          chai
            .request(server)
            .get(`/graphql?query=${query}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .end((err1, res1) => {
              assert.isDefined(
                res1.body.data.getProjects[0].projectID,
                "ProjectID should be present",
              );
              assert.equal(res1.body.data.getProjects[0].projectID, "TES");
              assert.isDefined(
                res1.body.data.getProjects[0].status,
                "Project status should be present",
              );
              assert.equal(res1.body.data.getProjects[0].status, "onHold");
              assert.isDefined(
                res1.body.data.getProjects[0].actualStartDate,
                "Project actualStartDate should be present",
              );
              assert.equal(
                res1.body.data.getProjects[0].actualStartDate,
                actualStartDate,
                `from api ${res1.body.data.getProjects[0].actualStartDate} from test ${actualStartDate}`,
              );
              assert.isNull(
                res1.body.data.getProjects[0].actualEndDate,
                "Project actualEndDate should not be present",
              );
              done();
            });
        });
    });

    it("should set project to start again without affecting actualStartDate", (done) => {
      const testProject = `mutation {
        updateProject(projectID: "TES", status: started) { ok, nModified }
      }`;
      chai
        .request(server)
        .post("/graphql")
        .send({ query: testProject })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(
            res.body.data.updateProject,
            "Project should be present",
          );
          assert.equal(res.body.data.updateProject.ok, 1);
          assert.equal(res.body.data.updateProject.nModified, 1);

          const query = `{getProjects(projectID: "TES") {projectID, status, actualStartDate, actualEndDate}}`;

          chai
            .request(server)
            .get(`/graphql?query=${query}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .end((err1, res1) => {
              assert.isDefined(
                res1.body.data.getProjects[0].projectID,
                "ProjectID should be present",
              );
              assert.equal(res1.body.data.getProjects[0].projectID, "TES");
              assert.isDefined(
                res1.body.data.getProjects[0].status,
                "Project status should be present",
              );
              assert.equal(res1.body.data.getProjects[0].status, "inProgress");
              assert.isDefined(
                res1.body.data.getProjects[0].actualStartDate,
                "Project actualStartDate should be present",
              );
              assert.equal(
                res1.body.data.getProjects[0].actualStartDate,
                actualStartDate,
                `from api ${res1.body.data.getProjects[0].actualStartDate} from test ${actualStartDate}`,
              );
              assert.isNull(
                res1.body.data.getProjects[0].actualEndDate,
                "Project actualEndDate should not be present",
              );
              done();
            });
        });
    });

    it("should set actualEndDate to current time if status is set to closed without affecting actualStartDate", (done) => {
      const testProject = `mutation {
        updateProject(projectID: "TES", status: closed) { ok, nModified }
      }`;
      chai
        .request(server)
        .post("/graphql")
        .send({ query: testProject })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(
            res.body.data.updateProject,
            "Project should be present",
          );
          assert.equal(res.body.data.updateProject.ok, 1);
          assert.equal(res.body.data.updateProject.nModified, 1);

          const query = `{getProjects(projectID: "TES", type: inactive) {projectID, status, actualStartDate, actualEndDate}}`;

          chai
            .request(server)
            .get(`/graphql?query=${query}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .end((err1, res1) => {
              assert.isDefined(
                res1.body.data.getProjects[0].projectID,
                "ProjectID should be present",
              );
              assert.equal(res1.body.data.getProjects[0].projectID, "TES");
              assert.isDefined(
                res1.body.data.getProjects[0].status,
                "Project status should be present",
              );
              assert.equal(res1.body.data.getProjects[0].status, "closed");
              assert.isDefined(
                res1.body.data.getProjects[0].actualStartDate,
                "Project actualStartDate should be present",
              );
              assert.equal(
                res1.body.data.getProjects[0].actualStartDate,
                actualStartDate,
                `from api ${res1.body.data.getProjects[0].actualStartDate} from test ${actualStartDate}`,
              );
              assert.isDefined(
                res1.body.data.getProjects[0].actualEndDate,
                "Project actualEndDate should not be present",
              );
              assert.approximately(
                new Date(res1.body.data.getProjects[0].actualEndDate).getTime(),
                new Date().getTime(),
                1000,
              );
              done();
            });
        });
    });
  });

  describe("Test DELETE Functionality", () => {
    it("should delete a project successfully", (done) => {
      const testProject = `mutation {
        deleteProject(projectID: "TES1") { ok, nModified }
      }`;
      chai
        .request(server)
        .post("/graphql")
        .send({ query: testProject })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(
            res.body.data.deleteProject,
            "Project should be present",
          );
          assert.equal(res.body.data.deleteProject.ok, 1);
          assert.equal(res.body.data.deleteProject.nModified, 1);

          const query = `{getProjects(type: inactive) {projectID, status, actualStartDate, actualEndDate}}`;

          chai
            .request(server)
            .get(`/graphql?query=${query}`)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .end((err1, res1) => {
              assert.equal(res1.body.data.getProjects.length, 2);
              done();
            });
        });
    })
  })

  after((done) => {
    Project.db.dropCollection("projects", () => {
      done();
    });
  });
});
