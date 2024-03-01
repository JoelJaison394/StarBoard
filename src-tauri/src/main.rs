use serde::{Serialize, Deserialize};
use std::sync::{Mutex, Arc, RwLock};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Page {
    id: usize,
    name: String,
    bg_color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
enum CompletionStatus {
    Pending,
    StartedWorking,
    Completed,
    NotStarted,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Task {
    id: usize,
    title: String,
    description: String,
    completion_status: CompletionStatus,
    page_id: usize,
}

#[tauri::command]
fn add_page(name: String, bg_color: String, pages: tauri::State<Arc<RwLock<Vec<Page>>>>) -> String {
    let new_page = Page {
        id: {
            let pages = pages.read().expect("Error reading pages");
            pages.len() + 1
        },
        name,
        bg_color,
    };
    pages.write().expect("Error writing to pages").push(new_page);
    println!("Page added successfully" );
    "Page added successfully".to_string()
}

#[tauri::command]
fn list_pages(pages: tauri::State<Arc<RwLock<Vec<Page>>>>) -> Vec<Page> {
    pages.read().unwrap().clone()
}

#[tauri::command]
fn edit_page_name(id: usize, new_name: String, pages: tauri::State<Arc<RwLock<Vec<Page>>>>) -> String {
    let mut pages = pages.write().expect("Error writing to pages");
    println!("Editing page name with ID {}", id);
    if let Some(page) = pages.iter_mut().find(|p| p.id == id) {
        println!("Editing page name with ID {}", id);
        page.name = new_name;
        format!("Page name with ID {} edited successfully", id)
    } else {
        format!("Page with ID {} not found", id)
    }
}


#[tauri::command]
fn delete_page(page_id: usize, pages: tauri::State<Arc<RwLock<Vec<Page>>>>) -> String {
    let mut pages = pages.write().expect("Error writing to pages");
    if let Some(index) = pages.iter().position(|p| p.id == page_id) {
        pages.remove(index);
        format!("Page with ID {} deleted successfully", page_id)
    } else {
        format!("Page with ID {} not found", page_id)
    }
}

#[tauri::command]
fn add_task(title: String, description: String, page_id: usize, tasks: tauri::State<Arc<Mutex<Vec<Task>>>>) -> String {
    let new_task = Task {
        id: {
            let tasks = tasks.lock().expect("Error locking tasks");
            tasks.len() + 1
        },
        title,
        description,
        completion_status: CompletionStatus::NotStarted,
        page_id,
    };
    tasks.lock().expect("Error locking tasks").push(new_task);
    "Task added successfully".to_string()
}

#[tauri::command]
fn list_tasks(page_id: usize, tasks: tauri::State<Arc<Mutex<Vec<Task>>>>) -> Vec<Task> {
    tasks.lock().unwrap().iter().filter(|t| t.page_id == page_id).cloned().collect()
}

#[tauri::command]
fn edit_task(id: usize, new_title: String, new_description: String, tasks: tauri::State<Arc<Mutex<Vec<Task>>>>) {
    let mut tasks = tasks.lock().unwrap();
    if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
        task.title = new_title;
        task.description = new_description;
    }
}

#[tauri::command]
fn change_completion_status(page_id: usize, task_id: usize, status: CompletionStatus, tasks: tauri::State<Arc<Mutex<Vec<Task>>>>) {
    let mut tasks = tasks.lock().unwrap();
    if let Some(task) = tasks.iter_mut().find(|t| t.page_id == page_id && t.id == task_id) {
        task.completion_status = status;
    }
}

#[tauri::command]
fn delete_task(page_id: usize, task_id: usize, tasks: tauri::State<Arc<Mutex<Vec<Task>>>>) -> String {
    let mut tasks = tasks.lock().expect("Error locking tasks");
    if let Some(index) = tasks.iter().position(|t| t.page_id == page_id && t.id == task_id) {
        tasks.remove(index);
        format!("Task with ID {} deleted successfully", task_id)
    } else {
        format!("Task with ID {} not found", task_id)
    }
}


fn main() {
    let pages: Arc<RwLock<Vec<Page>>> = Arc::new(RwLock::new(Vec::new()));
    let tasks: Arc<Mutex<Vec<Task>>> = Arc::new(Mutex::new(Vec::new()));

    tauri::Builder::default()
        .manage(pages)  
        .manage(tasks) 
        .invoke_handler(tauri::generate_handler![
            add_page,
            list_pages,
            add_task,
            list_tasks,
            edit_task,
            delete_page,
            edit_page_name,
            change_completion_status,
            delete_task
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
