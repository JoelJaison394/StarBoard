import React, { useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { FiEdit } from "react-icons/fi";


function Todo({
  selectedTask,
  handleDelete,
  handleEdit,
  handleStatusChange,
  handleCloseDetails,
}) {
  const [status, setStatus] = useState(selectedTask.completion_status);

  useEffect(() => {
    setStatus(selectedTask.completion_status);
  }, [selectedTask.completion_status]);

  return (
    <div
      className="fixed  right-10 bottom-10 bg-white z-10 p-4 shadow-md rounded-lg border border-gray-200"
      style={{ width: "350px" }}
    >
      <div className="flex justify-between items-center px-4 py-2">
        <h2 className="text-lg font-semibold">{selectedTask.title}</h2>
        <div className="flex justify-around items-center">
          <button
            className="bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600 mx-2"
            onClick={handleDelete}
          >
            <MdDelete size={16} />
          </button>
          <button
            className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600"
            onClick={handleEdit}
          >
            <FiEdit size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-gray-200">
        <p className="text-sm text-gray-600">{selectedTask.description}</p>
        <p className="text-sm text-gray-500">Status: {selectedTask.completion_status}</p>
      </div>

      <div className="px-4 py-2">
        <p className="text-sm font-semibold mb-2">Choose the current status</p>
        <div className="flex flex-col space-y-1">
          <label className="flex items-center">
            <input
              type="radio"
              value="Pending"
              checked={status === "Pending"}
              onChange={handleStatusChange}
              className="mr-2 accent-blue-500"
            />
            Pending
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="StartedWorking"
              checked={status === "StartedWorking"}
              onChange={handleStatusChange}
              className="mr-2 accent-blue-500"
            />
            Started Working
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="Completed"
              checked={status === "Completed"}
              onChange={handleStatusChange}
              className="mr-2 accent-blue-500"
            />
            Completed
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="NotStarted"
              checked={status === "NotStarted"}
              onChange={handleStatusChange}
              className="mr-2 accent-blue-500"
            />
            Not Started
          </label>
        </div>
      </div>
      <div className="px-4 py-2 bg-red-300 w-auto text-center rounded-md text-lg font-medium hover:bg-red-400 cursor-pointer" onClick={handleCloseDetails}>Close</div>
    </div>
  );
}

export default Todo;
