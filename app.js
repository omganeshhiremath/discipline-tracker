const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STORAGE_KEY = "discipline_habit_tasks_v1";

// Default starter tasks on first launch (user can edit/delete/add up to any number)
const DEFAULT_TASKS = [
  { id: "t1", name: "Daily 30 min Exercise", checks: [true, true, true, false, true, true, false] },
  { id: "t2", name: "Read 20 Pages", checks: [true, true, false, true, true, false, false] },
  { id: "t3", name: "Drink 3L Water", checks: [true, true, true, true, true, true, true] },
  { id: "t4", name: "No Junk Food / Sugar", checks: [false, true, true, true, false, true, false] },
  { id: "t5", name: "8 Hours Sleep", checks: [true, false, true, true, true, false, true] }
];

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_TASKS;
let lineChartInstance = null;
let barChartInstance = null;

// DOM Elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const habitTableBody = document.getElementById("habitTableBody");
const activitiesList = document.getElementById("activitiesList");
const overallScoreBadge = document.getElementById("overallScoreBadge");
const gradeBadge = document.getElementById("gradeBadge");
const weeklyAnalysisContent = document.getElementById("weeklyAnalysisContent");
const analysisSummaryText = document.getElementById("analysisSummaryText");
const resetWeekBtn = document.getElementById("resetWeekBtn");

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Add Task
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = taskInput.value.trim();
  if (!name) return;

  tasks.push({
    id: "t_" + Date.now(),
    name,
    checks: [false, false, false, false, false, false, false]
  });

  taskInput.value = "";
  saveTasks();
  renderAll();
});

// Reset Week Checkboxes
resetWeekBtn.addEventListener("click", () => {
  if (!confirm("Uncheck all boxes to start a fresh week?")) return;
  tasks = tasks.map((t) => ({ ...t, checks: [false, false, false, false, false, false, false] }));
  saveTasks();
  renderAll();
});

// Toggle Checkbox
function toggleCheck(taskId, dayIndex) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.checks[dayIndex] = !task.checks[dayIndex];
    saveTasks();
    renderAll();
  }
}

// Delete Task
function deleteTask(taskId) {
  tasks = tasks.filter((t) => t.id !== taskId);
  saveTasks();
  renderAll();
}

// Render 7-Day Table
function renderTable() {
  habitTableBody.innerHTML = "";

  if (tasks.length === 0) {
    habitTableBody.innerHTML = `<tr><td colspan="10" style="color:#9494a0; padding:20px;">No tasks yet. Add your first daily task above!</td></tr>`;
    return;
  }

  tasks.forEach((task) => {
    const completedCount = task.checks.filter(Boolean).length;
    const tr = document.createElement("tr");

    let checkboxesHTML = "";
    for (let i = 0; i < 7; i++) {
      checkboxesHTML += `
        <td>
          <input
            type="checkbox"
            class="day-checkbox"
            ${task.checks[i] ? "checked" : ""}
            onchange="toggleCheck('${task.id}', ${i})"
          />
        </td>
      `;
    }

    tr.innerHTML = `
      <td class="task-col">${escapeHTML(task.name)}</td>
      ${checkboxesHTML}
      <td class="row-total">${completedCount}/7</td>
      <td><button class="delete-btn" onclick="deleteTask('${task.id}')" title="Delete task">×</button></td>
    `;
    habitTableBody.appendChild(tr);
  });
}

// Render Activities Progress Bars
function renderActivities() {
  activitiesList.innerHTML = "";
  tasks.forEach((task) => {
    const count = task.checks.filter(Boolean).length;
    const pct = Math.round((count / 7) * 100);

    const item = document.createElement("div");
    item.innerHTML = `
      <div class="activity-item-header">
        <span>${escapeHTML(task.name)}</span>
        <span class="muted">${count}/7 days (${pct}%)</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${pct}%"></div>
      </div>
    `;
    activitiesList.appendChild(item);
  });
}

