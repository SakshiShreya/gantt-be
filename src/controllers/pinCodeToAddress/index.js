import pinCodeDirectory from "india-pincode-lookup";
import AppError from "../../utils/appError.js";

const pinCodeToAddress = (req, res, next) => {
  const { pinCode } = req.params;
  const addressList = pinCodeDirectory.lookup(pinCode);
  if (addressList.length > 0) {
    const { districtName: city, stateName: state } = addressList[0];
    return res.status(200).json({ data: { city, state, pinCode } });
  }
  return next(new AppError("Invalid pin code", 400));
};

export default pinCodeToAddress;
