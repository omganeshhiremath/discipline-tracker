const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STORAGE_KEY = "discipline_tasks_v2";
const STREAK_KEY = "discipline_login_streak_v1";

const MOTIVATIONAL_QUOTES = [
  "You are not weak. Work harder.",
  "Discipline is choosing between what you want now and what you want most.",
  "Nobody cares. Work harder.",
  "Pain is temporary. Pride is forever.",
  "Don't stop when you're tired. Stop when you're done.",
  "Your future self is watching you right now through memories.",
  "Excuses don't build empires. Consistency does.",
  "Outwork everyone who doubted you.",
  "Small daily wins create unstoppable momentum.",
  "Master your habits or your habits will master you."
];

const DEFAULT_TASKS = [
  { id: "t1", name: "Daily 30 min Exercise", checks: [true, true, false, false, false, false, false] },
  { id: "t2", name: "Read 20 Pages", checks: [true, false, false, false, false, false, false] },
  { id: "t3", name: "Drink 3L Water", checks: [true, true, false, false, false, false, false] }
];

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_TASKS;
let chartMode = "pct"; // "pct" or "count"
let modernChartInstance = null;
let quoteOffset = 0;

// Hide "Download APK" bar when opened inside the installed Android APK
function detectStandaloneApp() {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true ||
    document.referrer.includes("android-app://");

  const webBar = document.getElementById("webDownloadBar");
  if (isStandalone && webBar) {
    webBar.style.display = "none";
  }
}

// ==========================================
// 1. SNAPCHAT-STYLE STREAK (12:01 AM ROLLOVER)
// ==========================================
function getStreakDayString(dateObj = new Date()) {
  // Subtract 1 minute so 12:00 AM belongs to the previous day and 12:01 AM starts the new day
  const shifted = new Date(dateObj.getTime() - 60 * 1000);
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, "0");
  const d = String(shifted.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDayDifference(prevDateStr, currDateStr) {
  const [py, pm, pd] = prevDateStr.split("-").map(Number);
  const [cy, cm, cd] = currDateStr.split("-").map(Number);
  const prevUtc = Date.UTC(py, pm - 1, pd);
  const currUtc = Date.UTC(cy, cm - 1, cd);
  return Math.round((currUtc - prevUtc) / (1000 * 60 * 60 * 24));
}

function updateDailyStreakAndQuote() {
  const todayKey = getStreakDayString();
  let streakData = JSON.parse(localStorage.getItem(STREAK_KEY));

  if (!streakData || !streakData.lastDate) {
    streakData = { count: 1, lastDate: todayKey };
  } else {
    const diff = getDayDifference(streakData.lastDate, todayKey);
    if (diff === 1) {
      // Logged in on consecutive day after 12:01 AM -> Streak +1
      streakData.count += 1;
      streakData.lastDate = todayKey;
    } else if (diff > 1) {
      // Missed one or more days -> Reset to 1
      streakData.count = 1;
      streakData.lastDate = todayKey;
    }
  }

  localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
  document.getElementById("streakCount").textContent = streakData.count;

  // Pick daily quote deterministically from the 12:01 AM day index
  const [y, m, d] = todayKey.split("-").map(Number);
  const dayNumber = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  const quoteIdx = (dayNumber + quoteOffset) % MOTIVATIONAL_QUOTES.length;
  document.getElementById("dailyQuoteText").textContent = `"${MOTIVATIONAL_QUOTES[quoteIdx]}"`;
}

document.getElementById("nextQuoteBtn").addEventListener("click", () => {
  quoteOffset += 1;
  updateDailyStreakAndQuote();
});

// Check every 15 seconds in case user has app open across 12:01 AM
setInterval(updateDailyStreakAndQuote, 15000);

// ==========================================
// 2. TASK MANAGEMENT (ADD, CHECK, REMOVE)
// ==========================================
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

document.getElementById("taskForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("taskInput");
  const name = input.value.trim();
  if (!name) return;

  tasks.push({
    id: "t_" + Date.now(),
    name,
    checks: [false, false, false, false, false, false, false]
  });

  input.value = "";
  saveTasks();
  renderAll();
});

document.getElementById("resetWeekBtn").addEventListener("click", () => {
  if (!confirm("Uncheck all boxes to start a new week?")) return;
  tasks = tasks.map((t) => ({ ...t, checks: [false, false, false, false, false, false, false] }));
  saveTasks();
  renderAll();
});

