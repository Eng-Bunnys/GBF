import { Router } from "express";
import { getWelcomeMessage } from "../controllers/welcomeMessageController";

const router = Router();

router.get("/welcome", (req, res) => {
  return res.status(400).json({
    error: "A username parameter must be specified.",
  });
});

router.get("/welcome/:username", getWelcomeMessage);

export default router;
