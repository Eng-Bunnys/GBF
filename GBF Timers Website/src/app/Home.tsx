"use client";

import React, { useState, useEffect } from "react";
import {
  SunIcon,
  MoonIcon,
  PlusIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import styles from "../styles/notes.module.css";
import { v4 as uuidv4 } from "uuid";
import CreateTaskModal from "./components/CreateTaskModal";
import EditTaskModal from "./components/EditTaskModal";
import DeleteTaskModal from "./components/DeleteTaskModal";
import { Task } from "./models/Task";
import { getNoteColor } from "./utils/colorUtil";
import { useRouter } from "next/navigation";
import LoadingScreen from "./components/LoadingScreen";

export default function Home() {
  const router = useRouter();

  const saveTasksToLocalStorage = (tasks: Task[]) => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  const loadTasksFromLocalStorage = () => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const loadedTasks = JSON.parse(savedTasks);
      const visibleTasks =
        loadedTasks.length > 6 ? loadedTasks.slice(0, 6) : loadedTasks;
      const hiddenTasks = loadedTasks.length > 6 ? loadedTasks.slice(6) : [];

      setTasks(visibleTasks);
      setHiddenTasks(hiddenTasks);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasksFromLocalStorage();
  }, []);

  const [loading, setLoading] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hiddenTasks, setHiddenTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleAddTaskClick = () => {
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description);
    setIsEditModalOpen(true);
  };

  const handleCreateTask = () => {
    if (newTaskTitle.trim() === "") return;

    const newTask: Task = {
      id: uuidv4(),
      title: newTaskTitle,
      name: newTaskTitle,
      color: getNoteColor(tasks.length),
      description: newTaskDescription || "No Description",
    };

    let updatedTasks = [...tasks, newTask];
    let updatedHiddenTasks = [...hiddenTasks];

    if (tasks.length >= 6) {
      updatedHiddenTasks = [...updatedHiddenTasks, newTask];
    } else {
      updatedTasks = [...tasks, newTask];
    }

    setTasks(updatedTasks.slice(0, 6));
    setHiddenTasks(updatedHiddenTasks);

    saveTasksToLocalStorage([...updatedTasks, ...updatedHiddenTasks]);
    setIsModalOpen(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  const handleUpdateTask = (
    title: string,
    description: string,
    color: string
  ) => {
    if (editingTask) {
      const updatedTask = {
        ...editingTask,
        title,
        description,
        color,
      };

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );

      const allTasks = [
        ...tasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        ),
        ...hiddenTasks,
      ];

      saveTasksToLocalStorage(allTasks);
      setIsEditModalOpen(false);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (task: Task) => {
    openDeleteModal(task);

    const newVisibleTasks = tasks.filter((t) => t.id !== task.id);
    const newHiddenTasks = [...hiddenTasks];

    const taskIndex = hiddenTasks.findIndex((t) => t.id === task.id);
    if (taskIndex !== -1) {
      newHiddenTasks.splice(taskIndex, 1);
    } else {
      if (hiddenTasks.length > 0) {
        const taskToShow = hiddenTasks[0];
        newVisibleTasks.push(taskToShow);
        newHiddenTasks.shift();
      }
    }

    setTasks(newVisibleTasks);
    setHiddenTasks(newHiddenTasks);
    saveTasksToLocalStorage([...newVisibleTasks, ...newHiddenTasks]);
    setIsDeleteModalOpen(false);
  };

  const openDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    router.push(`/task/${task.id}`);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDarkMode);
    }

    const spawnStars = () => {
      if (!isDarkMode) return;

      const starContainer = document.getElementById("star-container");
      if (starContainer) {
        const star = document.createElement("div");
        star.classList.add("star");

        const randomX = Math.floor(Math.random() * (window.innerWidth - 10));
        const randomY = Math.floor(Math.random() * (window.innerHeight - 10));
        star.style.left = `${randomX}px`;
        star.style.top = `${randomY}px`;

        starContainer.appendChild(star);

        setTimeout(() => {
          star.remove();
        }, 46000);
      }
    };

    if (isDarkMode) {
      const starInterval = setInterval(spawnStars, 1000);
      return () => clearInterval(starInterval);
    }
  }, [isDarkMode]);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    color: string
  ) => {
    const note = e.currentTarget;
    const rect = note.getBoundingClientRect();
    const noteX = rect.left + rect.width / 2;
    const noteY = rect.top + rect.height / 2;
    const deltaX = e.clientX - noteX;
    const deltaY = e.clientY - noteY;
    const tiltX = (deltaY / 10).toFixed(2);
    const tiltY = (-deltaX / 10).toFixed(2);

    (
      note as HTMLElement
    ).style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    (note as HTMLElement).style.boxShadow = `0 0 20px 10px ${color}`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const note = e.currentTarget;
    (note as HTMLElement).style.transform = `rotateX(0deg) rotateY(0deg)`;
    (note as HTMLElement).style.boxShadow = `none`;
  };

  if (loading) {
    return <LoadingScreen message="Loading GBF Timers" />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-start p-8 ${
        isDarkMode
          ? "bg-gradient-to-b from-[#000814] via-[#001d3d] to-[#002855]"
          : "bg-gradient-to-br from-green-200 via-blue-200 to-green-100"
      }`}
    >
      {isDarkMode && (
        <div id="star-container" className="absolute inset-0"></div>
      )}

      {/* Dark Mode Toggle Button */}
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

      {/* Hidden Tasks Dropdown */}
      {hiddenTasks.length > 0 && (
        <div className="absolute top-4 left-4">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-gray-600 dark:text-gray-200"
          >
            Hidden Tasks <ChevronDownIcon className="inline h-5 w-5 ml-1" />
          </button>
          {isDropdownOpen && (
            <ul className="bg-white dark:bg-gray-800 mt-2 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {hiddenTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 ease-in-out"
                >
                  <strong className="font-semibold mr-2">{task.title}</strong>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-400"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(task)}
                      className="text-red-500 hover:text-red-600 dark:text-red-300 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Header */}
      <header className="text-center mb-12">
        <h1
          className={`text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-green-500 to-teal-400 dark:from-teal-300 dark:via-green-300 dark:to-blue-300 mb-4`}
        >
          Welcome to GBF Timers
        </h1>
        <p
          className={`text-lg ${
            isDarkMode ? "text-green-300" : "text-green-800"
          }`}
        >
          A smooth way to track your study sessions and breaks
        </p>
      </header>

      {/* Task Section */}
      <section className="w-full max-w-4xl">
        <h2
          className={`text-2xl font-semibold ${
            isDarkMode ? "text-teal-300" : "text-blue-600"
          } mb-6 text-center`}
        >
          {tasks.length
            ? "Your Tasks"
            : "Create a task by clicking on the button below!"}
        </h2>

        {/* Grid Container */}
        <div className="grid grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`${styles.note} relative font-indie ${
                isDarkMode ? "text-gray-200" : "text-gray-900"
              }`}
              style={{
                backgroundColor: task.color || "#FFFFFF",
                color: "black",
              }}
              onMouseMove={(e) => handleMouseMove(e, task.color || "#FDF6E3")}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleTaskClick(task)}
            >
              <p className="text-lg font-semibold">{task.title}</p>
              <p className="text-sm mt-2">{task.description}</p>

              {/* Edit Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTask(task);
                }}
                className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                <PencilIcon className="h-5 w-5 text-gray-700" />
              </button>
              {/* Delete Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(task);
                }}
                className="absolute top-2 right-10 p-1 bg-gray-200 rounded-full hover:bg-red-300"
              >
                <TrashIcon className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Task Button under the Task Section */}
        <button
          onClick={handleAddTaskClick}
          className={`mt-8 px-4 py-2 rounded-full flex items-center gap-2 mx-auto ${
            isDarkMode
              ? "bg-teal-500 text-white hover:bg-teal-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <PlusIcon className="h-5 w-5" />
          Add Task
        </button>
      </section>

      {/* Modal for Adding New Task */}
      <CreateTaskModal
        isModalOpen={isModalOpen}
        newTaskTitle={newTaskTitle}
        newTaskDescription={newTaskDescription}
        setNewTaskTitle={setNewTaskTitle}
        setNewTaskDescription={setNewTaskDescription}
        handleCreateTask={handleCreateTask}
        closeModal={() => setIsModalOpen(false)}
      />

      {/* Modal for Editing Task */}
      <EditTaskModal
        isModalOpen={isEditModalOpen}
        taskTitle={editingTask?.title || ""}
        taskDescription={editingTask?.description || ""}
        taskColor={editingTask?.color || "#FDF6E3"}
        handleEditTask={handleUpdateTask}
        closeModal={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
          setNewTaskTitle("");
          setNewTaskDescription("");
        }}
      />

      {isDeleteModalOpen && taskToDelete && (
        <DeleteTaskModal
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={() => handleDeleteTask(taskToDelete)}
          isOpen={isDeleteModalOpen}
        />
      )}
    </div>
  );
}
