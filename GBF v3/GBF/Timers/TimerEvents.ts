import {
  ButtonInteraction,
  CommandInteraction,
  GuildTextBasedChannel,
} from "discord.js";
import { ITimerData } from "../../Models/Timer/TimerTypes";
import { GBFUser } from "../../Models/User/UserTypes";
import CommandIDs from "../Data/CommandIDs.json";
import { TimerModel } from "../../Models/Timer/TimerModel";
import { Document } from "mongoose";
import { CustomEvents } from "../Data/ClientEvents";
import { msToTime, getTimestamp, GBF } from "../../Handler";
import {
  ButtonFixerOptions,
  LevelUpOptions,
  RecordBrokenOptions,
  TimerButtonID,
  TimerEventsReturns,
} from "./TimerHelper";
import { calculateXP, checkLevel, checkRank } from "./LevelEngine";

export class TimerEvents {
  public timerData: ITimerData & Document;
  public userData: GBFUser & Document;
  public interaction: ButtonInteraction | CommandInteraction;
  public client: GBF;

  constructor(
    client: GBF,
    interaction: ButtonInteraction,
    timerData: ITimerData & Document,
    userData: GBFUser & Document
  ) {
    this.client = client;
    this.timerData = timerData;
    this.userData = userData;
    this.interaction = interaction;
  }

  /// Helpers

  public async originalMessage() {
    return (
      this.client.guilds.cache
        .get(this.timerData.sessionData.guildID)
        ?.channels.cache.get(
          this.timerData.sessionData.channelID
        ) as GuildTextBasedChannel
    )?.messages.fetch(this.timerData.sessionData.messageID);
  }

  public checkID(): boolean {
    return !Object.values(TimerButtonID).includes(
      (this.interaction as ButtonInteraction).customId as TimerButtonID
    );
  }

  public async checkMessageOwner() {
    const originalMessage = await this.originalMessage();

    if (!originalMessage) {
      this.timerData.sessionData.messageID = null;

      await this.timerData!.save();

      throw new Error(
        `I couldn't find the session start message, use ${CommandIDs.timer_start} to start a new session or re-make the session start message.`
      );
    }

    const messageOwner = await TimerModel.findOne({
      "sessionData.messageID": (this.interaction as ButtonInteraction).message
        .id,
    });

    if (
      !messageOwner ||
      (messageOwner && this.interaction.user.id !== messageOwner.account.userID)
    )
      throw new Error(
        `You can't use this button, create your own using ${CommandIDs.timer_start}.`
      );
  }

  public async handleBreak() {
    await this.checkMessageOwner();

    if (
      this.timerData.sessionData.sessionBreaks.sessionBreakStart &&
      (this.interaction as ButtonInteraction).customId !==
        TimerButtonID.Unpause &&
      (this.interaction as ButtonInteraction).customId !== TimerButtonID.Info
    )
      this.client.emit(
        CustomEvents.FixTimerButtons,
        this.client,
        this.interaction
      );
  }

  /// Event Handlers

  public async handleStart() {
    await this.checkMessageOwner();

    if (this.timerData.sessionData.sessionStartTime) {
      const fixerButtons: ButtonFixerOptions = {
        enabledButtons: [
          TimerButtonID.Info,
          TimerButtonID.Pause,
          TimerButtonID.Stop,
        ],
      };
      this.client.emit(
        CustomEvents.FixTimerButtons,
        this.client,
        this.interaction,
        fixerButtons
      );

      return TimerEventsReturns.TimerAlreadyRunning;
    }

    const currentTimestamp = Date.now();

    this.timerData.currentSemester.sessionStartTimes.push(currentTimestamp);

    this.timerData.sessionData.sessionStartTime = new Date(currentTimestamp);
    this.timerData.sessionData.lastSessionDate = new Date(currentTimestamp);
    this.timerData.sessionData.sessionBreaks = {
      sessionBreakStart: null,
      sessionBreakTime: 0,
    };
    this.timerData.sessionData.numberOfBreaks = 0;
    this.timerData.sessionData.sessionTime = 0;

    let sessionTopic = this.timerData.currentSemester.semesterSubjects.find(
      (subject) =>
        subject.subjectCode.trim().toLowerCase() ===
        this.timerData.sessionData.sessionTopic
          ?.split(" - ")[0]
          .trim()
          .toLowerCase()
    );

    sessionTopic.timesStudied++;

    await this.timerData!.save();
  }

