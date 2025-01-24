export enum Grade {
  A_PLUS = "A+",
  A = "A",
  A_MINUS = "A-",
  B_PLUS = "B+",
  B = "B",
  B_MINUS = "B-",
  C_PLUS = "C+",
  C = "C",
  C_MINUS = "C-",
  D_PLUS = "D+",
  D = "D",
  F = "F",
  W = "Withdraw",
  P = "Pass",
}

const gradeToGPA: { [key in Grade]: number } = {
  [Grade.A_PLUS]: 4.0,
  [Grade.A]: 4.0,
  [Grade.A_MINUS]: 3.7,
  [Grade.B_PLUS]: 3.3,
  [Grade.B]: 3.0,
  [Grade.B_MINUS]: 2.7,
  [Grade.C_PLUS]: 2.3,
  [Grade.C]: 2.0,
  [Grade.C_MINUS]: 1.7,
  [Grade.D_PLUS]: 1.3,
  [Grade.D]: 1.0,
  [Grade.F]: 0.0,
  [Grade.W]: 0.0,
  [Grade.P]: 0.0,
};

export function calculateGPA(grades: Grade[]): number {
  let totalPoints = 0;
  let totalSubjects = 0;

  for (const grade of grades) {
    if (grade !== Grade.W && grade !== Grade.P) {
      // Exclude Withdrawn and Pass grades
      totalPoints += gradeToGPA[grade];
      totalSubjects += 1;
    }
  }

  return totalSubjects === 0 ? 0 : totalPoints / totalSubjects;
}
