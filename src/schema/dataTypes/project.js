import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { description } from "../constants.js";
import { DateType, DurationType } from "./helperTypes.js";

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
    startDate: {
      type: new GraphQLNonNull(DateType),
      description: description.startDate,
    },
    endDate: {
      type: new GraphQLNonNull(DateType),
      description: description.endDate,
    },
    duration: {
      type: new GraphQLNonNull(DurationType),
      description: description.duration,
    },
  }),
});

export default ProjectType;