// ==========================================
// GET HTML ELEMENTS
// ==========================================

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");

const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");

const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const pendingEmpty = document.getElementById("pendingEmpty");
const completedEmpty = document.getElementById("completedEmpty");


// ==========================================
// LOAD TASKS FROM LOCAL STORAGE
// ==========================================

let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
} catch (error) {
    tasks = [];
}


// ==========================================
// SAVE TASKS
// ==========================================

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// ==========================================
// ADD TASK
// ==========================================

function addTask() {

    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task.");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString(),
        completedAt: null
    };

    tasks.push(newTask);

    saveTasks();

    taskInput.value = "";

    renderTasks();

    taskInput.focus();
}


// Add task when button is clicked
addTaskBtn.addEventListener("click", addTask);


// Add task when Enter is pressed
taskInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        addTask();
    }

});


// ==========================================
// DISPLAY TASKS
// ==========================================

function renderTasks() {

    // Clear both lists first
    pendingList.innerHTML = "";
    completedList.innerHTML = "";


    // Get pending tasks
    const pendingTasks = tasks.filter(function (task) {
        return task.completed === false;
    });


    // Get completed tasks
    const completedTasks = tasks.filter(function (task) {
        return task.completed === true;
    });


    // Display pending tasks
    pendingTasks.forEach(function (task) {

        const taskElement = createTaskElement(task);

        pendingList.appendChild(taskElement);

    });


    // Display completed tasks
    completedTasks.forEach(function (task) {

        const taskElement = createTaskElement(task);

        completedList.appendChild(taskElement);

    });


    // Update task counts
    pendingCount.textContent =
        pendingTasks.length + " pending";

    completedCount.textContent =
        completedTasks.length + " completed";


    // Show or hide empty messages
    if (pendingTasks.length === 0) {
        pendingEmpty.style.display = "block";
    } else {
        pendingEmpty.style.display = "none";
    }


    if (completedTasks.length === 0) {
        completedEmpty.style.display = "block";
    } else {
        completedEmpty.style.display = "none";
    }
}


// ==========================================
// CREATE TASK
// ==========================================

function createTaskElement(task) {

    const li = document.createElement("li");

    li.className = "task-item";


    // Add completed class
    if (task.completed) {
        li.classList.add("completed");
    }


    // ======================================
    // TASK INFORMATION
    // ======================================

    const taskInfo = document.createElement("div");

    taskInfo.className = "task-info";


    const taskText = document.createElement("div");

    taskText.className = "task-text";

    taskText.textContent = task.text;


    const taskTime = document.createElement("span");

    taskTime.className = "task-time";


    if (task.completed && task.completedAt) {

        taskTime.textContent ="Added: " + task.createdAt +
            " | Completed: " + task.completedAt;

    } else {

        taskTime.textContent =
            "Added: " + task.createdAt;

    }


    taskInfo.appendChild(taskText);

    taskInfo.appendChild(taskTime);


    // ======================================
    // BUTTON CONTAINER
    // ======================================

    const actions = document.createElement("div");

    actions.className = "task-actions";


    // ======================================
    // COMPLETE BUTTON
    // ======================================

    const completeBtn = document.createElement("button");

    completeBtn.className = "complete-btn";

    if (task.completed) {
        completeBtn.textContent = "Undo";
    } else {
        completeBtn.textContent = "Mark Complete";
    }


    completeBtn.addEventListener("click", function () {

        toggleComplete(task.id);

    });


    // ======================================
    // EDIT BUTTON
    // ======================================

    const editBtn = document.createElement("button");

    editBtn.className = "edit-btn";

    editBtn.textContent = "Edit";


    editBtn.addEventListener("click", function () {

        startEditing(task, li);

    });


    // ======================================
    // DELETE BUTTON
    // ======================================

    const deleteBtn = document.createElement("button");

    deleteBtn.className = "delete-btn";

    deleteBtn.textContent = "Delete";


    deleteBtn.addEventListener("click", function () {

        deleteTask(task.id);

    });


    // Add buttons to actions
    actions.appendChild(completeBtn);

    actions.appendChild(editBtn);

    actions.appendChild(deleteBtn);


    // Add everything to the task
    li.appendChild(taskInfo);

    li.appendChild(actions);


    return li;
}


// ==========================================
// MARK TASK COMPLETE / UNDO
// ==========================================

function toggleComplete(taskId) {

    const task = tasks.find(function (task) {

        return task.id === taskId;

    });


    if (!task) {
        return;
    }


    // Change completed status
    task.completed = !task.completed;


    // Add or remove completion time
    if (task.completed) {

        task.completedAt =
            new Date().toLocaleString();

    } else {

        task.completedAt = null;

    }


    saveTasks();

    renderTasks();
}


// ==========================================
// EDIT TASK
// ==========================================

function startEditing(task, li) {

    const taskInfo =
        li.querySelector(".task-info");

    const taskText =
        li.querySelector(".task-text");


    // Create an input field
    const input =
        document.createElement("input");

    input.type = "text";

    input.className = "edit-input";

    input.value = task.text;


    // Replace task text with input
    taskInfo.replaceChild(input, taskText);


    // Get buttons container
    const actions =
        li.querySelector(".task-actions");


    // Remove old buttons
    actions.innerHTML = "";


    // ======================================
    // SAVE BUTTON
    // ======================================

    const saveBtn =
        document.createElement("button");

    saveBtn.className = "save-btn";

    saveBtn.textContent = "Save";


    saveBtn.addEventListener("click", function () {

        saveEdit(task, input);

    });


    // ======================================
    // CANCEL BUTTON
    // ======================================

    const cancelBtn =
        document.createElement("button");

    cancelBtn.className = "cancel-btn";

    cancelBtn.textContent = "Cancel";


    cancelBtn.addEventListener("click", function () {

        renderTasks();

    });


    // Add Save and Cancel buttons
    actions.appendChild(saveBtn);

    actions.appendChild(cancelBtn);


    // Focus on input
    input.focus();

    input.select();


    // Press Enter to save
    input.addEventListener("keydown", function (event) {if (event.key === "Enter") {

            saveEdit(task, input);

        }


        // Press Escape to cancel
        if (event.key === "Escape") {

            renderTasks();

        }

    });
}


// ==========================================
// SAVE EDITED TASK
// ==========================================

function saveEdit(task, input) {

    const newText =
        input.value.trim();


    if (newText === "") {

        alert("Task cannot be empty.");

        input.focus();

        return;
    }


    // Update task
    task.text = newText;


    // Save to localStorage
    saveTasks();


    // Display updated task
    renderTasks();
}


// ==========================================
// DELETE TASK
// ==========================================

function deleteTask(taskId) {

    const task =
        tasks.find(function (task) {

            return task.id === taskId;

        });


    if (!task) {
        return;
    }


    // Ask user for confirmation
    const confirmation =
        confirm("Delete \"" + task.text + "\"?");


    if (!confirmation) {
        return;
    }


    // Remove task
    tasks = tasks.filter(function (task) {

        return task.id !== taskId;

    });


    saveTasks();

    renderTasks();
}


// ==========================================
// DISPLAY TASKS WHEN PAGE LOADS
// ==========================================

renderTasks();