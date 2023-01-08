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
  // if project has started and expectedEndDate is after scheduledEndDate (any task got delayed)
  if (
    project.status === "started" &&
    new Date(project.expectedEndDate) > new Date(project.scheduledEndDate)
  ) {
    project.status = "delayed";
    return project;
  }
  // If any task is delayed (see if this part needs to be done)
  // handle the case if expectedEndDate is not present in project, this will happen if expected end dat is not calculated yet

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