// Render Charts (Line/Area + Bar)
function renderCharts(dailyCounts, dailyPercentages) {
  const maxTasks = Math.max(tasks.length, 1);

  // 1. Line/Area Graph
  const lineCtx = document.getElementById("weeklyLineChart").getContext("2d");
  if (lineChartInstance) lineChartInstance.destroy();

  lineChartInstance = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: DAYS,
      datasets: [
        {
          label: "Completed Tasks",
          data: dailyCounts,
          borderColor: "#ff5238",
          backgroundColor: "rgba(255, 82, 56, 0.22)",
          borderWidth: 2.5,
          pointBackgroundColor: "#ff5238",
          pointRadius: 4,
          tension: 0.3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: maxTasks,
          ticks: { stepSize: 1, color: "#9494a0" },
          grid: { color: "#2a2a32" }
        },
        x: {
          ticks: { color: "#9494a0" },
          grid: { color: "#2a2a32" }
        }
      }
    }
  });

  // 2. Bar Graph
  const barCtx = document.getElementById("dailyBarChart").getContext("2d");
  if (barChartInstance) barChartInstance.destroy();

  barChartInstance = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: DAYS,
      datasets: [
        {
          label: "Completion %",
          data: dailyPercentages,
          backgroundColor: "#ff5238",
          borderRadius: 6,
          barPercentage: 0.55
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: "#9494a0", callback: (v) => v + "%" },
          grid: { color: "#2a2a32" }
        },
        x: {
          ticks: { color: "#9494a0" },
          grid: { display: false }
        }
      }
    }
  });
}

// Render Automated Weekly Analysis
function renderAnalysis(dailyCounts) {
  const totalTasks = tasks.length;
  const totalPossible = totalTasks * 7;
  const totalCompleted = dailyCounts.reduce((a, b) => a + b, 0);
  const overallPct = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  overallScoreBadge.textContent = `${totalCompleted} / ${totalPossible} Done`;

  if (totalTasks === 0) {
    gradeBadge.textContent = "Grade: --";
    weeklyAnalysisContent.innerHTML = "";
    analysisSummaryText.textContent = "Add tasks above to generate your weekly analysis.";
    return;
  }

  // Best & Weakest Day
  let bestDayIdx = 0;
  let worstDayIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (dailyCounts[i] > dailyCounts[bestDayIdx]) bestDayIdx = i;
    if (dailyCounts[i] < dailyCounts[worstDayIdx]) worstDayIdx = i;
  }

  // Most & Least Consistent Habit
  const sortedTasks = [...tasks].sort(
    (a, b) => b.checks.filter(Boolean).length - a.checks.filter(Boolean).length
  );
  const topHabit = sortedTasks[0];
  const weakHabit = sortedTasks[sortedTasks.length - 1];

  // Performance Grade
  let grade = "D";
  if (overallPct >= 90) grade = "S (Elite)";
  else if (overallPct >= 80) grade = "A (Strong)";
  else if (overallPct >= 65) grade = "B (Solid)";
  else if (overallPct >= 50) grade = "C (Average)";
  gradeBadge.textContent = `Grade: ${grade}`;

  weeklyAnalysisContent.innerHTML = `
    <div class="stat-box">
      <div class="stat-label">Weekly Score</div>
      <div class="stat-value">${overallPct}% (${totalCompleted}/${totalPossible})</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Strongest Day</div>
      <div class="stat-value">${DAYS[bestDayIdx]} (${dailyCounts[bestDayIdx]}/${totalTasks})</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Lowest Day</div>
      <div class="stat-value">${DAYS[worstDayIdx]} (${dailyCounts[worstDayIdx]}/${totalTasks})</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Top Habit</div>
      <div class="stat-value">${escapeHTML(topHabit.name)} (${topHabit.checks.filter(Boolean).length}/7)</div>
    </div>
  `;

  // Actionable Summary
  const firstHalf = dailyCounts.slice(0, 3).reduce((a, b) => a + b, 0);
  const secondHalf = dailyCounts.slice(4, 7).reduce((a, b) => a + b, 0);
  const trendNote =
    secondHalf > firstHalf
      ? "Your momentum improved toward the end of the week."
      : secondHalf < firstHalf
      ? "Your consistency dipped late in the week—focus on finishing Thu–Sat strong."
      : "Your pace stayed steady across the week.";

  analysisSummaryText.textContent = `You completed ${overallPct}% of your scheduled tasks this week. "${topHabit.name}" was your strongest habit, while "${weakHabit.name}" (${weakHabit.checks.filter(Boolean).length}/7 days) needs extra focus next week. ${trendNote}`;
}

function renderAll() {
  const dailyCounts = DAYS.map((_, dayIdx) =>
    tasks.reduce((sum, task) => sum + (task.checks[dayIdx] ? 1 : 0), 0)
  );
  const dailyPercentages = dailyCounts.map((count) =>
    tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0
  );

  renderTable();
  renderActivities();
  renderCharts(dailyCounts, dailyPercentages);
  renderAnalysis(dailyCounts);
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

// Register Service Worker for Offline & APK Support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

renderAll();