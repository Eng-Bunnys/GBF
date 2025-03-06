import React from "react";
import styles from "../../styles/notes.module.css";

interface TaskCardProps {
  task: { id: string; title: string; description: string };
  color: string;
  isDarkMode: boolean;
}

export default function TaskCard({ task, color, isDarkMode }: TaskCardProps) {
  return (
    <div
      className={`${styles.note} relative font-indie ${"text-black"}`}
      style={{ backgroundColor: color }}
    >
      <div className={styles.pin}></div>
      <p className="text-lg font-semibold">{task.title}</p>
      <p className="text-sm mt-2">{task.description}</p>
    </div>
  );
}
