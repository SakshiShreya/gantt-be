import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A project must have a name"],
    unique: true,
  },
  description: String,
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