  public async handleTimerInfo(): Promise<string> {
    await this.checkMessageOwner();

    let summarizedStats = "";

    if (this.timerData.sessionData.sessionBreaks.sessionBreakStart) {
      let activeBreakTime = Math.abs(
        Number(
          (
            (Date.now() -
              this.timerData.sessionData.sessionBreaks.sessionBreakStart.getTime()) /
            1000
          ).toFixed(3)
        ) * 1000
      );

      summarizedStats += `• Active Break Time: ${
        activeBreakTime > 0 ? msToTime(activeBreakTime) : "0s"
      }\n\n`;
    }

    /**ms */
    const breakTimeRaw = this.timerData.sessionData.sessionBreaks
      .sessionBreakTime
      ? this.timerData.sessionData.sessionBreaks.sessionBreakTime * 1000
      : 0;

    const breakTime =
      breakTimeRaw > this.timerData.sessionData.sessionStartTime.getTime()
        ? breakTimeRaw
        : 0; // If breakTimeRaw is greater than sessionStartTime, use breakTimeRaw, otherwise use 0

    const timeElapsed = Math.abs(
      Number(
        (
          (Date.now() - this.timerData.sessionData.sessionStartTime.getTime()) /
            1000 -
          breakTime
        ).toFixed(3)
      )
    );

    summarizedStats += `• Time Elapsed: ${
      timeElapsed > 0 ? msToTime(timeElapsed * 1000) : "0s"
    }\n• Break Time: ${
      breakTimeRaw > 0 ? msToTime(breakTimeRaw) : "0s"
    }\n• Number of Breaks: ${
      this.timerData.sessionData.numberOfBreaks
    }\n\n• Start Time: ${getTimestamp(
      this.timerData.sessionData.sessionStartTime,
      "F"
    )}`;

    return summarizedStats;
  }

  public async handlePause() {
    await this.checkMessageOwner();

    const fixerOptions: ButtonFixerOptions = {
      enabledButtons: [TimerButtonID.Unpause, TimerButtonID.Info],
      isPaused: true,
    };

    if (!this.timerData.sessionData.sessionStartTime) {
      const disabledButtons: ButtonFixerOptions = {
        enabledButtons: [],
      };
      this.client.emit(
        CustomEvents.FixTimerButtons,
        this.client,
        this.interaction,
        disabledButtons
      );

      return TimerEventsReturns.TimerNotStarted;
    }

    if (this.timerData.sessionData.sessionBreaks.sessionBreakStart) {
      this.client.emit(
        CustomEvents.FixTimerButtons,
        this.client,
        this.interaction,
        fixerOptions
      );

      return TimerEventsReturns.TimerAlreadyPaused;
    }

    this.timerData.sessionData.sessionBreaks.sessionBreakStart = new Date(
      Date.now()
    );
    this.timerData.sessionData.numberOfBreaks++;
    this.timerData.currentSemester.breakCount++;

    this.client.emit(
      CustomEvents.FixTimerButtons,
      this.client,
      this.interaction,
      fixerOptions
    );

    await this.timerData!.save();
  }

  public async handleUnpause() {
    await this.checkMessageOwner();

    const fixerOptions: ButtonFixerOptions = {
      enabledButtons: [
        TimerButtonID.Pause,
        TimerButtonID.Info,
        TimerButtonID.Stop,
      ],
    };

    if (!this.timerData.sessionData.sessionStartTime) {
      const disabledButtons: ButtonFixerOptions = {
        enabledButtons: [],
      };
      this.client.emit(
        CustomEvents.FixTimerButtons,
        this.client,
        this.interaction,
        disabledButtons
      );

      return TimerEventsReturns.TimerNotStarted;
    }

    if (!this.timerData.sessionData.sessionBreaks.sessionBreakStart) {
      this.client.emit(
        CustomEvents.FixTimerButtons,
        this.client,
        this.interaction,
        fixerOptions
      );

      return TimerEventsReturns.TimerNotPaused;
    }

    const timeElapsed = Math.round(
      Number(
        Math.abs(
          (Date.now() -
            this.timerData.sessionData.sessionBreaks.sessionBreakStart.getTime()) /
            1000
        )
      )
    );

    this.timerData.sessionData.sessionBreaks.sessionBreakTime += timeElapsed;
    this.timerData.sessionData.sessionBreaks.sessionBreakStart = null;

    this.client.emit(
      CustomEvents.FixTimerButtons,
      this.client,
      this.interaction,
      fixerOptions
    );

    await this.timerData!.save();

    return timeElapsed;
  }

