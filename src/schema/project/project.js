import { add } from "date-fns";
import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import mongoose from "mongoose";
import getGraphQLError from "../../controllers/errorController/index.js";
import Project from "../../models/projectModel.js";
import AppError from "../../utils/appError.js";
import getExpectedEndDate from "../../utils/getExpectedEndDate.js";
import getUpdatedStatus from "../../utils/getUpdatedStatus.js";
import { description } from "../constants.js";
import {
  AddressInputType,
  DateType,
  ModifiedType,
  ProjectTypeType,
  StatusInputType,
} from "../dataTypes/helperTypes.js";
import ProjectType from "../dataTypes/project.js";

// CRUD APIS FOR PROJECTS
export const createProject = {
  type: ProjectType,
  description: "Create a new project",
  args: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: description.name,
    },
    desc: {
      type: GraphQLString,
      description: description.desc,
    },
    scheduledStartDate: {
      type: new GraphQLNonNull(DateType),
      description: description.scheduledStartDate,
    },
    address: {
      type: new GraphQLNonNull(AddressInputType),
      description: description.address,
    },
    projectOwner: {
      type: new GraphQLNonNull(GraphQLString),
      description: description.projectOwner,
    },
  },
  async resolve(parent, args) {
    try {
      const { name, desc, scheduledStartDate, address, projectOwner } = args;
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
};

export const getProjects = {
  type: new GraphQLList(ProjectType),
  description: `Get one or more projects. All arguments are optional, pass only if you need to filter on these.
  \nIf multiple filters are passed, then AND operation will be done on them.`,
  args: {
    _id: {
      type: GraphQLID,
      description: description.id,
    },
    projectID: {
      type: GraphQLString,
      description: description.projectID,
    },
    search: {
      type: GraphQLString,
      description: "Search for a project by projectID/name/location",
    },
    fromDate: {
      type: DateType,
      description: "From Date of filter",
    },
    toDate: {
      type: DateType,
      description: "End Date of filter",
    },
    type: {
      type: ProjectTypeType,
      description:
        "Type of project (active/inactive). Active: inProgress/delayed/completed. Inactive: scheduled/closed/onHold/delayed",
    },
    sort: {
      type: GraphQLString,
      description:
        "Sort by field. E.g. sort by name(ascending): name, sort by name(descending): -name",
    },
    page: {
      type: GraphQLInt,
      description: "Page number, starts from 0",
    },
  },
  async resolve(parent, args) {
    try {
      const {
        _id,
        projectID,
        search,
        fromDate,
        toDate,
        type = "active",
        sort = "-_id",
        page = 0,
      } = args;
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
};

export const updateProject = {
  type: ModifiedType,
  description: "Update a project",
  args: {
    projectID: {
      type: new GraphQLNonNull(GraphQLString),
      description: `${description.projectID}, used to find the project to be updated.`,
    },
    name: { type: GraphQLString, description: description.name },
    desc: {
      type: GraphQLString,
      description: description.desc,
    },
    scheduledStartDate: {
      type: DateType,
      description: description.scheduledStartDate,
    },
    status: {
      type: StatusInputType,
      description: description.statusInput,
    },
    address: {
      type: AddressInputType,
      description: description.address,
    },
    projectOwner: {
      type: GraphQLString,
      description: description.projectOwner,
    },
  },
  async resolve(parent, args) {
    try {
      const {
        projectID,
        name,
        desc,
        scheduledStartDate,
        status,
        address,
        projectOwner,
      } = args;

      const project = await Project.findOne(
        { projectID },
        "actualStartDate status",
      );

      if (project.status !== "scheduled" && scheduledStartDate) {
        throw new AppError(
          "Can't update scheduledStartDate after project has started.",
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
      }

      await Project.findOneAndUpdate({ projectID, deleted: false }, update);
      return { ok: 1, nModified: 1 };
    } catch (err) {
      return getGraphQLError(err);
    }
  },
};

export const deleteProject = {
  type: ModifiedType,
  description: "Soft delete a project",
  args: {
    projectID: {
      type: new GraphQLNonNull(GraphQLString),
      description: `${description.projectID}, used to find the project to be deleted`,
    },
  },
  resolve: async (parent, args) => {
    try {
      const { projectID } = args;
      await Project.findOneAndUpdate({ projectID }, { deleted: true });
      return { ok: 1, nModified: 1 };
    } catch (err) {
      return getGraphQLError(err);
    }
  },
};

export default ProjectType;
