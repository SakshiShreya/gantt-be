import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLScalarType,
} from "graphql";

function dateValue(value) {
  if (value instanceof Date) {
    return value.toJSON();
  }
  if (typeof value === "string") {
    return new Date(value).toJSON();
  }
  return null;
}

export const DateType = new GraphQLScalarType({
  name: "Date",
  serialize: dateValue,
  parseValue: (value) => {
    if (value instanceof Date) {
      return value.toJSON();
    }
    if (typeof value === "string") {
      return new Date(value).toJSON();
    }
    return null;
  },
  parseLiteral: (ast) => dateValue(ast.value),
});

const DurationUnit = new GraphQLEnumType({
  name: "DurationUnit",
  values: {
    days: { value: "days" },
    hours: { value: "hours" },
  },
});

export const DurationType = new GraphQLObjectType({
  name: "Duration",
  fields: () => ({
    amount: { type: GraphQLInt },
    unit: { type: DurationUnit },
  }),
});

export const DurationInputType = new GraphQLInputObjectType({
  name: "DurationInput",
  fields: () => ({
    amount: { type: GraphQLInt },
    unit: { type: DurationUnit },
  }),
});

export default { DateType };
