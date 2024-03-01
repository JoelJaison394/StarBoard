import { useState, useEffect } from "react";
import { MdEdit } from "react-icons/md";
import { invoke } from "@tauri-apps/api/tauri";

import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);

  useEffect(() => {
    async function fetchTasks() {
      const response = await invoke("list_tasks");
      setTasks(response);
    }

    fetchTasks();
  }, [editTaskId]);

  async function handleAddTask() {
    await invoke("add_task", {
      title: newTaskTitle,
      description: newTaskDescription,
    });

    // Fetch updated tasks after adding a new task
    const updatedTasks = await invoke("list_tasks");
    setTasks(updatedTasks);

    // Clear input fields after adding a new task
    setNewTaskTitle("");
    setNewTaskDescription("");
  }

  async function handleEditTask(id, newTitle, newDescription) {
    await invoke("edit_task", {
      id,
      new_title: newTitle,
      new_description: newDescription,
    });

    // Set the edited task ID to trigger a re-fetch of tasks
    setEditTaskId(id);
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Task Manager</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className="mb-4 border p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <strong className="text-lg">{task.title}</strong>
                  <p className="mt-2 text-gray-600">{task.description}</p>
                </div>
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => handleEditTask(task.id, "New Title", "New Description")}
                >
                  <MdEdit />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Task</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTask();
          }}
        >
          <div className="flex items-center mb-4">
            <label htmlFor="title" className="mr-2">
              Title:
            </label>
            <input
              type="text"
              id="title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <div className="flex items-center mb-4">
            <label htmlFor="description" className="mr-2">
              Description:
            </label>
            <input
              type="text"
              id="description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
