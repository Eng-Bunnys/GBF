import React, { useEffect } from "react";

interface StarsProps {
  isDarkMode: boolean;
}

export default function Stars({ isDarkMode }: StarsProps) {
  useEffect(() => {
    if (!isDarkMode) return;

    const spawnStars = () => {
      const starContainer = document.getElementById("star-container");
      if (starContainer) {
        const star = document.createElement("div");
        star.classList.add("star");

        const randomX = Math.floor(Math.random() * window.innerWidth);
        const randomY = Math.floor(Math.random() * window.innerHeight);
        star.style.left = `${randomX}px`;
        star.style.top = `${randomY}px`;

        starContainer.appendChild(star);
        setTimeout(() => star.remove(), 46000);
      }
    };

    const starInterval = setInterval(spawnStars, 1000);
    return () => clearInterval(starInterval);
  }, [isDarkMode]);

  return isDarkMode ? (
    <div id="star-container" className="absolute inset-0"></div>
  ) : null;
}
