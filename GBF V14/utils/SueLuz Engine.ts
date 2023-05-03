import emojis from "../GBF/GBFEmojis.json";

interface ITasksCompleted {
  [key: string]: boolean;
}

/**
 * Returns a formatted list of tasks and their completion percentages, as well
 * as the total percentage of tasks that are marked as completed.
 *
 * @param {ITasksCompleted} tasksCompleted - An object representing the completion status
 * of each task, where the keys are the task names and the values are booleans
 * indicating completion status.
 *
 * @returns {object} An object containing two properties: `taskList`, which is a formatted
 * string of the task list with completion percentages, and `totalPercentage`, which is
 * the percentage of tasks that are marked as completed.
 */
export function getTasksCompleted(tasksCompleted: ITasksCompleted): {
  taskList: string;
  totalPercentage: number;
} {
  // Filter the true and false task keys into separate arrays
  const trueTaskKeys: string[] = Object.keys(tasksCompleted).filter(
    (key) => tasksCompleted[key] === true
  );
  const falseTaskKeys: string[] = Object.keys(tasksCompleted).filter(
    (key) => tasksCompleted[key] === false
  );

  // Combine the arrays into a single task list
  const taskList: string[] = trueTaskKeys.concat(falseTaskKeys);

  // Initialize the result string and count the number of true tasks
  let result: string = "";
  let totalTrueTasks: number = trueTaskKeys.length;

  // Loop through each task and add its completion status to the result string
  for (const key of taskList) {
    result += `${key}: ${tasksCompleted[key] ? `100% 🥇` : "0% 🥉"}\n`;
  }

  // Calculate the total percentage of tasks that are marked as completed
  let totalPercentage: number;

  if (taskList.length > 0) {
    totalPercentage = Math.round((totalTrueTasks / taskList.length) * 100);
  } else {
    totalPercentage = 0;
  }

  // Return an object with the formatted task list and total percentage
  return { taskList: result, totalPercentage };
}
