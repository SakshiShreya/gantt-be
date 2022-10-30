import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import getGraphQLError from "../controllers/errorController/index.js";
import Project from "../models/projectModel.js";

const ProjectType = new GraphQLObjectType({
  name: "Project",
  fields: () => ({
    id: { type: GraphQLID, description: "Id of the project" },
    name: { type: GraphQLString, description: "Name of the project" },
    description: {
      type: GraphQLString,
      description: "Description of the project",
    },
  }),
});

// CRUD APIS FOR PROJECTS
export const createProject = {
  type: ProjectType,
  description: "Create a new project",
  args: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Name of the project",
    },
    description: {
      type: GraphQLString,
      description: "Description of the project",
    },
  },
  resolve(parent, args) {
    try {
      const { name, description } = args;
      return Project.create({ name, description });
    } catch (err) {
      return getGraphQLError(err);
    }
  },
};

export const getProjects = {
  type: new GraphQLList(ProjectType),
  description: "Get one or more projects",
  args: {
    id: {
      type: GraphQLID,
      description:
        "ID of the project, pass only if needed to filter on any of the keys, e.g. (_id: 'shjdfjsdj5435')",
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
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "ID of the project, used to find the project to be updated.",
    },
    name: { type: GraphQLString, description: "Name of the project" },
    description: {
      type: GraphQLString,
      description: "Description of the project",
    },
  },
  resolve(parent, args) {
    try {
      const { id, name, description } = args;
      return Project.findByIdAndUpdate(id, { name, description });
    } catch (err) {
      return getGraphQLError(err);
    }
  },
};

export const deleteProject = {
  type: ProjectType,
  description: "Delete a project",
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "ID of the project, used to find the project to be deleted",
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
