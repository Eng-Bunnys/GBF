import React, { useState } from "react";

interface CreateTaskModalProps {
  isModalOpen: boolean;
  newTaskTitle: string;
  newTaskDescription: string;
  setNewTaskTitle: (value: string) => void;
  setNewTaskDescription: (value: string) => void;
  handleCreateTask: (taskTitle: string, taskDescription: string) => void;
  closeModal: () => void;
}

export default function CreateTaskModal({
  isModalOpen,
  newTaskTitle,
  newTaskDescription,
  setNewTaskTitle,
  setNewTaskDescription,
  handleCreateTask,
  closeModal,
}: CreateTaskModalProps) {
  const [errorMessage, setErrorMessage] = useState("");

  const onCreateTask = () => {
    if (!newTaskTitle) {
      setErrorMessage("Please enter a task name.");
      return;
    }

    handleCreateTask(newTaskTitle, newTaskDescription || "No Description");
    setErrorMessage("");
    closeModal();
  };

  const onCloseModal = () => {
    setErrorMessage("");
    closeModal();
  };

  if (!isModalOpen) return null;

  const titleCharsLeft = 30 - newTaskTitle.length;
  const descriptionCharsLeft = 150 - newTaskDescription.length;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 transition-transform transform scale-95 hover:scale-100">
        <h2 className="text-lg font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
          Create New Task
        </h2>
        <label className="block mb-2 text-gray-700 dark:text-gray-200">
          Task Name:
        </label>
        <input
          type="text"
          maxLength={30} // Set max length for task name
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-teal-400"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter task name"
        />
        {errorMessage && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-300">
          {newTaskTitle.length}/30 characters
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
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          placeholder="Enter task description"
        />
        <p className="text-sm text-gray-500 dark:text-gray-300">
          {newTaskDescription.length}/150 characters
          {descriptionCharsLeft < 10 && descriptionCharsLeft >= 0 && (
            <span className="text-red-500 ml-2">
              ({descriptionCharsLeft} characters left)
            </span>
          )}
        </p>

        <div className="flex justify-end mt-6">
          <button
            onClick={onCreateTask}
            className="px-4 py-2 mr-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-teal-500 dark:hover:bg-teal-600"
          >
            Create
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
