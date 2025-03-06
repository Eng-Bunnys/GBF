"use client"

import { useState, useEffect, ReactNode } from "react";

interface DarkModeProviderProps {
  children: ReactNode;
}

export default function DarkModeProvider({ children }: DarkModeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDarkMode);
    }
  }, [isDarkMode]);

  return <div className={isDarkMode ? "dark" : ""}>{children}</div>;
}