  public async handleStop(): Promise<string | TimerEventsReturns> {
    await this.checkMessageOwner();

    // Guard: Timer not started
    if (!this.timerData.sessionData.sessionStartTime) {
      this.fixTimerButtons([]);
      return TimerEventsReturns.TimerNotStarted;
    }

    // Guard: Session is paused
    if (this.timerData.sessionData.sessionBreaks.sessionBreakStart) {
      this.fixTimerButtons([TimerButtonID.Unpause, TimerButtonID.Info], true);
      return TimerEventsReturns.CannotStopPaused;
    }

    // Calculate session metrics
    const { startTime, elapsedSeconds, totalSeconds, formattedMetrics } =
      this.calculateSessionMetrics();

    let endMessage = `• Start Time: ${getTimestamp(
      startTime,
      "F"
    )}\n${formattedMetrics}`;

    // Update semester totals
    this.updateSemesterTotals(elapsedSeconds);

    // Check for new longest session record
    this.checkAndEmitRecord(elapsedSeconds);

    // Calculate XP and check for level/rank ups
    const xpEarned = Math.round(calculateXP(elapsedSeconds / 60));

    const rankUpResult = checkRank(
      this.userData.Rank,
      this.userData.RP,
      xpEarned
    );
    const levelUpResult = checkLevel(
      this.timerData.currentSemester.semesterLevel,
      this.timerData.currentSemester.semesterXP,
      xpEarned
    );

    if (rankUpResult.hasRankedUp) {
      const rankUpOptions: LevelUpOptions = {
        interaction: this.interaction as CommandInteraction,
        levelUps: rankUpResult.addedLevels,
        carryOverXP: rankUpResult.remainingRP,
        userData: this.userData,
      };
      this.client.emit(CustomEvents.AccountLevelUp, rankUpOptions);
    }

    if (levelUpResult.hasLeveledUp) {
      const levelUpOptions: LevelUpOptions = {
        interaction: this.interaction as CommandInteraction,
        levelUps: levelUpResult.addedLevels,
        carryOverXP: levelUpResult.remainingXP,
        timerData: this.timerData,
      };
      this.client.emit(CustomEvents.SemesterLevelUp, levelUpOptions);
    }

    // Disable buttons and reset session data
    this.fixTimerButtons([]);
    this.resetSessionData();

    await this.timerData.save();
    return endMessage;
  }

  /**
   * Emits FixTimerButtons event
   */
  private fixTimerButtons(
    enabledButtons: TimerButtonID[],
    isPaused: boolean = false
  ): void {
    const options: ButtonFixerOptions = { enabledButtons, isPaused };
    this.client.emit(
      CustomEvents.FixTimerButtons,
      this.client,
      this.interaction,
      options
    );
  }

  /**
   * Calculates time metrics for the session
   */
  private calculateSessionMetrics() {
    const { sessionStartTime, sessionBreaks, numberOfBreaks } =
      this.timerData.sessionData;
    const startTime = sessionStartTime!;

    // Convert break time to milliseconds if available
    const totalBreakMs = sessionBreaks.sessionBreakTime
      ? sessionBreaks.sessionBreakTime * 1000
      : 0;

    // Ensure break time is valid compared to session start timestamp
    const validBreakMs = totalBreakMs > startTime.getTime() ? totalBreakMs : 0;

    // Calculate elapsed time (subtract break time)
    let elapsedSeconds = Number(
      ((Date.now() - startTime.getTime()) / 1000 - validBreakMs).toFixed(3)
    );
    // Adjust if break time exceeds total unpaused time
    if (elapsedSeconds <= 0) {
      elapsedSeconds += validBreakMs;
    }

    const totalSeconds = elapsedSeconds + totalBreakMs / 1000;
    const formattedMetrics =
      `• Time Elapsed: ${msToTime(
        totalSeconds * 1000
      )}\n• Session Time: ${msToTime(elapsedSeconds * 1000)}\n` +
      `\n• Average Break Time: ${
        numberOfBreaks > 0
          ? msToTime(totalBreakMs / numberOfBreaks)
          : "No Breaks Taken"
      }\n• Total Break Time: ${
        totalBreakMs > 0 ? msToTime(totalBreakMs) : "No Breaks Taken"
      }\n• Number of Breaks: ${numberOfBreaks}`;

    return { startTime, elapsedSeconds, totalSeconds, formattedMetrics };
  }

  /**
   * Update semester totals with the current session's metrics
   */
  private updateSemesterTotals(elapsedSeconds: number): void {
    const totalBreakSec = this.timerData.sessionData.sessionBreaks
      .sessionBreakTime
      ? this.timerData.sessionData.sessionBreaks.sessionBreakTime
      : 0;
    this.timerData.currentSemester.totalBreakTime += totalBreakSec;
    this.timerData.currentSemester.semesterTime += elapsedSeconds;
    this.timerData.currentSemester.breakCount +=
      this.timerData.sessionData.numberOfBreaks;
    this.timerData.account.lifetimeTime += elapsedSeconds;
  }

  /**
   * Check if the current session is the longest and emit event if so
   */
  private checkAndEmitRecord(sessionTime: number): void {
    if (this.timerData.currentSemester.longestSession < sessionTime) {
      this.timerData.currentSemester.longestSession = sessionTime;
      const recordBroken: RecordBrokenOptions = {
        interaction: this.interaction as CommandInteraction,
        type: "Session",
        sessionTime,
      };
      this.client.emit(CustomEvents.RecordBroken, recordBroken);
    }
  }

  /**
   * Resets session data after stopping
   */
  private resetSessionData(): void {
    this.timerData.sessionData.sessionStartTime = null;
    this.timerData.sessionData.channelID = null;
    this.timerData.sessionData.messageID = null;
    this.timerData.sessionData.guildID = null;

    this.timerData.sessionData.numberOfBreaks = 0;
    this.timerData.sessionData.sessionTime = 0;
    this.timerData.sessionData.sessionBreaks.sessionBreakTime = 0;
    this.timerData.sessionData.sessionBreaks.sessionBreakStart = null;
    this.timerData.sessionData.lastSessionTopic =
      this.timerData.sessionData.sessionTopic;
  }
}
