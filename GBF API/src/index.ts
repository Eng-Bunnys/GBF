import express, { Application } from "express";
import { json, urlencoded } from "body-parser";
import dotenv from "dotenv";
dotenv.config();

// Roue imports
import welcomeRoutes from "./routes/welcomeMessageRouter";

const app: Application = express();
const PORT = process.env.PORT;

app.use(json());
app.use(
  urlencoded({
    extended: true,
  })
);

app.use("/api", welcomeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on ${process.env.URL}:${PORT}`);
});
