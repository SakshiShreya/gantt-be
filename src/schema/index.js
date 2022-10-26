import { GraphQLObjectType, GraphQLSchema } from "graphql";
import {
  getAllProjects,
  createProject,
  deleteProject,
} from "./projectSchema.js";

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    getAllProjects,
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: { createProject, deleteProject },
});

export default new GraphQLSchema({ query: RootQuery, mutation: Mutation });
