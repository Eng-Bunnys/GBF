"use client";

import { useEffect, useState } from "react";

interface TaskTimerProps {
  isDarkMode: boolean;
  onStartTask: () => void;
  onPauseTask: () => void;
}

export default function TaskTimer({
  isDarkMode,
  onStartTask,
  onPauseTask,
}: TaskTimerProps) {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTaskEnded, setIsTaskEnded] = useState(false);
  const [ringColor, setRingColor] = useState("white");

  useEffect(() => {
    if (isTimerActive && !isTimerPaused && !isTaskEnded && startTime) {
      const updateElapsedTime = () => {
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime - pausedTime) / 1000));
      };
      const interval = setInterval(updateElapsedTime, 1000);
      return () => clearInterval(interval);
    }
  }, [isTimerActive, isTimerPaused, isTaskEnded, startTime, pausedTime]);

  useEffect(() => {
    if (isTimerPaused && pauseStartTime) {
      const updatePausedTime = () => {
        const now = Date.now();
        setPausedTime(
          (prevPausedTime) => prevPausedTime + (now - pauseStartTime)
        );
        setPauseStartTime(now);
      };
      const interval = setInterval(updatePausedTime, 1000);
      return () => clearInterval(interval);
    }
  }, [isTimerPaused, pauseStartTime]);

  const handleStartTask = () => {
    setIsTimerActive(true);
    setIsTimerPaused(false);
    setStartTime(Date.now() - elapsedTime * 1000);
    setPausedTime(0);
    setRingColor(isDarkMode ? "#2960ff" : "yellow");
    onStartTask();
  };

  const handlePauseTask = () => {
    setIsTimerPaused(true);
    setPauseStartTime(Date.now());
    setRingColor("red");
    onPauseTask();
  };

  const handleResumeTask = () => {
    if (pauseStartTime) {
      const now = Date.now();
      setPausedTime(
        (prevPausedTime) => prevPausedTime + (now - pauseStartTime)
      );
    }
    setPauseStartTime(null);
    setIsTimerPaused(false);
    setRingColor(isDarkMode ? "#2960ff" : "yellow");
  };

  const handleEndTask = () => {
    if (isTimerPaused) return;

    setIsTaskEnded(true);
    setIsTimerActive(false);
    setRingColor("white");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="text-center mt-0">
      <div
        className={`relative mx-auto w-80 h-80 rounded-full flex flex-col items-center justify-center border-8 ${
          isTimerPaused
            ? "border-red-600"
            : isDarkMode
            ? "border-blue-200"
            : "border-yellow-100"
        }`}
        style={{
          boxShadow: `0 0 30px 10px ${ringColor}`,
        }}
      >
        <div
          className={`text-6xl font-bold ${
            isDarkMode ? "text-yellow-300" : "text-blue-600"
          }`}
          style={{
            textShadow: isDarkMode ? "0 0 15px rgba(255, 255, 0, 0.5)" : "none",
          }}
        >
          {formatTime(elapsedTime)}
        </div>

        {/* Display Paused Time */}
        {isTimerPaused && (
          <div
            className={`text-xl font-semibold ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {formatTime(Math.floor(pausedTime / 1000))}
          </div>
        )}
      </div>

      <div className="flex space-x-4 mt-6 justify-center">
        {!isTaskEnded && !isTimerActive ? (
          <button
            onClick={handleStartTask}
            className="px-6 py-2 rounded-full font-semibold shadow-md bg-green-500 text-white hover:bg-green-600"
          >
            Start Task
          </button>
        ) : isTimerPaused && !isTaskEnded ? (
          <button
            onClick={handleResumeTask}
            className="px-6 py-2 rounded-full font-semibold shadow-md bg-yellow-500 text-white hover:bg-yellow-600"
          >
            Resume Task
          </button>
        ) : !isTaskEnded ? (
          <button
            onClick={handlePauseTask}
            className="px-6 py-2 rounded-full font-semibold shadow-md bg-red-500 text-white hover:bg-red-600"
          >
            Pause Task
          </button>
        ) : (
          <button
            className="px-6 py-2 rounded-full font-semibold shadow-md bg-red-400 text-white opacity-50 cursor-not-allowed"
            disabled
          >
            Task Ended
          </button>
        )}
        {!isTaskEnded && isTimerActive && (
          <button
            onClick={handleEndTask}
            className={`px-6 py-2 rounded-full font-semibold shadow-md text-white ${
              isTimerPaused
                ? "bg-red-400 opacity-50 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
            disabled={isTimerPaused}
          >
            End Task
          </button>
        )}
      </div>
    </div>
  );
}
