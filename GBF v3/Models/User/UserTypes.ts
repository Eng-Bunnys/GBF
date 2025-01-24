import { Grade } from "../../GBF/Timers/GradeEngine";

interface Subject {
  subjectName: string;
  grade: Grade;
}

interface GBFUser {
  userID: string;
  friends: string[];
  privateProfile: boolean;
  Rank: number;
  RP: number;
  Subjects: Subject[];
}

export { GBFUser, Subject };
