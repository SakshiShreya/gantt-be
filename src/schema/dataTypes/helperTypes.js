import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
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

export const StatusType = new GraphQLEnumType({
  name: "Status",
  values: {
    scheduled: { value: "scheduled" },
    inProgress: { value: "inProgress" },
    delayed: { value: "delayed" },
    closed: { value: "closed" },
    onHold: { value: "onHold" },
  },
});

export const AddressType = new GraphQLObjectType({
  name: "Address",
  fields: () => ({
    address1: { type: new GraphQLNonNull(GraphQLString) },
    address2: { type: GraphQLString },
    city: { type: new GraphQLNonNull(GraphQLString) },
    state: { type: new GraphQLNonNull(GraphQLString) },
    pinCode: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

export const AddressInputType = new GraphQLInputObjectType({
  name: "AddressInput",
  fields: () => ({
    address1: { type: GraphQLString },
    address2: { type: GraphQLString },
    city: { type: GraphQLString },
    state: { type: GraphQLString },
    pinCode: { type: GraphQLInt },
  }),
});

export const PinToAddrType = new GraphQLObjectType({
  name: "PinToAddr",
  fields: () => ({
    city: { type: GraphQLString },
    state: { type: GraphQLString },
    pinCode: { type: GraphQLInt },
  }),
});

export default { DateType };
