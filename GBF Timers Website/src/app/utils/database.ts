import mongoose from "mongoose";
import MongoURI from "../../config/config.json";

const connectToDatabase = async () => {
  if (!MongoURI.MongoURI) throw new Error(`No Mongo URI provided.`);

  try {
    await mongoose.connect(MongoURI.MongoURI as string, {
      bufferCommands: true,
      autoCreate: false,
      autoIndex: true,
      serverSelectionTimeoutMS: 30000,
    });
    console.log("Connected!");
  } catch (error) {
    throw new Error(`Unable to connect to database\n\n${error}`);
  }
};

export default connectToDatabase;
