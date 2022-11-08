import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import getGraphQLError from "../../controllers/errorController/index.js";
import Project from "../../models/projectModel.js";
import { description } from "../constants.js";
import { AddressInputType, DateType, StatusInputType } from "../dataTypes/helperTypes.js";
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
    startDate: {
      type: new GraphQLNonNull(DateType),
      description: description.scheduledStartDate,
    },
    status: {
      type: StatusInputType,
      description: description.status,
    },
    address: {
      type: new GraphQLNonNull(AddressInputType),
      description: description.address,
    },
  },
  async resolve(parent, args) {
    try {
      const { name, desc, startDate, status, address } = args;
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
        scheduledStartDate: startDate,
        createdBy: "admin",
        status,
        address,
      });
    } catch (err) {
      return getGraphQLError(err);
    }
  },
};

export const getProjects = {
  type: new GraphQLList(ProjectType),
  description: "Get one or more projects",
  args: {
    _id: {
      type: GraphQLID,
      desc: `${description.id}, pass only if needed to filter on any of the keys, e.g. (_id: 'shjdfjsdj5435')`,
    },
  },
  resolve(parent, args) {
    try {
      return Project.find(args);
    } catch (err) {
      return getGraphQLError(err);
    }
  },
};

export const updateProject = {
  type: ProjectType,
  description: "Update a project",
  args: {
    _id: {
      type: new GraphQLNonNull(GraphQLID),
      description: `${description.id}, used to find the project to be updated.`,
    },
    name: { type: GraphQLString, description: description.name },
    desc: {
      type: GraphQLString,
      description: description.desc,
    },
  },
  resolve(parent, args) {
    try {
      const { _id, name, desc } = args;
      return Project.findByIdAndUpdate(_id, { name, desc });
    } catch (err) {
      return getGraphQLError(err);
    }
  },
};

export const deleteProject = {
  type: ProjectType,
  description: "Delete a project",
  args: {
    _id: {
      type: new GraphQLNonNull(GraphQLID),
      description: `${description.id}, used to find the project to be deleted`,
    },
  },
  resolve: async (parent, args) => {
    try {
      const newProject = await Project.findByIdAndDelete(args.id);
      return newProject;
    } catch (err) {
      return getGraphQLError(err);
    }
  },
};

export default ProjectType;
