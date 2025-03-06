import React from "react";

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  isOpen,
  onClose,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 transition-transform transform scale-95 hover:scale-100">
        <h2 className="text-lg font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
          Delete Task
        </h2>
        <p className="text-sm text-gray-700 mb-4 text-center dark:text-gray-300">
          Are you sure you want to delete this task?
        </p>
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTaskModal;
