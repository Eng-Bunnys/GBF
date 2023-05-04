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

/**
 * An interface representing an object containing boolean values
 */
type ObjectOfBooleans = Record<string, boolean>;

/**
 * Returns the percentage of true values in a given object containing boolean values
 * @param obj - The object to calculate true value percentage for
 * @returns The percentage of true values in the object as a number
 */
export function getTruePercentage(obj: ObjectOfBooleans): number {
  // Extract the values of the input object into an array
  const values = Object.values(obj);

  // Filter the true values from the array of values and create a new array of only true values
  const trueValues = values.filter((value) => value === true);

  // Compute the ratio of true values to total values, multiply by 100 to get percentage
  const truePercentage = (trueValues.length / values.length) * 100;

  // Return the calculated true value percentage
  return truePercentage;
}

export function genderString(gender: string): string {
  if (gender === "M") return "Male";
  if (gender === "F") return "Fe-Male";
  if (gender === "T") return "Other";
}

interface IPaymentResult {
  paymentType: "wallet" | "bank";
  remainingBalance?: number;
  errorMessage?: string;
}

export function processPayment(
  preferredMethod: string,
  walletBalance: number,
  bankBalance: number,
  transactionPrice: number
): IPaymentResult {
  if (bankBalance < transactionPrice && walletBalance < transactionPrice)
    return {
      paymentType: null,
      remainingBalance: null,
      errorMessage: "Insufficient funds"
    };

  if (preferredMethod !== "wallet" && preferredMethod !== "bank")
    return {
      paymentType: null,
      remainingBalance: null,
      errorMessage: "Invalid payment method"
    };

  if (preferredMethod === "wallet" && walletBalance >= transactionPrice)
    return {
      paymentType: "wallet",
      remainingBalance: (walletBalance -= transactionPrice),
      errorMessage: null
    };

  if (preferredMethod === "bank" && bankBalance >= transactionPrice)
    return {
      paymentType: "bank",
      remainingBalance: (bankBalance -= transactionPrice),
      errorMessage: null
    };

  if (
    preferredMethod === "wallet" &&
    walletBalance < transactionPrice &&
    bankBalance >= transactionPrice
  )
    return {
      paymentType: "bank",
      remainingBalance: (bankBalance -= transactionPrice),
      errorMessage: null
    };

  if (
    preferredMethod === "bank" &&
    bankBalance < transactionPrice &&
    walletBalance >= transactionPrice
  )
    return {
      paymentType: "wallet",
      remainingBalance: (walletBalance -= transactionPrice),
      errorMessage: null
    };
  else
    return {
      paymentType: null,
      remainingBalance: null,
      errorMessage: "Payment failed"
    };
}

/**
 * Generates a simple arithmetic problem consisting of three random numbers and two random operators.
 * @returns an object containing the generated equation and its solution.
 */
export function generateSimpleArithmeticProblem(): {
  equation: string;
  solution: number;
} {
  const firstNumber: number = Math.floor(Math.random() * 9) + 1;
  const secondNumber: number = Math.floor(Math.random() * 9) + 1;
  const thirdNumber: number = Math.floor(Math.random() * 9) + 1;

  const operators: string[] = ["+", "-", "*", "/"];
  const firstOperator: string =
    operators[Math.floor(Math.random() * operators.length)];
  let secondOperator: string =
    operators[Math.floor(Math.random() * operators.length)];
  do {
    secondOperator = operators[Math.floor(Math.random() * operators.length)];
  } while (firstOperator == secondOperator);

  const generatedEquation: string = `${firstNumber}${firstOperator}${secondNumber}${secondOperator}${thirdNumber}`;
  const solution: number = Math.round(eval(generatedEquation));

  return {
    equation: generatedEquation,
    solution: solution
  };
}
