const STORAGE_KEY = "taskflow_tasks";

function getElement(id) {
  return document.getElementById(id);
}

function getAllTasks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveAllTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// theme
function setTheme(mode) {
  document.body.dataset.theme = mode;
  document.body.classList.toggle("dark", mode === "dark");
  localStorage.setItem("theme", mode);
}

function loadSavedTheme() {
  setTheme(localStorage.getItem("theme") || "light");
}

const themeButton = getElement("theme");

themeButton?.addEventListener("click", () => {
  const currentTheme = document.body.dataset.theme;
  setTheme(currentTheme === "dark" ? "light" : "dark");
});

// sidebar
const sidebar = document.querySelector(".sidebar");
const overlay = document.querySelector(".overlay");
const menuButton = getElement("hamburger");

menuButton?.addEventListener("click", () => {
  sidebar?.classList.toggle("active");
  overlay?.classList.toggle("active");
});

overlay?.addEventListener("click", () => {
  sidebar?.classList.remove("active");
  overlay?.classList.remove("active");
});

function updateTaskStats() {
  const tasks = getAllTasks();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  if (getElement("totalTasks")) {
    getElement("totalTasks").textContent = totalTasks;
  }

  if (getElement("completedTasks")) {
    getElement("completedTasks").textContent = completedTasks;
  }

  if (getElement("pendingTasks")) {
    getElement("pendingTasks").textContent = pendingTasks;
  }

  if (getElement("completionRate")) {
    getElement("completionRate").textContent = completionRate + "%";
  }
}

// modal
const taskModal = getElement("taskModal");
const taskForm = getElement("modalForm");

getElement("openModal")?.addEventListener("click", () =>
  taskModal?.classList.add("active"),
);

getElement("closeModal")?.addEventListener("click", () =>
  taskModal?.classList.remove("active"),
);

getElement("modalOverlay")?.addEventListener("click", () =>
  taskModal?.classList.remove("active"),
);

const taskContainer = getElement("taskGrid");

function showTasks(tasks = getAllTasks()) {
  if (!taskContainer) return;

  taskContainer.innerHTML = "";

  tasks.forEach((task, index) => {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";

    taskCard.dataset.id = index;
    taskCard.dataset.status = task.status;
    taskCard.dataset.category = task.category;

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const desc = document.createElement("p");
    desc.className = "task-desc";
    desc.textContent = task.description || "";

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.innerHTML = `
    <span class="badge ${task.category}">${task.category}</span>
    <span class="status ${task.status}">${task.status}</span>
  `;

    const buttons = document.createElement("div");
    buttons.className = "task-actions";

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "Done";
    doneBtn.dataset.action = "complete";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.dataset.action = "delete";

    buttons.append(doneBtn, deleteBtn);

    taskCard.append(title, desc, meta, buttons);
    taskContainer.append(taskCard);
  });

  updateTaskStats();
}

// add task
taskForm?.addEventListener("submit", function (e) {
  e.preventDefault();

  const titleInput = getElement("modalTitle");
  const categoryInput = getElement("modalCategory");
  const descInput = getElement("modalDesc");

  const title = titleInput?.value.trim();
  const category = categoryInput?.value;
  const description = descInput?.value || "";

  if (!title || !category) {
    alert("Please fill required fields");
    return;
  }

  const tasks = getAllTasks();

  tasks.unshift({
    title,
    category,
    description,
    status: "pending",
  });

  saveAllTasks(tasks);

  taskForm.reset();
  taskModal?.classList.remove("active");

  showTasks();
  showRecentTasks();
});

// event
taskContainer?.addEventListener("click", (e) => {
  const clickedButton = e.target.closest("button");
  if (!clickedButton) return;

  const taskCard = clickedButton.closest(".task-card");
  const taskId = Number(taskCard.dataset.id);

  const tasks = getAllTasks();

  if (clickedButton.dataset.action === "delete") {
    tasks.splice(taskId, 1);
  }

  if (clickedButton.dataset.action === "complete") {
    tasks[taskId].status =
      tasks[taskId].status === "completed" ? "pending" : "completed";
  }

  saveAllTasks(tasks);
  showTasks();
});

// filter
const searchBox = getElement("searchTask");
const categoryBox = getElement("filterCategory");

