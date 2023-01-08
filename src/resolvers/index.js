import projectResolvers from "./project/project.js";
import Date from "./utils/date.js";
import pinCodeToAddressResolvers from "./utils/pinCodeToAddress/pinCodeToAddress.js";

const resolvers = [Date, projectResolvers, pinCodeToAddressResolvers];

export default resolvers;
