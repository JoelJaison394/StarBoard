import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { message } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { MdDelete } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import Todo from "./Todo";
import logo from "../assets/Designer__6_-removebg-preview.png"

function TaskCard({ task, onOpenDetails }) {
  function setBgColor(status) {
    switch (status) {
      case "Pending":
        return "bg-purple-500";
      case "StartedWorking":
        return "bg-blue-500";
      case "Completed":
        return "bg-green-500";
      case "NotStarted":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  }
  return (
    <div
      className={`border border-gray-300 p-3 mb-2 rounded-md cursor-pointer ${setBgColor(
        task.completion_status
      )}`}
      onClick={() => onOpenDetails(task)}
    >
      <h4 className="text-lg text-white font-semibold">{task.title}</h4>
      <p className="text-md text-white font-normal">{task.description}</p>
      <p className="text-md text-gray-100 ">Status: {task.completion_status}</p>
    </div>
  );
}

function Todos({ page }) {
  const [taskForm, setTaskForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [page]);
  const handleCloseDetails = () => {
    console.log("Close details");
    setSelectedTask(null);
  };

  const fetchTasks = async () => {
    try {
      const tasksResponse = await invoke("list_tasks", {
        pageId: page.id,
      });
      console.log("List of tasks for the current page:", tasksResponse);
      setTasks(tasksResponse);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleEdit = () => {
    // Handle edit logic
    console.log("Edit task with id:", selectedTask.id);
  };
  const handleOpenDetails = (task) => {
    setSelectedTask(task);
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    console.log("New Status:", newStatus);
    await invoke("change_completion_status", {
      pageId: page.id,
      taskId: selectedTask.id,
      status: newStatus,
    });
    setSelectedTask({ ...selectedTask, completion_status: newStatus });
    fetchTasks();
  };

  const handleDelete = async () => {
    if (!selectedTask) {
      console.error("No task selected for deletion");
      return;
    } else {
      console.log("Deleting task with id:", selectedTask.id);

      const confirm = await message(
        "Are you sure you want to delete this task?",
        { title: "StarBoard", type: "warning" }
      );

      if (confirm) {
        await invoke("delete_task", {
          pageId: page.id,
          taskId: selectedTask.id,
        });
      } else {
        message("Deletion canceled by user", { title: "StarBoard" });
      }

      setSelectedTask(null);
      fetchTasks();
    }

    try {
      const response = await invoke("delete_task", {
        taskId: selectedTask.id,
      });
      console.log(response);
      fetchTasks(); // Refresh tasks after deletion
      setSelectedTask(null); // Close the details panel after deletion
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      message("Title and Description are required", { title: "StarBoard" });
      return;
    }

    try {
      const response = await invoke("add_task", {
        title,
        description,
        pageId: page.id,
      });
      console.log(response);
      fetchTasks(); // Refresh tasks after adding a new task
      setTaskForm(false); // Close the task form after adding a new task
      setTitle(""); // Clear the title input field
      setDescription(""); // Clear the description input field
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <div className="w-full flex flex-col px-4 mt-8 realtive">
      <div className="w-full py-2 px-4 border-b-2 border-blue-200 flex justify-around items-center">
        <div className="w-auto flex justify-center items-center">
            <div className="">
                <img src={logo} alt="logo" className="w-20 h-30" />
            </div>
          <div className="">
            <h2 className="text-3xl font-semibold text-gray-800">Starboard</h2>
            <p className="text-md text-gray-600">
              Effortlessly manage your workload and boost your productivity.
            </p>
          </div>
        </div>
        <div
          className="w-auto h-14 py-2 px-4 bg-black text-white flex justify-center items-center rounded-md cursor-pointer"
          onClick={() => setTaskForm(!taskForm)}
        >
          <IoMdAdd />
          <p className="ml-2">New Task</p>
        </div>
      </div>

      <div className="">
        {tasks.length === 0 && taskForm == false && (
          <div className="w-full text-center text-gray-500 mt-4 mb-3">
            No tasks found, Add new task{" "}
          </div>
        )}
      </div>

      {taskForm && (
        <div className="flex flex-col w-full justify-start items-center border-2 border-gray-200 p-4 mt-3 rounded-md">
          <form onSubmit={handleSubmit} className="mt-4 w-full">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-400 py-2 px-4 mb-2"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-400 py-2 px-4 mb-2"
            ></textarea>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Add Task
            </button>
          </form>
        </div>
      )}

      {selectedTask && (
        <Todo
          selectedTask={selectedTask}
          handleDelete={handleDelete}
          handleStatusChange={handleStatusChange}
          handleEdit={handleEdit}
          handleCloseDetails={handleCloseDetails}
        />
      )}

      <div className="flex mt-4  ">
        <div className="flex-1 mx-2  min-h-[75vh] border-2 border-dashed border-purple-400 rounded-md p-2">
          <h3 className="text-lg font-semibold mb-2 text-center mt-2 border-b-2 pb-2">
            Pending
          </h3>
          {tasks
            .filter((task) => task.completion_status === "Pending")
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpenDetails={handleOpenDetails}
              />
            ))}
        </div>

        <div className="flex-1 mx-2  min-h-[75vh] border-2 border-dashed border-blue-400 rounded-md p-2">
          <h3 className="text-lg text-center font-semibold mt-2 mb-2 border-b-2 pb-2">
            Started Working
          </h3>
          {tasks
            .filter((task) => task.completion_status === "StartedWorking")
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpenDetails={handleOpenDetails}
              />
            ))}
        </div>

        <div className="flex-1 mx-2  min-h-[75vh] border-2 border-dashed border-green-400 rounded-md p-2">
          <h3 className="text-lg font-semibold mb-2 text-center mt-2 border-b-2 pb-2">
            Completed
          </h3>
          {tasks
            .filter((task) => task.completion_status === "Completed")
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpenDetails={handleOpenDetails}
              />
            ))}
        </div>

        <div className="flex-1 mx-2  min-h-[75vh] border-2 border-dashed border-red-400 rounded-md p-2">
          <h3 className="text-lg font-semibold  mb-2 text-center mt-2 border-b-2 pb-2 ">
            Not Started
          </h3>
          {tasks
            .filter((task) => task.completion_status === "NotStarted")
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpenDetails={handleOpenDetails}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default Todos;
