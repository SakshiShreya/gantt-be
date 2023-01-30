import express from "express";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProject,
  updateProject,
} from "../controllers/projects/index.js";

const router = express.Router();

router.route("/v1/").get(getAllProjects).post(createProject);
router
  .route("/v1/:projectID")
  .get(getProject)
  .patch(updateProject)
  .delete(deleteProject);

export default router;
