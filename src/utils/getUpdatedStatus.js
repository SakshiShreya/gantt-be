export default function getUpdatedStatus(project) {
  if (["closed", "onHold"].includes(project.status)) {
    return project;
  }

  // 1. Delayed
  // if project has not started yet and scheduled Start date has passed
  if (
    project.status === "scheduled" &&
    new Date(project.scheduledStartDate) < new Date()
  ) {
    project.status = "delayed";
    return project;
  }
  // If any task is delayed

  // 2. Completed
  // If all tasks are completed

  // 3. InProgress
  // If project is started and is not delayed or completed
  if (project.status === "started") {
    project.status = "inProgress";
    return project;
  }

  return project;
}
