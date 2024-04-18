import { Schema, model } from "mongoose";

interface IExam {
  ExamID: string;
  ExamType?: string;
  ExamName?: string;
  ExamDate?: Date;
  ExamGrade?: number;
  ExamMark?: string;
}

interface IStudent {
  StudentName: string;
  StudentID: string;
  Exams: IExam[];
}

const StudentSchema = new Schema<IStudent>(
  {
    StudentName: String,
    StudentID: String,
    Exams: [
      {
        ExamID: String,
        ExamType: String,
        ExamName: String,
        ExamDate: Date,
        ExamGrade: Number,
        ExamMark: String
      }
    ]
  },
  {
    collection: "Student Information Docs"
  }
);

const StudentModel = model<IStudent>("Student Information Docs", StudentSchema);

export { IStudent, IExam, StudentModel };