import * as ExcelJS from "exceljs";
import * as path from "path";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { AttachmentBuilder } from "discord.js";

export function GenerateID() {
  return (
    Math.random().toString(36).substring(2, 8) +
    `${Math.round(Math.random() * 4600)}`
  );
}

export function CalculatePercentage(number: number, total = 100): number {
  return (number / total) * 100;
}

export function StudentAverages(grades: number[]): number {
  let TotalScores = 0;
  grades.forEach((grade) => {
    TotalScores += grade;
  });

  return Math.round(TotalScores / grades.length);
}

export function FormatName(name: string): string {
  const words = name.split(" ");
  const formattedWords = words.map((word) => {
    const trimmedWord = word.replace(/^[^a-zA-Z0-9]+/, "");

    if (trimmedWord.length > 0) {
      const firstChar = trimmedWord.charAt(0);
      const capitalizedWord = firstChar.toUpperCase() + trimmedWord.slice(1);

      return capitalizedWord;
    }

    return "";
  });

  return formattedWords.join(" ");
}

interface ICurve {
  grade: string;
  minPercentage: number;
}

export function getExamGrade(examGrade: number, GradeCurve: ICurve[]) {
  for (const gradeObj of GradeCurve) {
    if (examGrade >= gradeObj.minPercentage) {
      return gradeObj.grade;
    }
  }

  return "F";
}

export function passRate(Grades: number[], LowerBound: number): number {
  let failedStudents = 0;
  for (const Grade of Grades) {
    if (Grade <= LowerBound) failedStudents++;
  }
  return Math.round(CalculatePercentage(failedStudents, Grades.length));
}

export async function generateExcel(
  data: any[],
  fileName: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet 1");

  const headerRow = worksheet.getRow(1);
  headerRow.getCell(2).value = "Student Name";
  headerRow.getCell(3).value = "Raw Grade";
  headerRow.getCell(4).value = "Grade";

  headerRow.font = { bold: true };

  worksheet.getColumn(2).alignment = { horizontal: "center" };
  worksheet.getColumn(3).alignment = { horizontal: "center" };
  worksheet.getColumn(4).alignment = { horizontal: "center" };

  data.sort((a, b) => b.rawGrade - a.rawGrade);

  let totalStudents = data.length;
  let totalGrade = data.reduce((sum, student) => sum + student.rawGrade, 0);
  let averageGrade = totalGrade / totalStudents;

  for (let i = 0; i < data.length; i++) {
    const student = data[i];
    const rowNumber = i + 2;

    worksheet.getCell(`B${rowNumber}`).value = student.name;
    worksheet.getCell(`C${rowNumber}`).value = student.rawGrade;
    worksheet.getCell(`D${rowNumber}`).value = student.Grade;
  }

  const firstRow = worksheet.getRow(1);
  const firstColumn = worksheet.getColumn(1);

  firstRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "8DB4E2" }
  };

  firstColumn.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "8DB4E2" }
  };

  worksheet.getCell(
    `B${data.length + 2}`
  ).value = `Total: ${totalStudents} students`;

  worksheet.getCell(
    `C${data.length + 2}`
  ).value = `Average: ${averageGrade.toFixed(2)}%`;

  const folderName = "excel";
  const folderPath = path.join(process.cwd(), folderName);
  const filePath = path.join(folderPath, `${fileName}.xlsx`);

  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel spreadsheet generated: ${filePath}`);
}

interface Grade {
  grade: string;
  minPercentage: number;
}

interface GradeData {
  grade: string;
  count: number;
}

interface ChartData {
  labels: string[];
  data: number[];
  backgroundColor: string[];
}

interface Grade {
  grade: string;
  minPercentage: number;
}

interface GradeData {
  grade: string;
  count: number;
  percentage: number;
}

interface ChartData {
  labels: string[];
  data: number[];
}

export async function createGradePieChart(
  numbers: number[],
  gradeCurve: Grade[]
): Promise<AttachmentBuilder> {
  const totalNumbersCount = numbers.length;

  const gradeData: GradeData[] = gradeCurve.map((gradeObj) => ({
    grade: gradeObj.grade,
    count: numbers.filter((number) => number >= gradeObj.minPercentage).length,
    percentage:
      (numbers.filter((number) => number >= gradeObj.minPercentage).length *
        100) /
      totalNumbersCount
  }));

  const chartData: ChartData = {
    labels: gradeData.map(
      (data) => `${data.grade} (${data.percentage.toFixed(2)}%)`
    ),
    data: gradeData.map((data) => data.count),
    backgroundColor: [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#FF9F40",
      "#9966FF",
      "#DCDCDC"
    ]
  };

  const canvasRenderService = new ChartJSNodeCanvas({
    width: 800,
    height: 600
  });

  const configuration = {
    type: "pie" as const,
    data: {
      labels: chartData.labels,
      datasets: [
        {
          data: chartData.data,
          backgroundColor: chartData.backgroundColor
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: "#ffffff"
          }
        }
      }
    }
  };

  const RenderedPieChart = await canvasRenderService.renderToBuffer(
    configuration
  );

  const PieChartAttachment = new AttachmentBuilder(RenderedPieChart, {
    name: `exam_stats.png`
  });

  return PieChartAttachment;
}

export async function createGradeBarChart(
  numbers: number[],
  gradeCurve: Grade[]
): Promise<AttachmentBuilder> {
  const totalNumbersCount = numbers.length;

  const gradeData: GradeData[] = gradeCurve.map((gradeObj) => ({
    grade: gradeObj.grade,
    count: numbers.filter((number) => number >= gradeObj.minPercentage).length,
    percentage:
      (numbers.filter((number) => number >= gradeObj.minPercentage).length *
        100) /
      totalNumbersCount
  }));

  const chartData: ChartData = {
    labels: gradeData.map(
      (data) => `${data.grade} (${data.percentage.toFixed(2)}%)`
    ),
    data: gradeData.map((data) => data.count),
    backgroundColor: [] // Initialize an empty array to store the bar colors
  };

  for (let i = 0; i < chartData.labels.length; i++) {
    const colorIndex = Math.floor(i / 3) % 3; // Calculate the color index based on the current bar index
    let color: string;

    // Assign colors based on the color index
    if (colorIndex === 0) {
      color = "#00FF00"; // Green
    } else if (colorIndex === 1) {
      color = "#FFFF00"; // Yellow
    } else {
      color = "#FF0000"; // Red
    }

    chartData.backgroundColor.push(color); // Push the color to the backgroundColor array
  }

  const canvasRenderService = new ChartJSNodeCanvas({
    width: 800,
    height: 600
  });

  const configuration = {
    type: "bar" as const,
    data: {
      labels: chartData.labels,
      datasets: [
        {
          data: chartData.data,
          backgroundColor: chartData.backgroundColor
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          display: false // Hide the legend
        },
        datalabels: {
          color: "#ffffff",
          font: {
            weight: "bold"
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false // Hide x-axis gridlines
          },
          ticks: {
            color: "#ffffff" // Set x-axis label color to white
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "#ffffff" // Set y-axis gridlines color to white
          },
          ticks: {
            color: "#ffffff" // Set y-axis label color to white
          }
        }
      }
    }
  };

  const RenderedBarChart = await canvasRenderService.renderToBuffer(
    configuration
  );

  const BarChartAttachment = new AttachmentBuilder(RenderedBarChart, {
    name: `exam_stats.png`
  });

  return BarChartAttachment;
}
