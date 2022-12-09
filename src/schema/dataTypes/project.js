import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { description } from "../constants.js";
import { AddressType, DateType, StatusOutputType } from "./helperTypes.js";

const ProjectType = new GraphQLObjectType({
  name: "Project",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: description.id,
    },
    projectID: {
      type: new GraphQLNonNull(GraphQLString),
      description: description.projectID,
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: description.name,
    },
    desc: {
      type: GraphQLString,
      description: description.desc,
    },
    createdAt: {
      type: DateType,
      description: description.createdAt,
    },
    createdBy: {
      type: GraphQLString,
      description: description.createdBy,
    },
    scheduledStartDate: {
      type: new GraphQLNonNull(DateType),
      description: description.scheduledStartDate,
    },
    scheduledEndDate: {
      type: new GraphQLNonNull(DateType),
      description: description.scheduledEndDate,
    },
    actualStartDate: {
      type: DateType,
      description: description.actualStartDate,
    },
    actualEndDate: {
      type: DateType,
      description: description.actualEndDate,
    },
    status: {
      type: new GraphQLNonNull(StatusOutputType),
      description: description.statusOutput,
    },
    address: {
      type: new GraphQLNonNull(AddressType),
      description: description.address,
    },
    projectOwner: {
      type: new GraphQLNonNull(GraphQLString),
      description: description.projectOwner,
    }
  }),
});

export default ProjectType;
