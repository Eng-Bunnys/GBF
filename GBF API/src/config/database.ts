import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.MONGO_URI as string;

if (!mongoURI) {
  console.error("No Mongo URI was defined in the .env file.");
  process.exit(1);
}

mongoose.connect(mongoURI, {
  bufferCommands: true,
  autoCreate: false,
  autoIndex: true,
  serverSelectionTimeoutMS: 30000,
});

const mongoConnection = mongoose.connection;

mongoConnection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);

mongoConnection.once("open", () => {
  console.log("Successfully connected to MongoDB");
});

export default mongoConnection;