function filterTasks() {
  const searchText = searchBox?.value.toLowerCase() || "";
  const selectedCategory = categoryBox?.value || "all";

  const tasks = getAllTasks();

  const filteredTasks = tasks.filter((task) => {
    return (
      task.title.toLowerCase().includes(searchText) &&
      (selectedCategory === "all" || task.category === selectedCategory)
    );
  });

  showTasks(filteredTasks);
}

searchBox?.addEventListener("input", filterTasks);
categoryBox?.addEventListener("change", filterTasks);

const taskTitleInput = getElement("modalTitle");

if (taskTitleInput) {
  taskTitleInput.setAttribute("placeholder", "Enter Task Title");

  console.log(taskTitleInput.value);
  console.log(taskTitleInput.getAttribute("value"));
}

// recent task - dashboard page ke liye
const recentContainer = document.getElementById("recentTasks");

function showRecentTasks() {
  if (!recentContainer) return;

  const tasks = getAllTasks().slice(0, 3); // 👈 only 3 latest tasks

  recentContainer.innerHTML = "";

  tasks.forEach((task, index) => {
    const card = document.createElement("div");
    card.className = "task-card";

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const desc = document.createElement("p");
    desc.className = "task-desc";
    desc.textContent = task.description || "";

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.innerHTML = `
      <span class="badge ${task.category}">${task.category}</span>
      <span class="status ${task.status}">${task.status}</span>
    `;

    card.append(title, desc, meta);
    recentContainer.appendChild(card);
  });
}

// prapogation demo
function initEventDemo() {
  const grandparent = getElement("grandparentBox");
  const parent = getElement("parentBox");
  const child = getElement("childBox");

  if (!grandparent || !parent || !child) return;

  let isCaptureMode = false;
  let eventType = "click";

  const logBox = getElement("logList");
  const logCounter = getElement("logCount");

  let count = 0;

  function addLog(name) {
    const item = document.createElement("div");
    item.className = "log-item";
    item.textContent = name;

    logBox?.prepend(item);

    count++;
    if (logCounter) logCounter.textContent = count;
  }

  function attachEvents() {
    const g = getElement("grandparentBox");
    const p = getElement("parentBox");
    const c = getElement("childBox");

    if (!g || !p || !c) return;

    g.replaceWith(g.cloneNode(true));
    p.replaceWith(p.cloneNode(true));
    c.replaceWith(c.cloneNode(true));

    const newG = getElement("grandparentBox");
    const newP = getElement("parentBox");
    const newC = getElement("childBox");

    newG.addEventListener(
      eventType,
      () => addLog("Grandparent"),
      isCaptureMode,
    );
    newP.addEventListener(eventType, () => addLog("Parent"), isCaptureMode);
    newC.addEventListener(eventType, () => addLog("Child"), isCaptureMode);
  }

  function setActiveButton(type) {
    const bubbleBtn = getElement("bubbleBtn");
    const captureBtn = getElement("captureBtn");

    if (!bubbleBtn || !captureBtn) return;

    if (type === "bubble") {
      bubbleBtn.classList.add("active");
      captureBtn.classList.remove("active");
    } else {
      captureBtn.classList.add("active");
      bubbleBtn.classList.remove("active");
    }
  }

  getElement("bubbleBtn")?.addEventListener("click", () => {
    isCaptureMode = false;
    setActiveButton("bubble");
    attachEvents();
  });

  getElement("captureBtn")?.addEventListener("click", () => {
    isCaptureMode = true;
    setActiveButton("capture");
    attachEvents();
  });

  getElement("eventType")?.addEventListener("change", (e) => {
    eventType = e.target.value;
    attachEvents();
  });

  getElement("clearLog")?.addEventListener("click", () => {
    if (logBox) logBox.innerHTML = "";
    count = 0;
    if (logCounter) logCounter.textContent = 0;
  });

  attachEvents();
}

// all task delete
const delAllBtn = getElement("delAll");

delAllBtn?.addEventListener("click", () => {
  const confirmDelete = confirm("Are you sure you want to delete all tasks?");

  if (!confirm("Delete ALL tasks permanently? This cannot be undone.")) return;
  localStorage.removeItem(STORAGE_KEY);

  showTasks();
  updateTaskStats();

  const recentContainer = document.getElementById("recentTasks");
  if (recentContainer) recentContainer.innerHTML = "";
});

document.addEventListener("DOMContentLoaded", () => {
  loadSavedTheme();
  showTasks();
  showRecentTasks();
  updateTaskStats();
  initEventDemo();
});
