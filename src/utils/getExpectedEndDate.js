import { add } from "date-fns";

export default function getExpectedEndDate(project) {
  const { scheduledStartDate, actualStartDate } = project;

  const startDate = actualStartDate || scheduledStartDate;
  project.expectedEndDate = add(new Date(startDate), { months: 1 });

  return project;
}
