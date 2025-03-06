import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../utils/database";
import { TimerModel, type ITimerData } from "../models/Mongo Models/Timer Schema";
