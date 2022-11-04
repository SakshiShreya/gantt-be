import { GraphQLInt, GraphQLNonNull } from "graphql";
import pinCodeDirectory from "india-pincode-lookup";
import getGraphQLError from "../../../controllers/errorController/index.js";
import AppError from "../../../utils/appError.js";
import { PinToAddrType } from "../../dataTypes/helperTypes.js";

const pinCodeToAddress = {
  type: PinToAddrType,
  description: "Get address from pin code",
  args: {
    pinCode: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve(parent, args) {
    const { pinCode } = args;
    const addressList = pinCodeDirectory.lookup(pinCode);
    if (addressList.length > 0) {
      const { districtName: city, stateName: state } = addressList[0];
      return { city, state, pinCode };
    }
    return getGraphQLError(new AppError("Invalid pin code", 400));
  },
};

export default pinCodeToAddress;
