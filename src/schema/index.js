import { GraphQLObjectType, GraphQLSchema } from "graphql";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "./projectSchema.js";

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    getProjects,
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: { createProject, updateProject, deleteProject },
});

export default new GraphQLSchema({ query: RootQuery, mutation: Mutation });
