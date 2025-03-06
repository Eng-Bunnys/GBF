import { Task } from "../models/Task";

// export function getNoteColorOptions(tasks: Task[]) {
//   const colors = ["#FDF6E3", "#F8D7D6", "#FCE3C7", "#CFE8F3", "#D5ECD4"];
//   const usedColors = tasks.map((task) => task.color);
//   return colors.filter((color) => !usedColors.includes(color));
// }

export const getNoteColor = (index: number) => {
  const colors = ["#FDF6E3", "#F8D7D6", "#FCE3C7", "#CFE8F3", "#D5ECD4"];
  return colors[index % colors.length];
};
