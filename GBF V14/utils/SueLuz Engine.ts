import emojis from "../GBF/GBFEmojis.json";

interface ITasksCompleted {
  [key: string]: boolean;
}

export function getTasksCompleted(tasksCompleted: ITasksCompleted): {
  taskList: string;
  totalPercentage: number;
} {
  const trueTaskKeys: string[] = Object.keys(tasksCompleted).filter(
    (key) => tasksCompleted[key] === true
  );
  const falseTaskKeys: string[] = Object.keys(tasksCompleted).filter(
    (key) => tasksCompleted[key] === false
  );
  const taskList: string[] = trueTaskKeys.concat(falseTaskKeys);

  let result: string = "";
  let totalTrueTasks: number = trueTaskKeys.length;

  for (const key of taskList)
    result += `${key}: ${tasksCompleted[key] ? `100% 🥇` : "0% 🥉"}\n`;

  let totalPercentage: number;

  if (taskList.length > 0)
    totalPercentage = Math.round((totalTrueTasks / taskList.length) * 100);
  else totalPercentage = 0;

  return { taskList: result, totalPercentage };
}
