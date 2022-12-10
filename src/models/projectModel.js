import { add } from "date-fns";
import mongoose from "mongoose";
import { addressSchema } from "./helper.js";

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
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
  scheduledStartDate: {
    // this date is defined when user creates a project
    type: Date,
    required: [true, "A project must have a start date"],
  },
  actualStartDate: Date, // this date is defined when user starts a project
  actualEndDate: Date, // this date is defined when user closes a project
  status: {
    type: String,
    required: [true, "A project must have a status"],
    // mongo stores only user defined statuses, other statuses are calculated
    enum: ["scheduled", "started", "closed", "onHold"],
    default: "scheduled",
  },
  address: {
    type: addressSchema,
    required: [true, "A project must have an address"],
  },
});

// this adds createdAt and updatedAt fields to the schema
projectSchema.set("timestamps", true);

projectSchema.virtual("scheduledEndDate").get(function () {
  const { scheduledStartDate } = this;

  // This is just a temporary logic until project details are added
  return add(new Date(scheduledStartDate), { months: 1 });
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
