import { Request, Response } from "express";
import { GetRandomFromArray } from "../utils/utils";

const WelcomeMessages = [
  `How's your day, {username}?`,
  `Hey there, {username}!`,
  `Good to see you, {username}!`,
  `Welcome back, {username}!`,
  `Hello, {username}!`,
  `Hi, {username}!`,
  `Hey {username}!`,
  `Good day, {username}!`,
];

export const getWelcomeMessage = (req: Request, res: Response) => {
  const username = req.params.username;

  if (!username)
    return res.status(400).json({
      error: "A username is required",
    });

  const randomMessage = GetRandomFromArray(WelcomeMessages).replace(
    "{username}",
    username
  );
  res.json({
    welcomeMessage: randomMessage,
  });
};
