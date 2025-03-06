"use client";

import React from "react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-teal-500">
      <div className="flex flex-col items-center">
        <div className="loader border-t-4 border-b-4 border-white rounded-full w-16 h-16 animate-spin mb-4"></div>
        <h2 className="text-white text-2xl font-bold">{message}</h2>
      </div>

      <style jsx>{`
        .loader {
          border-top-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
