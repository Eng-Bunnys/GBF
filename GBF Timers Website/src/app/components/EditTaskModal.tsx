import React, { useState, useEffect } from "react";

const colors = ["#FDF6E3", "#F8D7D6", "#FCE3C7", "#CFE8F3", "#D5ECD4"];

interface EditTaskModalProps {
  isModalOpen: boolean;
  taskTitle: string;
  taskDescription: string;
  taskColor: string;
  handleEditTask: (
    taskTitle: string,
    taskDescription: string,
    taskColor: string
  ) => void;
  closeModal: () => void;
}

export default function EditTaskModal({
  isModalOpen,
  taskTitle,
  taskDescription,
  taskColor,
  handleEditTask,
  closeModal,
}: EditTaskModalProps) {
  const [localTitle, setLocalTitle] = useState(taskTitle);
  const [localDescription, setLocalDescription] = useState(taskDescription);
  const [localColor, setLocalColor] = useState(taskColor);
  const [errorMessage, setErrorMessage] = useState("");

  const onEditTask = () => {
    if (!localTitle) {
      setErrorMessage("Please enter a task name.");
      return;
    }

    handleEditTask(
      localTitle,
      localDescription || "No Description",
      localColor
    );
    setErrorMessage("");
    closeModal();
  };

  const onCloseModal = () => {
    setErrorMessage("");
    closeModal();
  };

  useEffect(() => {
    if (isModalOpen) {
      setLocalTitle(taskTitle);
      setLocalDescription(taskDescription);
      setLocalColor(taskColor);
    }
  }, [isModalOpen, taskTitle, taskDescription, taskColor]);

  if (!isModalOpen) return null;

  const titleCharsLeft = 30 - localTitle.length;
  const descriptionCharsLeft = 150 - localDescription.length;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 transition-transform transform scale-95 hover:scale-100">
        <h2 className="text-lg font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
          Edit Task
        </h2>
        <label className="block mb-2 text-gray-700 dark:text-gray-200">
          Task Name:
        </label>
        <input
          type="text"
          maxLength={30}
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-teal-400"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder="Enter task name"
        />
        {errorMessage && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-300">
          {localTitle.length}/30 characters
          {titleCharsLeft < 5 && titleCharsLeft >= 0 && (
            <span className="text-red-500 ml-2">
              ({titleCharsLeft} characters left)
            </span>
          )}
        </p>

        <label className="block mt-4 mb-2 text-gray-700 dark:text-gray-200">
          Task Description:
        </label>
        <textarea
          maxLength={150}
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-teal-400"
          value={localDescription}
          onChange={(e) => setLocalDescription(e.target.value)}
          placeholder="Enter task description"
        />
        <p className="text-sm text-gray-500 dark:text-gray-300">
          {localDescription.length}/150 characters
          {descriptionCharsLeft < 10 && descriptionCharsLeft >= 0 && (
            <span className="text-red-500 ml-2">
              ({descriptionCharsLeft} characters left)
            </span>
          )}
        </p>

        {/* Color Selection */}
        <div className="mt-4">
          <label className="block mb-2 text-gray-700 dark:text-gray-200">
            Choose Color:
          </label>
          <div className="flex">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setLocalColor(color)}
                style={{
                  backgroundColor: color,
                  border: localColor === color ? "2px solid black" : "none",
                  width: "40px",
                  height: "40px",
                  marginRight: "5px",
                  cursor: "pointer",
                  position: "relative",
                  outline: localColor === color ? "2px solid white" : "none",
                }}
                className="relative"
              >
                {localColor === color && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="text-black text-xs">✓</span>
                    {/* Checkmark for selected color */}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onEditTask}
            className="px-4 py-2 mr-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-teal-500 dark:hover:bg-teal-600"
          >
            Save
          </button>
          <button
            onClick={onCloseModal}
            className="px-4 py-2 bg-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
