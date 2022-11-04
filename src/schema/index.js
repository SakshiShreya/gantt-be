import { GraphQLObjectType, GraphQLSchema } from "graphql";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "./project/project.js";
import pinCodeToAddress from "./helperApis/pinCodeToAddress/pinCodeToAddress.js";

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: { getProjects, pinCodeToAddress },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: { createProject, updateProject, deleteProject },
});

export default new GraphQLSchema({ query: RootQuery, mutation: Mutation });
