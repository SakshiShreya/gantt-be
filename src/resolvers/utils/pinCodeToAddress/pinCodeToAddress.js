import pinCodeDirectory from "india-pincode-lookup";
import getGraphQLError from "../../../controllers/errorController/index.js";
import AppError from "../../../utils/appError.js";

const pinCodeToAddressResolvers = {
  Query: {
    pinCodeToAddress: (parent, { pinCode }) => {
      const addressList = pinCodeDirectory.lookup(pinCode);
      if (addressList.length > 0) {
        const { districtName: city, stateName: state } = addressList[0];
        return { city, state, pinCode };
      }
      return getGraphQLError(new AppError("Invalid pin code", 400));
    },
  },
};

export default pinCodeToAddressResolvers;
