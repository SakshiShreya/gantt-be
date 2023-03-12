import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import { add, sub } from "date-fns";
import { after, before, describe, it } from "mocha";
import Project from "../../models/projectModel.js";
import server from "../../testServer.js";
import logger, { Type } from "../../utils/logger.js";

chai.use(chaiHttp);

describe("Test Projects apis", () => {
  // CREATE PROJECT API TEST CASES
  describe("Test CREATE Functionality", () => {
    const testProject = {
      name: "Test Project",
      scheduledStartDate: add(new Date(), { days: 10 }),
      address: {
        address1: "Test Address 1",
        city: "Bangalore",
        state: "KARNATAKA",
        pinCode: "560093",
      },
      desc: "Testing a project",
      owner: "Test Owner",
      client: "Sakshi",
    };

    it("should create a project successfully", (done) => {
      chai
        .request(server)
        .post("/api/projects/v1")
        .send(testProject)
        .end((err, res) => {
          if (res.status !== 201) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 201);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(res.body.data._id, "Id should be present");
          assert.equal(
            res.body.data.name,
            testProject.name,
            "Name should match",
          );
          assert.equal(
            res.body.data.status,
            "scheduled",
            "Status should be scheduled by default",
          );
          assert.equal(
            res.body.data.client,
            testProject.client,
            "Client should match",
          );
          assert.approximately(
            new Date(res.body.data.createdAt).getTime(),
            new Date().getTime(),
            1000,
            "Created at should be within 1 second",
          );
          assert.equal(
            res.body.data.createdBy,
            "admin",
            "Created by should be admin",
          );
          assert.approximately(
            new Date(res.body.data.updatedAt).getTime(),
            new Date().getTime(),
            1000,
            "Updated at should be within 1 second",
          );
          assert.equal(
            res.body.data.updatedBy,
            "admin",
            "Updated by should be admin",
          );
          done();
        });
    });

    it("should create a project with same name but projectID should be different", (done) => {
      chai
        .request(server)
        .post("/api/projects/v1")
        .send(testProject)
        .end((err, res) => {
          if (res.status !== 201) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 201);
          assert.isDefined(res.body.data, "Data should be present");
          assert.notEqual(
            res.body.data.projectID,
            "TES",
            "Project ID should be different",
          );
          assert.include(
            res.body.data.projectID,
            "TES",
            "Project ID should start with TES",
          );
          done();
        });
    });
  });

  // READ ALL PROJECT TEST CASES
  describe("Test READ All Functionality", () => {
    before(async () => {
      // create more projects

      // 1. 2 active projects
      let body = {
        name: "Project abc 1",
        scheduledStartDate: add(new Date(), { days: 10 }),
        address: {
          address1: "ABC",
          city: "Bangalore",
          state: "KARNATAKA",
          pinCode: 560093,
        },
        desc: "Testing a project",
        owner: "Test Owner1",
        client: "krishna",
      };
      await chai.request(server).post("/api/projects/v1").send(body);
      body = { status: "started" };
      await chai.request(server).patch("/api/projects/v1/PRO").send(body);
      await Project.updateOne(
        { projectID: "PRO" },
        { $set: { actualStartDate: add(new Date(), { days: 10 }) } },
      );

      body = {
        name: "Project 2",
        scheduledStartDate: sub(new Date(), { days: 10 }),
        address: {
          address1: "ABC",
          city: "Bangalore",
          state: "KARNATAKA",
          pinCode: 560093,
        },
        desc: "Testing a project",
        owner: "Test Owner2",
        client: "krishna",
      };
      await chai.request(server).post("/api/projects/v1").send(body);
      body = { status: "started" };
      await chai.request(server).patch("/api/projects/v1/PRO1").send(body);
      await Project.updateOne(
        { projectID: "PRO1" },
        { $set: { actualStartDate: sub(new Date(), { days: 10 }) } },
      );

      // 2. 1 inactive project
      body = {
        name: "Project 2",
        scheduledStartDate: sub(new Date(), { days: 10 }),
        address: {
          address1: "ABC",
          city: "Bangalore",
          state: "KARNATAKA",
          pinCode: 560093,
        },
        desc: "Testing a project",
        owner: "Test Owner1",
        client: "krishna",
      };
      await chai.request(server).post("/api/projects/v1").send(body);

      // 3. 1 more active project
      body = {
        name: "Project abcd 2",
        scheduledStartDate: sub(new Date(), { days: 10 }),
        address: {
          address1: "ABC",
          city: "Bangalore",
          state: "KARNATAKA",
          pinCode: 560093,
        },
        desc: "Testing a project",
        owner: "Test Owner2",
        client: "krishna",
      };
      await chai.request(server).post("/api/projects/v1").send(body);
      body = { status: "started" };
      await chai.request(server).patch("/api/projects/v1/PRO3").send(body);
      await Project.updateOne(
        { projectID: "PRO3" },
        { $set: { actualStartDate: sub(new Date(), { days: 10 }) } },
      );
    });

    it("should get all active projects, sorted on -_id if no args are passed", (done) => {
      chai
        .request(server)
        .get("/api/projects/v1")
        .end((err, res) => {
          if (res.status !== 200) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(res.body.data.docs, "Projects should be present");
          assert.equal(res.body.data.docs.length, 3, "Should be 3 projects");
          assert.equal(res.body.data.total, 3, "Should be 3 projects");
          assert.equal(res.body.data.page, 1, "Should be page 1 by default");
          assert.equal(res.body.data.pages, 1, "Should be 1 pages total");
          assert.equal(
            res.body.data.limit,
            process.env.PAGINATION_LIMIT,
            "Pagination limit should be same",
          );
          assert.isDefined(res.body.data.docs[0]._id, "id should be present");
          assert.isDefined(
            res.body.data.docs[0].name,
            "name should be present",
          );
          assert.isDefined(
            res.body.data.docs[0].scheduledStartDate,
            "scheduledStartDate should be present",
          );
          assert.isDefined(
            res.body.data.docs[0].actualStartDate,
            "actualStartDate should be present in active projects",
          );
          assert.isDefined(
            res.body.data.docs[0].scheduledEndDate,
            "scheduledEndDate should be present",
          );
          assert.isDefined(
            res.body.data.docs[0].expectedEndDate,
            "expectedEndDate should be present",
          );
          assert.isUndefined(
            res.body.data.docs[0].actualEndDate,
            "actualEndDate should not be present",
          );
          // sorted on -_id
          assert.equal(res.body.data.docs[0].projectID, "PRO3");
          assert.equal(res.body.data.docs[1].projectID, "PRO1");
          assert.equal(res.body.data.docs[2].projectID, "PRO");
          // status should be "inProgress"/"completed"/"delayed"
          assert.equal(
            ["inProgress", "completed", "delayed"].includes(
              res.body.data.docs[0].status,
            ),
            true,
          );
          // since 'PRO' will start 10 days after today, and expected end date is 1 month after actual start date
          // but scheduled start date is 1 month after today, so it will be delayed
          assert.equal(
            res.body.data.docs[2].status,
            "delayed",
            "project[2] should be delayed",
          );
          assert.equal(res.body.data.docs[0].owner, "Test Owner2", "owner");
          done();
        });
    });

    it("should get all inactive projects, sorted on -_id", (done) => {
      chai
        .request(server)
        .get("/api/projects/v1?type=inactive")
        .end((err, res) => {
          if (res.status !== 200) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(res.body.data.docs, "Projects should be present");
          assert.equal(res.body.data.docs.length, 3, "Should be 3 projects");
          assert.equal(res.body.data.total, 3, "Should be 3 projects");
          assert.equal(res.body.data.page, 1, "Should be page 1 by default");
          assert.equal(res.body.data.pages, 1, "Should be 1 pages total");
          assert.equal(
            res.body.data.limit,
            process.env.PAGINATION_LIMIT,
            "Pagination limit should be same",
          );
          // sorted on -_id
          assert.equal(res.body.data.docs[0].projectID, "PRO2");
          assert.equal(res.body.data.docs[1].projectID, "TES1");
          assert.equal(res.body.data.docs[2].projectID, "TES");
          // status should be "inProgress"/"completed"/"delayed"
          assert.equal(
            ["scheduled", "closed", "onHold", "delayed"].includes(
              res.body.data.docs[0].status,
            ),
            true,
          );
          assert.isDefined(
            res.body.data.docs[0].scheduledStartDate,
            "scheduledStartDate should be present",
          );
          assert.isUndefined(
            res.body.data.docs[0].actualStartDate,
            "actualStartDate should not be present in inactive projects",
          );
          assert.isUndefined(
            res.body.data.docs[0].scheduledEndDate,
            "scheduledEndDate should not be present",
          );
          assert.isDefined(
            res.body.data.docs[0].expectedEndDate,
            "expectedEndDate should be present",
          );
          assert.isUndefined(
            res.body.data.docs[0].actualEndDate,
            "actualEndDate should not be present",
          );
          done();
        });
    });

    it("should get projects with search string 'abc'", (done) => {
      chai
        .request(server)
        .get("/api/projects/v1?search=abc")
        .end((err, res) => {
          if (res.status !== 200) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }

          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(res.body.data.docs, "Projects should be present");

          res.body.data.docs.forEach((project) => {
            assert.include(project.name.toLowerCase(), "abc");
          });
          done();
        });
    });

    describe("should get projects starting after today", () => {
      it("should get correct active projects", (done) => {
        chai
          .request(server)
          .get(`/api/projects/v1?fromDate=${new Date().toJSON()}`)
          .end((err, res) => {
            if (res.status !== 200) {
              logger({
                code: res.status,
                description: res.body.errors,
                type: Type.error,
              });
            }
            assert.equal(res.status, 200);
            assert.isDefined(res.body.data, "Data should be present");
            assert.isDefined(res.body.data.docs, "Projects should be present");
            assert.equal(res.body.data.docs.length, 1, "Should be 1 project");
            assert.equal(res.body.data.docs[0].projectID, "PRO", "projectID");
            done();
          });
      });

      it("should get correct inactive projects", (done) => {
        chai
          .request(server)
          .get(`/api/projects/v1?type=inactive&fromDate=${new Date().toJSON()}`)
          .end((err, res) => {
            if (res.status !== 200) {
              logger({
                code: res.status,
                description: res.body.errors,
                type: Type.error,
              });
            }
            assert.equal(res.status, 200);
            assert.isDefined(res.body.data, "Data should be present");
            assert.isDefined(res.body.data.docs, "Projects should be present");
            assert.equal(res.body.data.docs.length, 2, "Should be 2 project");
            assert.equal(res.body.data.docs[0].projectID, "TES1", "projectID");
            assert.equal(res.body.data.docs[1].projectID, "TES", "projectID");
            done();
          });
      });
    });

    describe("should get projects starting before today", () => {
      it("should get correct active projects", (done) => {
        chai
          .request(server)
          .get(`/api/projects/v1?toDate=${new Date().toJSON()}`)
          .end((err, res) => {
            if (res.status !== 200) {
              logger({
                code: res.status,
                description: res.body.errors,
                type: Type.error,
              });
            }
            assert.equal(res.status, 200);
            assert.isDefined(res.body.data, "Data should be present");
            assert.isDefined(res.body.data.docs, "Projects should be present");
            assert.equal(res.body.data.docs.length, 2, "Should be 2 project");
            assert.equal(res.body.data.docs[0].projectID, "PRO3", "projectID");
            assert.equal(res.body.data.docs[1].projectID, "PRO1", "projectID");
            done();
          });
      });

      it("should get correct inactive projects", (done) => {
        chai
          .request(server)
          .get(`/api/projects/v1?type=inactive&toDate=${new Date().toJSON()}`)
          .end((err, res) => {
            if (res.status !== 200) {
              logger({
                code: res.status,
                description: res.body.errors,
                type: Type.error,
              });
            }
            assert.equal(res.status, 200);
            assert.isDefined(res.body.data, "Data should be present");
            assert.isDefined(res.body.data.docs, "Projects should be present");
            assert.equal(res.body.data.docs.length, 1, "Should be 1 project");
            assert.equal(res.body.data.docs[0].projectID, "PRO2", "projectID");
            done();
          });
      });
    });

    describe("should get projects starting from -10 to +5 days from today", () => {
      it("should get correct active projects", (done) => {
        chai
          .request(server)
          .get(
            `/api/projects/v1?fromDate=${sub(new Date(), {
              days: 11,
            }).toJSON()}&toDate=${add(new Date(), { days: 5 }).toJSON()}`,
          )
          .end((err, res) => {
            if (res.status !== 200) {
              logger({
                code: res.status,
                description: res.body.errors,
                type: Type.error,
              });
            }
            assert.equal(res.status, 200);
            assert.isDefined(res.body.data, "Data should be present");
            assert.isDefined(res.body.data.docs, "Projects should be present");
            assert.equal(res.body.data.docs.length, 2, "Should be 2 project");
            assert.equal(res.body.data.docs[0].projectID, "PRO3", "projectID");
            assert.equal(res.body.data.docs[1].projectID, "PRO1", "projectID");
            done();
          });
      });

      it("should get correct inactive projects", (done) => {
        chai
          .request(server)
          .get(
            `/api/projects/v1?type=inactive&fromDate=${sub(new Date(), {
              days: 11,
            }).toJSON()}&toDate=${add(new Date(), { days: 5 }).toJSON()}`,
          )
          .end((err, res) => {
            if (res.status !== 200) {
              logger({
                code: res.status,
                description: res.body.errors,
                type: Type.error,
              });
            }
            assert.equal(res.status, 200);
            assert.isDefined(res.body.data, "Data should be present");
            assert.isDefined(res.body.data.docs, "Projects should be present");
            assert.equal(res.body.data.docs.length, 1, "Should be 1 project");
            assert.equal(res.body.data.docs[0].projectID, "PRO2", "projectID");
            done();
          });
      });
    });

    describe("check sorting", () => {
      it("should sort in increasing order on projectID field", (done) => {
        chai
          .request(server)
          .get(`/api/projects/v1?sort=projectID`)
          .end((err, res) => {
            if (res.status !== 200) {
              logger({
                code: res.status,
                description: res.body.errors,
                type: Type.error,
              });
            }
            assert.equal(res.status, 200);
            assert.isDefined(res.body.data, "Data should be present");
            assert.isDefined(res.body.data.docs, "Projects should be present");
            assert.equal(res.body.data.docs.length, 3, "Should be 3 project");
            assert.equal(res.body.data.docs[0].projectID, "PRO", "projectID");
            assert.equal(res.body.data.docs[1].projectID, "PRO1", "projectID");
            assert.equal(res.body.data.docs[2].projectID, "PRO3", "projectID");
            done();
          });
      });

      it("should sort in decreasing order on projectID field", (done) => {
        chai
          .request(server)
          .get(`/api/projects/v1?sort=-projectID`)
          .end((err, res) => {
            if (res.status !== 200) {
              logger({
                code: res.status,
                description: res.body.errors,
                type: Type.error,
              });
            }
            assert.equal(res.status, 200);
            assert.isDefined(res.body.data, "Data should be present");
            assert.isDefined(res.body.data.docs, "Projects should be present");
            assert.equal(res.body.data.docs.length, 3, "Should be 3 project");
            assert.equal(res.body.data.docs[0].projectID, "PRO3", "projectID");
            assert.equal(res.body.data.docs[1].projectID, "PRO1", "projectID");
            assert.equal(res.body.data.docs[2].projectID, "PRO", "projectID");
            done();
          });
      });
    });
  });

  // READ PROJECT TEST CASES
  describe("Test READ Functionality", () => {
    it("should get a project successfully if correct projectID is passes", (done) => {
      chai
        .request(server)
        .get(`/api/projects/v1/PRO`)
        .end((err, res) => {
          if (res.status !== 200) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 200);
          assert.isDefined(res.body.data, "Data should be present");
          assert.isDefined(res.body.data._id, "id should be present");
          assert.equal(
            res.body.data.projectID,
            "PRO",
            "projectID should match",
          );
          assert.isDefined(res.body.data.name, "name should be present");
          assert.isDefined(
            res.body.data.createdAt,
            "createdAt should be present",
          );
          assert.isDefined(
            res.body.data.createdBy,
            "createdBy should be present",
          );
          assert.isDefined(
            res.body.data.updatedAt,
            "updatedAt should be present",
          );
          assert.isDefined(
            res.body.data.updatedBy,
            "updatedBy should be present",
          );
          assert.isDefined(
            res.body.data.scheduledStartDate,
            "scheduledStartDate should be present",
          );
          assert.isDefined(
            res.body.data.actualStartDate,
            "actualStartDate should be present",
          );
          assert.isDefined(
            res.body.data.scheduledEndDate,
            "scheduledEndDate should be present",
          );
          assert.isDefined(
            res.body.data.expectedEndDate,
            "expectedEndDate should be present",
          );
          assert.isDefined(res.body.data.address, "address should be present");
          assert.isDefined(
            res.body.data.address.address1,
            "address1 should be present",
          );
          assert.isDefined(
            res.body.data.address.city,
            "city should be present",
          );
          assert.isDefined(
            res.body.data.address.state,
            "state should be present",
          );
          assert.isDefined(
            res.body.data.address.pinCode,
            "pinCode should be present",
          );
          assert.isDefined(res.body.data.client, "client should be present");
          assert.isDefined(res.body.data.owner, "owner should be present");
          done();
        });
    });

    it("should not get a project if incorrect projectID is passed", (done) => {
      chai
        .request(server)
        .get(`/api/projects/v1/PRO123`)
        .end((err, res) => {
          if (res.status !== 404) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 404);
          assert.isDefined(res.body.error, "Error block should be present");
          assert.equal(
            res.body.message,
            "No project found with this ID: PRO123",
          );
          done();
        });
    });
  });

  // UPDATE PROJECT TEST CASES
  describe("Test UPDATE Functionality", () => {
    it("should update a project successfully", (done) => {
      const body = {
        name: "Test Project100",
        scheduledStartDate: sub(new Date(), { days: 10 }).toJSON(),
        owner: "Test Owner123",
        client: "sakshi shreya",
      };

      chai
        .request(server)
        .patch(`/api/projects/v1/TES`)
        .send(body)
        .end((err, res) => {
          if (res.status !== 200) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 200);
          assert.equal(res.body.message, "Project updated successfully");

          chai
            .request(server)
            .get(`/api/projects/v1/TES`)
            .end((err1, res1) => {
              if (res1.status !== 200) {
                logger({
                  code: res1.status,
                  description: res1.body.errors,
                  type: Type.error,
                });
              }

              assert.equal(res1.body.data.name, body.name, "name should match");
              assert.equal(
                res1.body.data.owner,
                body.owner,
                "owner should match",
              );
              assert.equal(
                res1.body.data.client,
                body.client,
                "client should match",
              );
              assert.equal(
                new Date(res1.body.data.scheduledStartDate).getTime(),
                new Date(body.scheduledStartDate).getTime(),
                "scheduledStartDate should match",
              );
              assert.equal(res1.body.data.updatedBy, "admin", "updatedBy");
              assert.approximately(
                new Date(res1.body.data.updatedAt).getTime(),
                new Date().getTime(),
                1000,
                "updatedAt should be within 1 second",
              );
              done();
            });
        });
    });

    let actualStartDate;
    it("should set actualStartDate to current time and scheduledEndDate if status is set to started for the first time", (done) => {
      const body = { status: "started" };

      chai
        .request(server)
        .patch(`/api/projects/v1/TES`)
        .send(body)
        .end((err, res) => {
          if (res.status !== 200) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 200);
          assert.equal(res.body.message, "Project updated successfully");

          chai
            .request(server)
            .get(`/api/projects/v1/TES`)
            .end((err1, res1) => {
              if (res1.status !== 200) {
                logger({
                  code: res1.status,
                  description: res1.body.errors,
                  type: Type.error,
                });
              }

              assert.equal(
                res1.body.data.status,
                "inProgress",
                "status should be inProgress",
              );
              assert.approximately(
                new Date(res1.body.data.actualStartDate).getTime(),
                new Date().getTime(),
                1000,
                "actualStartDate should be within 1 second",
              );
              ({ actualStartDate } = res1.body.data);
              assert.isDefined(
                res1.body.data.scheduledEndDate,
                "scheduledEndDate should be defined",
              );
              assert.isUndefined(
                res1.body.data.actualEndDate,
                "actualEndDate should be undefined",
              );
              done();
            });
        });
    });

    it("should not let user to update scheduledStartDate after project has started", (done) => {
      const body = { scheduledStartDate: new Date().toJSON() };

      chai
        .request(server)
        .patch(`/api/projects/v1/TES`)
        .send(body)
        .end((err, res) => {
          if (res.status !== 400) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 400);
          assert.equal(
            res.body.message,
            "You cannot update the scheduled start date of a project that has started.",
          );
          done();
        });
    });

    it("should set project to hold without affecting actualStartDate", (done) => {
      const body = { status: "onHold" };

      chai
        .request(server)
        .patch(`/api/projects/v1/TES`)
        .send(body)
        .end((err, res) => {
          if (res.status !== 200) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 200);
          assert.equal(res.body.message, "Project updated successfully");

          chai
            .request(server)
            .get(`/api/projects/v1/TES`)
            .end((err1, res1) => {
              if (res1.status !== 200) {
                logger({
                  code: res1.status,
                  description: res1.body.errors,
                  type: Type.error,
                });
              }

              assert.equal(
                res1.body.data.status,
                "onHold",
                "status should be onHold",
              );
              assert.equal(
                res1.body.data.actualStartDate,
                actualStartDate,
                "actualStartDate should not change",
              );
              assert.isUndefined(res1.body.data.actualEndDate, "actualEndDate");
              done();
            });
        });
    });

    it("should set project to start again without affecting actualStartDate", (done) => {
      const body = { status: "started" };

      chai
        .request(server)
        .patch(`/api/projects/v1/TES`)
        .send(body)
        .end((err, res) => {
          if (res.status !== 200) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 200);
          assert.equal(res.body.message, "Project updated successfully");

          chai
            .request(server)
            .get(`/api/projects/v1/TES`)
            .end((err1, res1) => {
              if (res1.status !== 200) {
                logger({
                  code: res1.status,
                  description: res1.body.errors,
                  type: Type.error,
                });
              }

              assert.equal(
                res1.body.data.status,
                "inProgress",
                "status should be inProgress",
              );
              assert.equal(
                res1.body.data.actualStartDate,
                actualStartDate,
                "actualStartDate should not change",
              );
              assert.isUndefined(res1.body.data.actualEndDate, "actualEndDate");
              done();
            });
        });
    });

    it("should set actualEndDate to current time if status is set to closed without affecting actualStartDate", (done) => {
      const body = { status: "closed" };

      chai
        .request(server)
        .patch(`/api/projects/v1/TES`)
        .send(body)
        .end((err, res) => {
          if (res.status !== 200) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 200);
          assert.equal(res.body.message, "Project updated successfully");

          chai
            .request(server)
            .get(`/api/projects/v1/TES`)
            .end((err1, res1) => {
              if (res1.status !== 200) {
                logger({
                  code: res1.status,
                  description: res1.body.errors,
                  type: Type.error,
                });
              }

              assert.equal(
                res1.body.data.status,
                "closed",
                "status should be closed",
              );
              assert.equal(
                res1.body.data.actualStartDate,
                actualStartDate,
                "actualStartDate should not change",
              );
              assert.approximately(
                new Date(res1.body.data.actualEndDate).getTime(),
                new Date().getTime(),
                1000,
                "actualEndDate should be within 1 second",
              );
              done();
            });
        });
    });
  });

  // DELETE PROJECT TEST CASES
  describe("Test DELETE Functionality", () => {
    it("should delete a project successfully", (done) => {
      chai
        .request(server)
        .delete(`/api/projects/v1/TES1`)
        .end((err, res) => {
          if (res.status !== 204) {
            logger({
              code: res.status,
              description: res.body.errors,
              type: Type.error,
            });
          }
          assert.equal(res.status, 204);

          chai
            .request(server)
            .get(`/api/projects/v1?type=inactive`)
            .end((err1, res1) => {
              if (res1.status !== 200) {
                logger({
                  code: res1.status,
                  description: res1.body.errors,
                  type: Type.error,
                });
              }
              assert.equal(res1.status, 200);
              assert.equal(res1.body.data.docs.length, 2);
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
