import { GraphQLScalarType } from "graphql";

function dateValue(value) {
  if (value instanceof Date) {
    return value.toJSON();
  }
  if (typeof value === "string") {
    return new Date(value).toJSON();
  }
  return null;
}

const DateType = new GraphQLScalarType({
  name: "Date",
  serialize: dateValue,
  parseValue: dateValue,
  parseLiteral: (ast) => dateValue(ast.value),
});

const DateResolver = {
  Date: DateType,
}

export default DateResolver;
