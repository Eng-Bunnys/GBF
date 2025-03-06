import React from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/solid";

interface DarkModeToggleProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function DarkModeToggle({
  isDarkMode,
  toggleDarkMode,
}: DarkModeToggleProps) {
  return (
    <button
      onClick={toggleDarkMode}
      className="absolute top-4 right-4 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 dark:bg-gray-700 dark:text-gray-300"
    >
      {isDarkMode ? (
        <SunIcon className="h-6 w-6" />
      ) : (
        <MoonIcon className="h-6 w-6" />
      )}
    </button>
  );
}
