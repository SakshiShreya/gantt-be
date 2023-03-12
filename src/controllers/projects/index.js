import { add } from "date-fns";
import Project from "../../models/projectModel.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import getExpectedEndDate from "../../utils/getExpectedEndDate.js";
import getUpdatedStatus from "../../utils/getUpdatedStatus.js";

export const getAllProjects = catchAsync(async (req, res, next) => {
  const {
    search,
    fromDate,
    toDate,
    type = "active",
    sort = "-_id",
    page = 1,
  } = req.query;
  const filter = { deleted: false };
  const andCondition = [];

  if (type === "active") {
    filter.status = "started";
  } else {
    filter.status = { $in: ["scheduled", "closed", "onHold"] };
  }

  if (search) {
    andCondition.push({
      $or: [
        { projectID: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
        { "address.state": { $regex: search, $options: "i" } },
      ],
    });
  }

  if (fromDate) {
    andCondition.push({
      $or: [
        { actualStartDate: { $gte: new Date(fromDate) } },
        {
          $and: [
            { actualStartDate: { $exists: false } },
            { scheduledStartDate: { $gte: new Date(fromDate) } },
          ],
        },
      ],
    });
  }
  if (toDate) {
    andCondition.push({
      $or: [
        { actualStartDate: { $lte: new Date(toDate) } },
        {
          $and: [
            { actualStartDate: { $exists: false } },
            { scheduledStartDate: { $lte: new Date(toDate) } },
          ],
        },
      ],
    });
  }

  if (andCondition.length) {
    filter.$and = andCondition;
  }

  const limit = +process.env.PAGINATION_LIMIT;
  const select =
    "status projectID name owner scheduledStartDate actualStartDate scheduledEndDate actualEndDate";

  const projects = await Project.paginate(filter, {
    sort,
    page,
    limit,
    select,
  });

  projects.docs = projects.docs.map((doc) => doc.toObject());
  projects.docs = projects.docs.map(getExpectedEndDate);
  projects.docs = projects.docs.map(getUpdatedStatus);

  res.status(200).json({ data: projects });
});

export const getProject = catchAsync(async (req, res, next) => {
  const { projectID } = req.params;
  const project = await Project.findOne({ projectID, deleted: false });

  if (!project) {
    return next(
      new AppError(`No project found with this ID: ${projectID}`, 404),
    );
  }
  res
    .status(200)
    .json({ data: getUpdatedStatus(getExpectedEndDate(project.toObject())) });
});

export const createProject = catchAsync(async (req, res, next) => {
  const { name, desc, scheduledStartDate, address, owner, client } = req.body;

  let projectID = name.trim().replace(/\s/g, "").slice(0, 3).toUpperCase();

  // get the latest project that has the same projectID
  const duplicateProject = await Project.find(
    { projectID: { $regex: `^${projectID}`, $options: "i" } },
    { projectID: 1 },
  )
    .sort({ _id: -1 })
    .limit(1)
    .exec();

  if (duplicateProject.length) {
    const lastProjectID = duplicateProject[0].projectID;
    const lastProjectIdNumber = Number(lastProjectID.slice(3));
    projectID = `${projectID}${lastProjectIdNumber + 1}`;
  }

  const project = await Project.create({
    projectID,
    name,
    desc,
    scheduledStartDate,
    address,
    owner,
    client,
    createdBy: "admin",
    updatedBy: "admin",
  });

  res
    .status(201)
    .json({ data: project, message: "Project created successfully" });
});

export const updateProject = catchAsync(async (req, res, next) => {
  const { projectID } = req.params;
  const { name, desc, scheduledStartDate, status, address, owner, client } =
    req.body;

  const project = await Project.findOne(
    { projectID, deleted: false },
    "actualStartDate status",
  );

  if (!project) {
    return next(
      new AppError(`No project found with this ID: ${projectID}`, 404),
    );
  }

  if (project.status !== "scheduled" && scheduledStartDate) {
    return next(
      new AppError(
        `You cannot update the scheduled start date of a project that has started.`,
        400,
      ),
    );
  }

  const update = {};

  if (name) {
    update.name = name;
  }
  if (desc) {
    update.desc = desc;
  }
  if (scheduledStartDate) {
    update.scheduledStartDate = scheduledStartDate;
  }
  if (status) {
    update.status = status;
  }
  if (address) {
    update.address = address;
  }
  if (owner) {
    update.owner = owner;
  }
  if (client) {
    update.client = client;
  }

  if (status === "started" && !project.actualStartDate) {
    update.actualStartDate = new Date();
    update.scheduledEndDate = add(new Date(), { months: 1 });
  } else if (status === "closed") {
    update.actualEndDate = new Date();
  }

  if (Object.keys(update).length) {
    update.updatedBy = "admin";
    await Project.updateOne({ projectID }, update);
    res.status(200).json({ message: "Project updated successfully" });
    return;
  }
  return next(new AppError("Nothing to update", 400));
});

export const deleteProject = catchAsync(async (req, res, next) => {
  const { projectID } = req.params;
  await Project.updateOne({ projectID }, { deleted: true });
  res.status(204).json({ message: "Project deleted successfully" });
});