function toggleCheck(taskId, dayIndex) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.checks[dayIndex] = !task.checks[dayIndex];
    saveTasks();
    renderAll();
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter((t) => t.id !== taskId);
  saveTasks();
  renderAll();
}

function renderHabitCards() {
  const container = document.getElementById("habitCardsList");
  container.innerHTML = "";

  if (tasks.length === 0) {
    container.innerHTML = `<p class="muted" style="text-align:center; padding:18px 0;">No tasks yet. Add your first daily goal above!</p>`;
    return;
  }

  tasks.forEach((task) => {
    const doneCount = task.checks.filter(Boolean).length;
    const card = document.createElement("div");
    card.className = "habit-item-card";

    let daysHTML = "";
    for (let i = 0; i < 7; i++) {
      daysHTML += `
        <label class="day-cell">
          <span class="day-label">${DAYS[i]}</span>
          <input
            type="checkbox"
            class="day-box"
            ${task.checks[i] ? "checked" : ""}
            onchange="toggleCheck('${task.id}', ${i})"
          />
        </label>
      `;
    }

    card.innerHTML = `
      <div class="habit-item-top">
        <span class="habit-title">${escapeHTML(task.name)}</span>
        <div class="habit-controls">
          <span class="habit-score-tag">${doneCount}/7</span>
          <button type="button" class="btn-delete-task" onclick="deleteTask('${task.id}')" title="Remove task">🗑️</button>
        </div>
      </div>
      <div class="days-grid-7">
        ${daysHTML}
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// 3. MAXIMIZED MODERN AREA GRAPH
// ==========================================
document.getElementById("modePctBtn").addEventListener("click", () => {
  chartMode = "pct";
  document.getElementById("modePctBtn").classList.add("active");
  document.getElementById("modeCountBtn").classList.remove("active");
  document.getElementById("graphSubtitle").textContent = "Daily completion percentage";
  renderAll();
});

document.getElementById("modeCountBtn").addEventListener("click", () => {
  chartMode = "count";
  document.getElementById("modeCountBtn").classList.add("active");
  document.getElementById("modePctBtn").classList.remove("active");
  document.getElementById("graphSubtitle").textContent = "Tasks completed per day";
  renderAll();
});

function renderModernGraph(dailyCounts, dailyPercentages) {
  const ctx = document.getElementById("modernWeeklyChart").getContext("2d");
  if (modernChartInstance) modernChartInstance.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, "rgba(255, 46, 136, 0.55)");
  gradient.addColorStop(0.55, "rgba(255, 106, 69, 0.22)");
  gradient.addColorStop(1, "rgba(0, 212, 182, 0.0)");

  const isPct = chartMode === "pct";
  const datasetValues = isPct ? dailyPercentages : dailyCounts;
  const yMax = isPct ? 100 : Math.max(tasks.length, 1);

  modernChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: DAYS,
      datasets: [
        {
          label: isPct ? "Completion %" : "Tasks Done",
          data: datasetValues,
          borderColor: "#ffffff",
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.42,
          pointBackgroundColor: "#ff2e88",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(12, 14, 28, 0.92)",
          titleColor: "#9ca3bf",
          bodyColor: "#ffffff",
          borderColor: "rgba(255,255,255,0.18)",
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (ctx) => (isPct ? `${ctx.parsed.y}% Completed` : `${ctx.parsed.y} Tasks Done`)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: yMax,
          ticks: {
            color: "#9ca3bf",
            font: { size: 11, weight: "600" },
            stepSize: isPct ? 25 : 1,
            callback: (val) => (isPct ? val + "%" : val)
          },
          grid: {
            color: "rgba(255, 255, 255, 0.07)",
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: "#ffffff",
            font: { size: 11, weight: "700" }
          },
          grid: { display: false }
        }
      }
    }
  });
}

// ==========================================
// 4. EXACT RANK LEVELS & MOTIVATION LOGIC
// ==========================================
function getRankAndMotivation(pct) {
  // Rank calculation
  let rank = "Noob";
  let emoji = "🪨";
  let nextLabel = "Next: Silver (20%)";

  if (pct === 100) {
    rank = "Untouchable";
    emoji = "👑";
    nextLabel = "MAX RANK ACHIEVED";
  } else if (pct >= 90) {
    rank = "Grand Master";
    emoji = "🔥";
    nextLabel = "Next: Untouchable (100%)";
  } else if (pct > 80) {
    rank = "Elite Master";
    emoji = "⚡";
    nextLabel = "Next: Grand Master (90%)";
  } else if (pct > 75) {
    rank = "Master";
    emoji = "⚔️";
    nextLabel = "Next: Elite Master (81%)";
  } else if (pct > 60) {
    rank = "Diamond";
    emoji = "💎";
    nextLabel = "Next: Master (76%)";
  } else if (pct > 50) {
    rank = "Platinum";
    emoji = "💠";
    nextLabel = "Next: Diamond (61%)";
  } else if (pct >= 40) {
    rank = "Gold";
    emoji = "🥇";
    nextLabel = "Next: Platinum (51%)";
  } else if (pct >= 20) {
    rank = "Silver";
    emoji = "🥈";
    nextLabel = "Next: Gold (40%)";
  } else {
    rank = "Noob";
    emoji = "🛡️";
    nextLabel = "Next: Silver (20%)";
  }

  // Motivational Verdict Message
  let message = "";
  if (pct < 20) {
    message = "You are weak, Comeback!";
  } else if (pct < 50) {
    message = "Try harder!";
  } else if (pct < 75) {
    message = "Little more, come on!";
  } else if (pct <= 90) {
    message = "Fantastic, one more level to reach Grand Master!";
  } else {
    message = "Grand Master level!";
  }

  return { rank, emoji, nextLabel, message };
}

function renderRankAndAnalysis(dailyCounts) {
  const totalTasks = tasks.length;
  const totalPossible = totalTasks * 7;
  const totalCompleted = dailyCounts.reduce((a, b) => a + b, 0);
  const pct = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  document.getElementById("overallScoreBadge").textContent = `${totalCompleted} / ${totalPossible}`;
  document.getElementById("weeklyPctBadge").textContent = `${pct}%`;

  const { rank, emoji, nextLabel, message } = getRankAndMotivation(pct);

  document.getElementById("rankEmoji").textContent = emoji;
  document.getElementById("rankTitle").textContent = `${rank} Level`;
  document.getElementById("motivationVerdict").textContent = message;
  document.getElementById("currentRankLabel").textContent = `${rank} (${pct}%)`;
  document.getElementById("nextRankLabel").textContent = nextLabel;
  document.getElementById("rankProgressFill").style.width = `${pct}%`;

  // Stats Tiles
  const statsGrid = document.getElementById("weeklyStatsGrid");
  if (totalTasks === 0) {
    statsGrid.innerHTML = "";
    document.getElementById("activitiesList").innerHTML = "";
    return;
  }

  let bestIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (dailyCounts[i] > dailyCounts[bestIdx]) bestIdx = i;
  }

  const sortedTasks = [...tasks].sort(
    (a, b) => b.checks.filter(Boolean).length - a.checks.filter(Boolean).length
  );
  const bestHabit = sortedTasks[0];

  statsGrid.innerHTML = `
    <div class="stat-tile">
      <div class="stat-tile-label">Strongest Day</div>
      <div class="stat-tile-val">${DAYS[bestIdx]} (${dailyCounts[bestIdx]}/${totalTasks})</div>
    </div>
    <div class="stat-tile">
      <div class="stat-tile-label">Top Habit</div>
      <div class="stat-tile-val">${escapeHTML(bestHabit.name)}</div>
    </div>
  `;

  // Habit Consistency Bars
  const activitiesList = document.getElementById("activitiesList");
  activitiesList.innerHTML = "";
  tasks.forEach((t) => {
    const done = t.checks.filter(Boolean).length;
    const tPct = Math.round((done / 7) * 100);
    const row = document.createElement("div");
    row.innerHTML = `
      <div class="activity-row-top">
        <span>${escapeHTML(t.name)}</span>
        <span class="muted">${done}/7 (${tPct}%)</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${tPct}%"></div>
      </div>
    `;
    activitiesList.appendChild(row);
  });
}

// Bottom Nav Active Highlight
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    item.classList.add("active");
  });
});

function renderAll() {
  const dailyCounts = DAYS.map((_, dayIdx) =>
    tasks.reduce((sum, task) => sum + (task.checks[dayIdx] ? 1 : 0), 0)
  );
  const dailyPercentages = dailyCounts.map((count) =>
    tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0
  );

  renderHabitCards();
  renderModernGraph(dailyCounts, dailyPercentages);
  renderRankAndAnalysis(dailyCounts);
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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

detectStandaloneApp();
updateDailyStreakAndQuote();
renderAll();