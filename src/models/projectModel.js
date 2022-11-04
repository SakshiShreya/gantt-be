import { add } from "date-fns";
import mongoose from "mongoose";
import { addressSchema, durationSchema } from "./helper.js";

const projectSchema = new mongoose.Schema({
  projectID: { type: String, required: true, unique: true },
  name: {
    type: String,
    required: [true, "A project must have a name"],
    trim: true,
    minlength: [3, "A project name must have atleast 3 characters"],
    maxlength: [
      50,
      "A project name must have less than or equal to 50 characters",
    ],
  },
  desc: { type: String, trim: true },
  createdAt: { type: Date, required: true, default: Date.now() },
  createdBy: { type: String, required: true },
  startDate: {
    type: Date,
    required: [true, "A project must have a start date"],
  },
  duration: {
    type: durationSchema,
    required: [true, "A project must have a duration"],
  },
  status: {
    type: String,
    required: [true, "A project must have a status"],
    enum: ["scheduled", "inProgress", "delayed", "completed", "onHold"],
    default: "scheduled",
  },
  address: {
    type: addressSchema,
    required: [true, "A project must have an address"],
  },
});

projectSchema.virtual("endDate").get(function () {
  const {
    startDate,
    duration: { amount, unit },
  } = this;
  return add(new Date(startDate), { [unit]: amount });
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
