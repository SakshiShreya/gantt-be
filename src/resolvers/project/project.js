import { add } from "date-fns";
import mongoose from "mongoose";
import getGraphQLError from "../../controllers/errorController/index.js";
import Project from "../../models/projectModel.js";
import AppError from "../../utils/appError.js";
import getExpectedEndDate from "../../utils/getExpectedEndDate.js";
import getUpdatedStatus from "../../utils/getUpdatedStatus.js";

const projectResolvers = {
  Query: {
    getProjects: async (
      parent,
      {
        _id,
        projectID,
        search,
        fromDate,
        toDate,
        type = "active",
        sort = "-_id",
        page = 0,
      },
    ) => {
      try {
        const filter = { deleted: false };
        let orCondition = [];

        if (_id) {
          filter._id = mongoose.Types.ObjectId(_id);
        }
        if (projectID) {
          filter.projectID = projectID;
        }

        if (type === "active") {
          filter.status = "started";
        } else if (type === "inactive") {
          filter.status = { $in: ["scheduled", "closed", "onHold"] };
        }

        if (search) {
          orCondition = [
            ...orCondition,
            { projectID: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
            { "address.city": { $regex: search, $options: "i" } },
            { "address.state": { $regex: search, $options: "i" } },
          ];
        }

        let fromCondition = [];
        let toCondition = [];
        if (fromDate) {
          fromCondition = [
            { actualStartDate: { $gte: new Date(fromDate) } },
            {
              $and: [
                { actualStartDate: { $exists: false } },
                { scheduledStartDate: { $gte: new Date(fromDate) } },
              ],
            },
          ];
        }
        if (toDate) {
          toCondition = [
            { actualStartDate: { $lte: new Date(toDate) } },
            {
              $and: [
                { actualStartDate: { $exists: false } },
                { scheduledStartDate: { $lte: new Date(toDate) } },
              ],
            },
          ];
        }
        if (fromDate && toDate) {
          filter.$and = [{ $or: fromCondition }, { $or: toCondition }];
        } else if (fromDate) {
          orCondition = [...orCondition, ...fromCondition];
        } else if (toDate) {
          orCondition = [...orCondition, ...toCondition];
        }

        if (orCondition.length) {
          filter.$or = orCondition;
        }

        const limit = +process.env.PAGINATION_LIMIT;
        let projects = await Project.find(filter)
          .sort(sort)
          .limit(limit)
          .skip(page * limit)
          .exec();

        projects = projects.map(getExpectedEndDate);
        projects = projects.map(getUpdatedStatus);
        return projects;
      } catch (err) {
        return getGraphQLError(err);
      }
    },
  },

  Mutation: {
    createProject: async (
      parent,
      { name, desc, scheduledStartDate, address, projectOwner },
    ) => {
      try {
        let projectID = name.replace(/\s/g, "").slice(0, 3).toUpperCase();

        // get the latest project that has the same projectID
        const duplicateProject = await Project.find(
          { projectID: { $regex: `^${projectID}`, $options: "i" } },
          { projectID: 1 },
        )
          .sort({ _id: -1 })
          .limit(1)
          .exec();

        if (duplicateProject.length) {
          const lastProjectID = duplicateProject[0].projectID;
          const lastProjectIDNumber = Number(lastProjectID.slice(3));
          projectID = `${projectID}${lastProjectIDNumber + 1}`;
        }

        return Project.create({
          projectID,
          name,
          desc,
          scheduledStartDate,
          createdBy: "admin",
          updatedBy: "admin",
          projectOwner,
          address,
        });
      } catch (err) {
        return getGraphQLError(err);
      }
    },

    updateProject: async (
      parent,
      {
        projectID,
        name,
        desc,
        scheduledStartDate,
        status,
        address,
        projectOwner,
      },
    ) => {
      try {
        const project = await Project.findOne(
          { projectID },
          "actualStartDate status",
        );

        if (!project) {
          throw new AppError("Project not found", 404);
        }

        if (project.status !== "scheduled" && scheduledStartDate) {
          throw new AppError(
            "Cannot update scheduledStartDate. Project has already started.",
            400,
          );
        }

        const update = {};

        if (name) {
          update.name = name;
        }
        if (desc) {
          update.desc = desc;
        }
        if (scheduledStartDate) {
          update.scheduledStartDate = scheduledStartDate;
        }
        if (status) {
          update.status = status;
        }
        if (address) {
          update.address = address;
        }
        if (projectOwner) {
          update.projectOwner = projectOwner;
        }

        if (status === "started" && !project.actualStartDate) {
          update.actualStartDate = new Date();
          update.scheduledEndDate = add(new Date(), { months: 1 });
        } else if (status === "closed") {
          update.actualEndDate = new Date();
        }

        if (Object.keys(update).length) {
          update.updatedBy = "admin";
          await Project.updateOne({ projectID, deleted: false }, update);
          return { ok: 1, nModified: 1 };
        }
      } catch (err) {
        return getGraphQLError(err);
      }
    },

    deleteProject: async (parent, { projectID }) => {
      try {
        await Project.updateOne({ projectID }, { deleted: true });
        return { ok: 1, nModified: 1 };
      } catch (err) {
        return getGraphQLError(err);
      }
    },
  },
};

export default projectResolvers;
