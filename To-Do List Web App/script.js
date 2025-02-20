// On page load, render tasks, history, and apply saved theme
document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
  renderHistory();

  // Listen for form submission (Add Task button at the end of the form)
  document.getElementById("addTaskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    addTask();
  });
  document.getElementById("sortTasks").addEventListener("change", renderTasks);
  document.getElementById("searchInput").addEventListener("keyup", filterTasks);
  document.getElementById("clearTasksBtn").addEventListener("click", clearTasks);
  document.getElementById("toggleHistoryBtn").addEventListener("click", toggleHistory);
  document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);
  document.getElementById("toggleThemeBtn").addEventListener("click", toggleTheme);

  // Load saved theme (default dark)
  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
  }
});

function addTask() {
  const taskText = document.getElementById("taskInput").value.trim();
  const dueDate = document.getElementById("dueDate").value;
  const priority = document.getElementById("priority").value;
  if (!taskText) return;

  const task = {
    text: taskText,
    dueDate: dueDate || "No Due Date",
    priority: priority
  };

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  document.getElementById("addTaskForm").reset();
  renderTasks();
}

function renderTasks() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const sortBy = document.getElementById("sortTasks").value;

  // Sort tasks based on criteria
  if (sortBy === "date") {
    tasks.sort((a, b) => {
      if (a.dueDate === "No Due Date") return 1;
      if (b.dueDate === "No Due Date") return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  } else if (sortBy === "priority") {
    const order = { High: 1, Medium: 2, Low: 3 };
    tasks.sort((a, b) => order[a.priority] - order[b.priority]);
  } else if (sortBy === "name") {
    tasks.sort((a, b) => a.text.localeCompare(b.text));
  }

  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    // Highlight overdue tasks if due date exists and is past
    if (task.dueDate !== "No Due Date" && new Date(task.dueDate) < new Date()) {
      li.classList.add("overdue");
    }
    li.innerHTML = `
      <span class="checkbox" onclick="completeTask(${index})">☐</span>
      <span class="task-text">📝 ${task.text} | 📅 ${task.dueDate} | ${getPriorityEmoji(task.priority)} ${task.priority}</span>
      <div class="btn-group">
        <button onclick="editTask(${index})">✏️ Edit</button>
        <button onclick="deleteTask(${index})">❌ Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
  filterTasks();
}

function getPriorityEmoji(priority) {
  if (priority === "High") return "🔴";
  if (priority === "Medium") return "🟡";
  if (priority === "Low") return "🟢";
  return "";
}

function editTask(index) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const newText = prompt("✏️ Edit Task", tasks[index].text);
  if (newText !== null && newText.trim() !== "") {
    tasks[index].text = newText.trim();
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
  }
}

function completeTask(index) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let history = JSON.parse(localStorage.getItem("history")) || [];
  history.push(tasks[index]);
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("history", JSON.stringify(history));
  renderTasks();
  renderHistory();
}

function deleteTask(index) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  if (confirm("❓ Are you sure you want to delete this task?")) {
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
  }
}

function clearTasks() {
  if (confirm("❓ Clear all active tasks?")) {
    localStorage.removeItem("tasks");
    renderTasks();
  }
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";
  history.forEach((task, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="checkbox done">☑</span>
      <span class="task-text">📝 ${task.text} | 📅 ${task.dueDate} | ${getPriorityEmoji(task.priority)} ${task.priority} <strong>[Done]</strong></span>
      <div class="btn-group">
        <button onclick="revertTask(${index})">↩️ Revert</button>
        <button onclick="deleteHistoryTask(${index})">❌ Delete</button>
      </div>
    `;
    historyList.appendChild(li);
  });
}

function revertTask(index) {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(history[index]);
  history.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("history", JSON.stringify(history));
  renderTasks();
  renderHistory();
}

function deleteHistoryTask(index) {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  if (confirm("❓ Delete this history task?")) {
    history.splice(index, 1);
    localStorage.setItem("history", JSON.stringify(history));
    renderHistory();
  }
}

function clearHistory() {
  if (confirm("❓ Clear all task history?")) {
    localStorage.removeItem("history");
    renderHistory();
  }
}

function toggleHistory() {
  const historySection = document.getElementById("historySection");
  const toggleBtn = document.getElementById("toggleHistoryBtn");
  if (historySection.classList.contains("hidden")) {
    historySection.classList.remove("hidden");
    toggleBtn.textContent = "📜 Hide Task History";
  } else {
    historySection.classList.add("hidden");
    toggleBtn.textContent = "📜 Show Task History";
  }
}

function filterTasks() {
  const filter = document.getElementById("searchInput").value.toLowerCase();
  const listItems = document.querySelectorAll("#taskList li");
  listItems.forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(filter) ? "" : "none";
  });
}

function toggleTheme() {
  document.body.classList.toggle("light-theme");
  if (document.body.classList.contains("light-theme")) {
    localStorage.setItem("theme", "light");
  } else {
    localStorage.setItem("theme", "dark");
  }
}
