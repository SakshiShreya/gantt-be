import {
  GraphQLError,
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import Project from "../models/projectModel.js";

const ProjectType = new GraphQLObjectType({
  name: "Project",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
  }),
});

// CRUD APIS FOR PROJECTS
export const createProject = {
  type: ProjectType,
  args: {
    name: { type: GraphQLString },
    description: { type: GraphQLString },
  },
  resolve(parent, args) {
    const { name, description } = args;
    return Project.create({ name, description });
  },
};

export const getAllProjects = {
  type: new GraphQLList(ProjectType),
  resolve() {
    return Project.find();
  },
};

export const updateProject = {
  type: ProjectType,
  args: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
  },
  resolve(parent, args) {
    const { id, name, description } = args;
    return Project.findByIdAndUpdate(id, { name, description });
  },
};

export const deleteProject = {
  type: ProjectType,
  args: {
    id: { type: GraphQLID },
  },
  resolve: async (parent, args) => {
    try {
      const newProject = await Project.findByIdAndDelete(args.id);
      return newProject;
    } catch (err) {
      return new GraphQLError(err, null, null, null, null, err, {
        name: err.name,
      });
    }
  },
};

export default ProjectType;
