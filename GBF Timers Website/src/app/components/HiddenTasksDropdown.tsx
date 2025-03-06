import React, { useState } from "react";

interface HiddenTasksDropdownProps {
  hiddenTasks: { id: string; title: string }[];
}

export default function HiddenTasksDropdown({
  hiddenTasks,
}: HiddenTasksDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (hiddenTasks.length === 0) return null;

  return (
    <div className="relative mb-8">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800"
      >
        {isOpen ? "Hide Hidden Tasks" : "Show Hidden Tasks"}
      </button>

      {isOpen && (
        <div className="absolute mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 w-64">
          <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
            Hidden Tasks
          </h3>
          <ul>
            {hiddenTasks.map((task) => (
              <li key={task.id} className="mb-2 dark:text-gray-200">
                <strong>{task.title}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
