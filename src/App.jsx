import React, { useState, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { IoEllipsisVertical } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { invoke } from "@tauri-apps/api/tauri";
import { confirm } from "@tauri-apps/api/dialog";
import { message } from "@tauri-apps/api/dialog";
import "./App.css";
import Todos from "./components/Todos";

function App() {
  const [openMenu, setOpenMenu] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [pageName, setPageName] = useState("Untitled");
  const [pages, setPages] = useState([]);
  const [openPageOptions, setOpenPageOptions] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [editPageName, setEditPageName] = useState("");
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [selectedPage, setSelectedPage] = useState(pages[0]);

  useEffect(() => {
    async function fetchPages() {
      const response = await invoke("list_pages");
      setPages(response);
      setSelectedPage(response[0]);
    }

    fetchPages();
  }, [openAdd]);
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    if (windowSize.width < 500 || windowSize.height < 600) {
      message("Window size warning", {
        title: "Warning",
        message: "Window size is too small.",
        type: "warning",
      });
    }
  }, [windowSize]);

  const tailwingBgColors = [
    "bg-red-300",
    "bg-blue-300",
    "bg-green-400",
    "bg-yellow-300",
    "bg-indigo-400",
    "bg-purple-300",
    "bg-pink-300",
  ];

  function getRandomColor(colors) {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

  const togglePageOptions = (pageId) => {
    setOpenPageOptions((prevOpenPage) =>
      prevOpenPage === pageId ? null : pageId
    );
  };

  async function handleDeletePage(pageId) {
    try {
      const confirmed2 = await confirm(
        "This action cannot be reverted. Are you sure?",
        { title: "StarBoard", type: "warning" }
      );
      if (confirmed2) {
        const userConfirmed = await invoke("delete_page", { pageId: pageId });
        console.log("Page deleted successfully");
        const updatedPages = await invoke("list_pages");
        setPages(updatedPages);
      } else {
        await message("Deletion canceled by user", { title: "StarBoard" });
        console.log("Deletion canceled by user");
      }
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  }

  async function handleEditPage(pageId) {
    try {
      setEditMode(pageId);
      const page = pages.find((p) => p.id === pageId);
      if (page) {
        setEditPageName(page.name);
      }
    } catch (error) {
      console.error("Error editing page:", error);
    }
  }

  async function handleSaveEditPage(pageId) {
    try {
      const confirmed = await confirm(
        "Are you sure you want to save the changes?",
        { title: "StarBoard", type: "info" }
      );

      if (confirmed) {
        const response = await invoke("edit_page_name", {
          id: pageId,
          newName: editPageName,
        });
        setEditMode(null);
        setEditPageName("");
        const updatedPages = await invoke("list_pages");
        console.log("Updated pages:", updatedPages);
        setPages(updatedPages);
      } else {
        setEditMode(null);
        setEditPageName("");
        const updatedPages = await invoke("list_pages");
        setPages(updatedPages);
        await message("Process Failed", { title: "StarBoard" });
      }
    } catch (error) {
      console.error("Error editing page name:", error);
    }
  }

  async function handleAddPage() {
    console.log("Adding page");
    setOpenAdd(!openAdd);
    try {
      const randomColor = getRandomColor(tailwingBgColors);
      const response = await invoke("add_page", {
        name: pageName,
        bgColor: randomColor,
      });
      console.log(response);
    } catch (error) {
      console.error("Error adding page:", error);
    }
    console.log("Adding page");
  }

  async function handleDefault() {
    if (editMode === true) {
      setEditMode(null);
    }
    if (openPageOptions !== null) {
      setOpenPageOptions(null);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="lg:w-1/4 w-full bg-[#F6F7FA] min-h-[100vh] max-h-auto flex flex-col justify-start items-center" onClick={handleDefault}>
        <div className="w-3/4 flex items-center justify-center p-2 border-2 border-blue-100 bg-white rounded-xl gap-4 mt-2">
          <div className="h-16 w-16 rounded-lg bg-blue-500  flex items-center justify-center">
            <img src="https://lh3.googleusercontent.com/ogw/AF2bZyiEuS8xKb-rgAKW7ilqBkws3_laIY5RY5LI8FKyrg=s32-c-mo" alt="" className="h-14 w-14 rounded-lg" />
          </div>
          <div className="flex flex-col justify-normal">
            <h1 className="text-lg lg:text-xl font-mono">Joel Jaison</h1>
            <p className="text-sm lg:text-base font-light">
              joeljaison@gmail.com
            </p>
          </div>
        </div>
        <div className="w-10/12 h-auto flex flex-col justify-start items-center">
          <div
            className="flex p-2 items-center justify-around w-full cursor-pointer transition-all duration-300 ease-in-out"
            onClick={() => {
              setOpenMenu(!openMenu);
            }}
          >
            <p className="text-lg lg:text-xl text-slate-500 hover:text-black">
              My pages
            </p>
            {openMenu ? (
              <IoIosArrowDown className="text-slate-500 transition-transform duration-300 ease-in-out" />
            ) : (
              <IoIosArrowDown className="text-slate-500 transition-transform duration-300 ease-in-out transform rotate-180" />
            )}
          </div>
          {openMenu && (
            <div className="w-full flex flex-col gap-3 justify-start items-center ">
              <div
                className="w-full lg:w-10/12 h-12 border-b-2 rounded-b-lg border-slate-100 flex items-center justify-start py-1 shadow-md px-4 hover:bg-white hover:cursor-pointer"
                onClick={handleAddPage}
              >
                <p className="text-lg lg:text-xl text-slate-600">Add </p>
                <IoMdAdd />
              </div>
              {pages.map((page) => (
                <div
                  className={`w-full h-14 border-slate-300 rounded-md border-2 flex items-center justify-around py-1 px-4 text-white hover:bg-white hover:text-black ${page.bg_color} hover:cursor-pointer relative`}
                  key={page.id}
                  onClick={() => {setSelectedPage(page)}}
                >
                  {editMode === page.id ? (
                    <>
                      <input
                        type="text"
                        className="p-2 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder={page.name}
                        onChange={(e) => {
                          setEditPageName(e.target.value);
                        }}
                      />
                      <div
                        className="p-2"
                        onClick={() => {
                          handleSaveEditPage(page.id);
                        }}
                      >
                        <FaSave />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-lg ">{page.name}</p>
                      <div
                        className="p-2"
                        onClick={() => togglePageOptions(page.id)}
                      >
                        <IoEllipsisVertical />
                      </div>
                    </>
                  )}

                  {openPageOptions === page.id && (
                    <div className="w-40 lg:w-28 h-32 bg-white rounded-lg shadow-md flex gap-3 flex-col items-center justify-center absolute z-40 -bottom-20 -right-20 border-2 border-slate-200">
                      <p
                        className="text-lg text-white px-4 py-2 bg-blue-400 rounded-md"
                        onClick={() => {
                          handleEditPage(page.id);
                        }}
                      >
                        Edit
                      </p>
                      <p
                        className="text-lg px-4 py-2 bg-red-400 rounded-md text-white"
                        onClick={() => {
                          handleDeletePage(page.id);
                        }}
                      >
                        Delete
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:w-3/4 w-full h-10 min-h-[100vh]">
        <Todos page={selectedPage} />
      </div>
    </div>
  );
}

export default App;
