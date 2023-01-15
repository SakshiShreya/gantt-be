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
  scheduledEndDate: Date, // this date is defined when user starts a project
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
  projectOwner: { type: String, required: true },
  clientName: { type: String, required: true },
  deleted: { type: Boolean, default: false, select: false },
});

projectSchema.index({ projectID: 1, status: 1, deleted: 1 });
projectSchema.index({ projectID: 1, deleted: 1 });
projectSchema.index({ projectID: 1 });

// this adds createdAt and updatedAt fields to the schema
projectSchema.set("timestamps", true);

const Project = mongoose.model("Project", projectSchema);

export default Project;
