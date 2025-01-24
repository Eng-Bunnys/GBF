import { Schema, Document, model } from "mongoose";
import { z } from "zod";
import { GBFUser, Subject } from "./UserTypes";

const mongooseSubjectSchema = new Schema<Subject>({
  subjectName: { type: String, required: true },
  grade: { type: String, required: true },
});

const subjectSchema = z.object({
  subjectName: z
    .string()
    .min(1, "Subject name is required")
    .max(100, "Subject name too long"),
  grade: z.string().min(1, "Grade is required").max(1, "Grade too long"),
});

const userSchema = z.object({
  userID: z.string().min(1, "User ID is required"),
  friends: z.array(z.string()),
  privateProfile: z.boolean(),
  Rank: z.number().int().min(0, "Rank cannot be negative"),
  RP: z.number().int().min(0, "RP cannot be negative"),
  Subjects: z.array(subjectSchema),
});

const UserSchema = new Schema<GBFUser>({
  friends: { type: [String], default: [] },
  privateProfile: { type: Boolean, default: false },
  Rank: { type: Number, default: 0 },
  RP: { type: Number, default: 0 },
  Subjects: { type: [mongooseSubjectSchema], default: [] },
});

const UserModel = model<GBFUser & Document>("GBFUser", UserSchema);

export { UserModel, userSchema };
