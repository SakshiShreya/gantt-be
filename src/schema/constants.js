export const description = {
  id: "Id of the project",
  projectID: "ProjectId of the project",
  name: "Name of the project",
  desc: "Description of the project",
  createdAt: "Date when the project was created",
  createdBy: "User who created the project",
  updatedAt: "Date when the project was last updated",
  updatedBy: "User who last updated the project",
  scheduledStartDate: "Date when the project is expected to start. Can't be updated after project has started.",
  actualStartDate: "Date when the project actually started. Set automatically when project status is set to started.",
  scheduledEndDate: "Date when the project is expected to end. Set automatically when project status is set to started.",
  expectedEndDate: "Date when the project is expected to end. Calculated everytime.",
  actualEndDate: "Date when the project actually ended. Set automatically when project status is set to closed.",
  statusInput: "Status of the project (scheduled, started, closed, onHold)",
  statusOutput: "Status of the project (scheduled, inProgress, delayed, completed, closed, onHold)",
  address: "Address of the project",
  projectOwner: "Project owner of the project",
};

export default { description };
