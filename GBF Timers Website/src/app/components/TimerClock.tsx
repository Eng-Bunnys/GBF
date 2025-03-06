"use client";

import { useEffect, useState } from "react";

export default function TimerClock({ isDarkMode }: { isDarkMode: boolean }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className={`text-center text-5xl font-bold mt-8 ${
        isDarkMode ? "text-green-300" : "text-green-800"
      }`}
    >
      {formatTime(time)}
    </div>
  );
}
