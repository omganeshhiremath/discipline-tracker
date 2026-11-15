const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATE_KEY = "discipline_super_state_v3";

const QUOTES = [
  "You are not weak. Work harder.",
  "Discipline is choosing between what you want now and what you want most.",
  "Nobody cares. Work harder.",
  "Pain is temporary. Pride is forever.",
  "Don't stop when you're tired. Stop when you're done.",
  "Your future self is watching you right now through memories.",
  "Excuses don't build empires. Consistency does.",
  "Outwork everyone who doubted you.",
  "Small daily wins create unstoppable momentum.",
  "Master your habits or your habits will master you.",
  "Suffer the pain of discipline or suffer the pain of regret.",
  "Every rep, every page, every hour builds your empire."
];

const BADGES_CATALOG = [
  { id: "first_step", icon: "⚡", name: "First Blood", desc: "Complete your first habit" },
  { id: "streak_7", icon: "🔥", name: "7-Day Fire", desc: "Reach a 7-day login streak" },
  { id: "streak_30", icon: "☄️", name: "30-Day Titan", desc: "Reach a 30-day login streak" },
  { id: "perfect_week", icon: "👑", name: "Untouchable", desc: "Score 100% in a week" },
  { id: "tasks_100", icon: "💯", name: "Centurion", desc: "Complete 100 total checks" },
  { id: "todo_10", icon: "📝", name: "Task Slayer", desc: "Finish 10 To-Do items" },
  { id: "focus_1", icon: "⏱️", name: "Deep Focus", desc: "Finish a Focus Timer" },
  { id: "grand_master", icon: "🐉", name: "Grand Master", desc: "Reach 90%+ weekly rank" }
];

// ==========================================
// 1. DATE & 12:01 AM ROLLOVER UTILITIES
// ==========================================
function getRolledDate(dateObj = new Date()) {
  // Shifts clock back 1 minute so 12:01 AM starts the new streak/day
  return new Date(dateObj.getTime() - 60 * 1000);
}

function getDayKey(dateObj = new Date()) {
  const d = getRolledDate(dateObj);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekStartKey(offsetWeeks = 0) {
  const d = getRolledDate();
  d.setDate(d.getDate() - d.getDay() + offsetWeeks * 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMonthKey() {
  const d = getRolledDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function dayDiff(prevStr, currStr) {
  const [py, pm, pd] = prevStr.split("-").map(Number);
  const [cy, cm, cd] = currStr.split("-").map(Number);
  return Math.round((Date.UTC(cy, cm - 1, cd) - Date.UTC(py, pm - 1, pd)) / 86400000);
}

// ==========================================
// 2. STATE INITIALIZATION & V2 MIGRATION
// ==========================================
function loadInitialState() {
  const saved = JSON.parse(localStorage.getItem(STATE_KEY));
  if (saved) return saved;

  // Migrate tasks & streak from v2 if user already used the previous version
  const oldTasks = JSON.parse(localStorage.getItem("discipline_tasks_v2")) || [
    { id: "t1", name: "Daily 30 min Exercise", checks: [true, true, false, false, false, false, false] },
    { id: "t2", name: "Read 20 Pages", checks: [true, false, false, false, false, false, false] },
    { id: "t3", name: "Drink 8 Glasses Water", checks: [true, true, false, false, false, false, false] }
  ];
  const oldStreak = JSON.parse(localStorage.getItem("discipline_login_streak_v1")) || { count: 1, lastDate: getDayKey() };

  const currentWeek = getWeekStartKey(0);
  const migratedHabits = oldTasks.map((t, idx) => ({
    id: t.id || "h_" + Date.now() + idx,
    name: t.name,
    category: idx === 0 ? "Fitness" : idx === 1 ? "Study" : "Health",
    type: t.name.toLowerCase().includes("8 glasses") ? "qty" : "check",
    qtyTarget: 8,
    priority: idx === 0,
    note: "",
    timerMins: idx === 1 ? 25 : 0,
    reminderTime: "",
    activeDays: [true, true, true, true, true, true, true],
    archived: false,
    weekLogs: {
      [currentWeek]: Array.isArray(t.checks) ? [...t.checks] : [false, false, false, false, false, false, false]
    },
    qtyLogs: {}
  }));

  return {
    userName: "Warrior",
    theme: "aurora",
    accent: "pink",
    xp: 40,
    totalChecksEver: 5,
    todosCompletedEver: 0,
    timersCompletedEver: 0,
    lastCelebratedRank: "Noob",
    streak: {
      count: oldStreak.count || 1,
      longest: oldStreak.count || 1,
      lastDate: oldStreak.lastDate || getDayKey(),
      freezesLeft: 1,
      freezeMonth: getMonthKey()
    },
    habits: migratedHabits,
    todos: [
      { id: "td_1", text: "Computer Class work" }
    ],
    completedTodosToday: [],
    dailyHistory: {}, // { "YYYY-MM-DD": pct }
    friends: [
      { name: "Arjun (Rival)", pct: 84, streak: 12 },
      { name: "Vikram (Rival)", pct: 68, streak: 6 }
    ],
    reminderTime: "20:00",
    notificationsEnabled: false
  };
}

let state = loadInitialState();
let weekOffset = 0; // 0 = current week, -1 = last week, etc.
let chartMode = "pct";
let weeklyChart = null;
let quoteOffset = 0;
let lastDeletedTodo = null;
let activeTimer = { habitId: null, totalSec: 0, remainingSec: 0, interval: null, running: false };

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

// ==========================================
// 3. SYNTHESIZED SOUND EFFECTS & CONFETTI
// ==========================================
function playTone(type = "check") {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "check") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "fanfare") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.1);
      osc.frequency.setValueAtTime(659, now + 0.2);
      osc.frequency.setValueAtTime(880, now + 0.3);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.56);
    }
  } catch (_) {}
}

function launchConfetti(count = 65) {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#ff2e88", "#ff6a45", "#00d4b6", "#ffbe3b", "#8b5cf6", "#ffffff"];
  const pieces = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 120,
    w: 7 + Math.random() * 6,
    h: 5 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: 3 + Math.random() * 4.5,
    rot: Math.random() * 360
  }));

  let frames = 0;
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += 6;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frames++;
    if (frames < 110) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(tick);
}

function showToast(msg, withUndo = false) {
  const bar = document.getElementById("toastBar");
  const text = document.getElementById("toastMessage");
  const undoBtn = document.getElementById("toastUndoBtn");
  text.textContent = msg;
  undoBtn.classList.toggle("hidden", !withUndo);
  bar.classList.remove("hidden");
  clearTimeout(bar._timer);
  bar._timer = setTimeout(() => bar.classList.add("hidden"), 3500);
}

// ==========================================
// 4. STANDALONE APP DETECTION & THEME ENGINE
// ==========================================
function applyEnvironmentAndTheme() {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true ||
    document.referrer.includes("android-app://");

  if (isStandalone) {
    document.getElementById("websiteShowcase").classList.add("hidden");
  }

  document.documentElement.setAttribute("data-theme", state.theme || "aurora");
  document.documentElement.setAttribute("data-accent", state.accent || "pink");
  document.getElementById("userNameInput").value = state.userName || "Warrior";
  document.getElementById("dailyReminderTimeInput").value = state.reminderTime || "20:00";
}

// ==========================================
// 5. 12:01 AM STREAK ENGINE, FREEZE & QUOTES
// ==========================================
function syncStreakAndClock() {
  const todayKey = getDayKey();
  const monthKey = getMonthKey();

  // Replenish 1 monthly Streak Freeze at start of a new month
  if (state.streak.freezeMonth !== monthKey) {
    state.streak.freezeMonth = monthKey;
    state.streak.freezesLeft = 1;
  }

  const diff = dayDiff(state.streak.lastDate, todayKey);
  if (diff === 1) {
    state.streak.count += 1;
    state.streak.lastDate = todayKey;
    if (state.streak.count > state.streak.longest) {
      state.streak.longest = state.streak.count;
    }
    showToast(`🔥 Streak increased to ${state.streak.count} days!`);
  } else if (diff > 1) {
    if (diff === 2 && state.streak.freezesLeft > 0) {
      // Automatically consume Streak Freeze to save a 1-day miss
      state.streak.freezesLeft -= 1;
      state.streak.lastDate = todayKey;
      showToast("❄️ Monthly Streak Freeze saved your streak!");
    } else {
      state.streak.count = 1;
      state.streak.lastDate = todayKey;
    }
  }

  saveState();

  document.getElementById("streakCount").textContent = state.streak.count;
  document.getElementById("freezeCountChip").textContent = `❄️${state.streak.freezesLeft}`;
  document.getElementById("longestStreakStat").textContent = state.streak.longest;
  document.getElementById("freezeVaultStat").textContent = state.streak.freezesLeft;

  // Daily Quote based on rolled day index
  const [y, m, d] = todayKey.split("-").map(Number);
  const dayNum = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  const qIdx = (dayNum + quoteOffset) % QUOTES.length;
  document.getElementById("dailyQuoteText").textContent = `"${QUOTES[qIdx]}"`;

  // Live countdown to 12:01 AM rollover
  const now = new Date();
  const nextRollover = new Date(now);
  nextRollover.setHours(24, 1, 0, 0);
  const minsLeft = Math.max(1, Math.floor((nextRollover - now) / 60000));
  const hrs = Math.floor(minsLeft / 60);
  const mins = minsLeft % 60;
  document.getElementById("resetCountdownText").textContent = `Next rollover in ${hrs}h ${mins}m (12:01 AM)`;
}

// ==========================================
// 6. XP & RPG LEVEL SYSTEM
// ==========================================
function awardXP(amount) {
  state.xp = Math.max(0, (state.xp || 0) + amount);
  saveState();
  renderXPBar();
}

function renderXPBar() {
  const xp = state.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const remainder = xp % 100;
  const titles = ["Initiate", "Apprentice", "Focused", "Relentless", "Warrior", "Juggernaut", "Legend"];
  const title = titles[Math.min(titles.length - 1, Math.floor((level - 1) / 2))];

  document.getElementById("rpgLevelBadge").textContent = `LVL ${level}`;
  document.getElementById("xpLevelTitle").textContent = `Level ${level} • ${title}`;
  document.getElementById("xpNumericText").textContent = `${remainder} / 100 XP`;
  document.getElementById("xpProgressFill").style.width = `${remainder}%`;
}

// ==========================================
// 7. HABIT MANAGEMENT & WEIGHTED SCORING
// ==========================================
function ensureWeekLog(habit, wkKey) {
  if (!habit.weekLogs) habit.weekLogs = {};
  if (!habit.weekLogs[wkKey]) {
    habit.weekLogs[wkKey] = [false, false, false, false, false, false, false];
  }
  if (!habit.qtyLogs) habit.qtyLogs = {};
  if (!habit.qtyLogs[wkKey]) {
    habit.qtyLogs[wkKey] = [0, 0, 0, 0, 0, 0, 0];
  }
}

function computeWeekMetrics(wkKey) {
  const activeHabits = state.habits.filter((h) => !h.archived);
  const dailyWeightedEarned = [0, 0, 0, 0, 0, 0, 0];
  const dailyWeightedPossible = [0, 0, 0, 0, 0, 0, 0];
  const dailyRawDone = [0, 0, 0, 0, 0, 0, 0];

  activeHabits.forEach((h) => {
    ensureWeekLog(h, wkKey);
    const weight = h.priority ? 2 : 1;
    for (let d = 0; d < 7; d++) {
      if (h.activeDays[d]) {
        dailyWeightedPossible[d] += weight;
        if (h.weekLogs[wkKey][d]) {
          dailyWeightedEarned[d] += weight;
          dailyRawDone[d] += 1;
        }
      }
    }
  });

  const dailyPercentages = dailyWeightedPossible.map((poss, idx) =>
    poss > 0 ? Math.round((dailyWeightedEarned[idx] / poss) * 100) : 0
  );

  const totalEarned = dailyWeightedEarned.reduce((a, b) => a + b, 0);
  const totalPossible = dailyWeightedPossible.reduce((a, b) => a + b, 0);
  const overallPct = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

  return {
    activeHabits,
    dailyWeightedEarned,
    dailyWeightedPossible,
    dailyRawDone,
    dailyPercentages,
    totalEarned,
    totalPossible,
    overallPct
  };
}

function toggleHabitCheck(habitId, dayIdx) {
  const wkKey = getWeekStartKey(weekOffset);
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit || !habit.activeDays[dayIdx]) return;

  ensureWeekLog(habit, wkKey);
  const nextVal = !habit.weekLogs[wkKey][dayIdx];
  habit.weekLogs[wkKey][dayIdx] = nextVal;

  if (habit.type === "qty") {
    habit.qtyLogs[wkKey][dayIdx] = nextVal ? habit.qtyTarget : 0;
  }

  if (nextVal) {
    const xpGain = habit.priority ? 20 : 10;
    state.totalChecksEver = (state.totalChecksEver || 0) + 1;
    awardXP(xpGain);
    playTone("check");
    showToast(`+${xpGain} XP Earned!`);
  } else {
    awardXP(habit.priority ? -20 : -10);
  }

  // Record today's score into dailyHistory for the GitHub heatmap
  const todayRolled = getRolledDate();
  const todayDayIdx = todayRolled.getDay();
  if (weekOffset === 0 && dayIdx === todayDayIdx) {
    const m = computeWeekMetrics(wkKey);
    state.dailyHistory[getDayKey()] = m.dailyPercentages[todayDayIdx];
    if (m.dailyPercentages[todayDayIdx] === 100 && m.dailyWeightedPossible[todayDayIdx] > 0) {
      launchConfetti(55);
      playTone("fanfare");
      showToast("🔥 100% Daily Discipline Completed!");
    }
  }

  saveState();
  renderAll();
}

function stepHabitQuantity(habitId, dayIdx, delta) {
  const wkKey = getWeekStartKey(weekOffset);
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;
  ensureWeekLog(habit, wkKey);

  const curr = habit.qtyLogs[wkKey][dayIdx] || 0;
  const next = Math.max(0, Math.min(habit.qtyTarget, curr + delta));
  habit.qtyLogs[wkKey][dayIdx] = next;

  const wasDone = habit.weekLogs[wkKey][dayIdx];
  const isNowDone = next >= habit.qtyTarget;
  if (wasDone !== isNowDone) {
    toggleHabitCheck(habitId, dayIdx);
  } else {
    saveState();
    renderAll();
  }
}

function moveHabitOrder(habitId, dir) {
  const idx = state.habits.findIndex((h) => h.id === habitId);
  const targetIdx = idx + dir;
  if (idx < 0 || targetIdx < 0 || targetIdx >= state.habits.length) return;
  const temp = state.habits[idx];
  state.habits[idx] = state.habits[targetIdx];
  state.habits[targetIdx] = temp;
  saveState();
  renderAll();
}

function archiveHabit(habitId) {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;
  habit.archived = true;
  saveState();
  showToast(`Archived "${habit.name}" (history preserved)`);
  renderAll();
}

function restoreHabit(habitId) {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;
  habit.archived = false;
  saveState();
  renderAll();
}

function deleteHabitForever(habitId) {
  state.habits = state.habits.filter((h) => h.id !== habitId);
  saveState();
  renderAll();
}

function renderHabitCards() {
  const wkKey = getWeekStartKey(weekOffset);
  const todayDayIdx = getRolledDate().getDay();
  const container = document.getElementById("habitCardsList");
  const activeHabits = state.habits.filter((h) => !h.archived);

  container.innerHTML = "";
  if (activeHabits.length === 0) {
    container.innerHTML = `<p class="muted" style="text-align:center; padding:18px 0;">No active habits. Add your first goal above!</p>`;
    return;
  }

  activeHabits.forEach((h) => {
    ensureWeekLog(h, wkKey);
    const activeCount = h.activeDays.filter(Boolean).length;
    const doneCount = h.weekLogs[wkKey].filter((val, idx) => val && h.activeDays[idx]).length;

    const card = document.createElement("div");
    card.className = `habit-item-card ${h.priority ? "priority-card" : ""}`;

    let daysHTML = "";
    for (let i = 0; i < 7; i++) {
      const isOff = !h.activeDays[i];
      daysHTML += `
        <label class="day-cell ${isOff ? "off-day" : ""}">
          <span class="day-label">${DAYS[i]}</span>
          <input
            type="checkbox"
            class="day-box"
            ${h.weekLogs[wkKey][i] ? "checked" : ""}
            ${isOff ? "disabled" : ""}
            onchange="toggleHabitCheck('${h.id}', ${i})"
          />
        </label>
      `;
    }

    let qtyHTML = "";
    if (h.type === "qty") {
      const targetDay = weekOffset === 0 ? todayDayIdx : 0;
      const currQty = h.qtyLogs[wkKey][targetDay] || 0;
      qtyHTML = `
        <div class="qty-control-bar">
          <span>${DAYS[targetDay]} Counter: <strong>${currQty} / ${h.qtyTarget}</strong></span>
          <div class="qty-btns">
            <button type="button" class="qty-step-btn" onclick="stepHabitQuantity('${h.id}', ${targetDay}, -1)">−</button>
            <button type="button" class="qty-step-btn" onclick="stepHabitQuantity('${h.id}', ${targetDay}, 1)">+</button>
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="habit-item-top">
        <div>
          <div class="habit-meta-tags">
            <span class="cat-tag cat-${h.category}">${h.category}</span>
            ${h.priority ? `<span class="priority-star-tag">★ 2X MUST-DO</span>` : ""}
            ${h.reminderTime ? `<span class="muted">⏰ ${h.reminderTime}</span>` : ""}
          </div>
          <div class="habit-title">${escapeHTML(h.name)}</div>
          ${h.note ? `<div class="habit-note-text">📌 ${escapeHTML(h.note)}</div>` : ""}
        </div>

        <div class="habit-action-bar">
          <span class="habit-score-tag">${doneCount}/${activeCount}</span>
          ${h.timerMins > 0 ? `<button type="button" class="mini-action-btn" onclick="openTimerModal('${h.id}')" title="Start ${h.timerMins}m Focus Timer">⏱️</button>` : ""}
          <button type="button" class="mini-action-btn" onclick="moveHabitOrder('${h.id}', -1)" title="Move Up">↑</button>
          <button type="button" class="mini-action-btn" onclick="archiveHabit('${h.id}')" title="Archive / Remove">🗑️</button>
        </div>
      </div>
      ${qtyHTML}
      <div class="days-grid-7">${daysHTML}</div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// 8. NUMBERED TO-DO LIST (TICK TO COMPLETE & REMOVE)
// ==========================================
document.getElementById("todoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("todoInput");
  const text = input.value.trim();
  if (!text) return;

  state.todos.push({ id: "td_" + Date.now(), text });
  input.value = "";
  saveState();
  renderTodos();
});

function completeTodoItem(todoId) {
  const idx = state.todos.findIndex((t) => t.id === todoId);
  if (idx === -1) return;

  const rowEl = document.getElementById(`todo-row-${todoId}`);
  if (rowEl) rowEl.classList.add("completing");

  const [removed] = state.todos.splice(idx, 1);
  lastDeletedTodo = removed;
  state.completedTodosToday.unshift({ text: removed.text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
  state.todosCompletedEver = (state.todosCompletedEver || 0) + 1;

  awardXP(15);
  playTone("check");
  saveState();

  setTimeout(() => {
    renderTodos();
    renderBadges();
    showToast(`✓ Completed "${removed.text}" (+15 XP)`, true);
  }, 320);
}

document.getElementById("toastUndoBtn").addEventListener("click", () => {
  if (!lastDeletedTodo) return;
  state.todos.push(lastDeletedTodo);
  state.completedTodosToday.shift();
  lastDeletedTodo = null;
  awardXP(-15);
  saveState();
  renderTodos();
  document.getElementById("toastBar").classList.add("hidden");
});

document.getElementById("clearCompletedTodosBtn").addEventListener("click", () => {
  state.completedTodosToday = [];
  saveState();
  renderTodos();
});

function renderTodos() {
  const listEl = document.getElementById("todoListContainer");
  document.getElementById("todoCountBadge").textContent = `${state.todos.length} Pending`;
  document.getElementById("todoCompletedCount").textContent = state.completedTodosToday.length;

  listEl.innerHTML = "";
  if (state.todos.length === 0) {
    listEl.innerHTML = `<p class="muted" style="text-align:center; padding:18px 0;">All To-Do tasks cleared! Add a new task above.</p>`;
  } else {
    state.todos.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "todo-row-card";
      row.id = `todo-row-${item.id}`;
      row.innerHTML = `
        <div class="todo-left">
          <span class="todo-number">${index + 1}.</span>
          <span class="todo-text">${escapeHTML(item.text)}</span>
        </div>
        <input
          type="checkbox"
          class="todo-checkbox"
          title="Mark complete and remove"
          onchange="completeTodoItem('${item.id}')"
        />
      `;
      listEl.appendChild(row);
    });
  }

  const completedEl = document.getElementById("completedTodoList");
  completedEl.innerHTML = state.completedTodosToday
    .slice(0, 8)
    .map((c) => `<div class="completed-todo-item">✓ ${escapeHTML(c.text)} (${c.time})</div>`)
    .join("");
}

// ==========================================
// 9. MAXIMIZED GRAPH, WEEK HISTORY & HEATMAP
// ==========================================
function renderGraphAndInsights(metrics) {
  const ctx = document.getElementById("modernWeeklyChart").getContext("2d");
  if (weeklyChart) weeklyChart.destroy();

  const accentHex = getComputedStyle(document.documentElement).getPropertyValue("--accent-1").trim() || "#ff2e88";
  const gradient = ctx.createLinearGradient(0, 0, 0, 275);
  gradient.addColorStop(0, accentHex + "88");
  gradient.addColorStop(1, "rgba(0, 212, 182, 0.0)");

  const isPct = chartMode === "pct";
  const dataPoints = isPct ? metrics.dailyPercentages : metrics.dailyRawDone;

  weeklyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: DAYS,
      datasets: [
        {
          data: dataPoints,
          borderColor: accentHex,
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: accentHex,
          pointBorderWidth: 2.5,
          pointRadius: 5
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
          suggestedMax: isPct ? 100 : Math.max(metrics.activeHabits.length, 1),
          ticks: {
            color: "#9aa2c0",
            stepSize: isPct ? 25 : 1,
            callback: (v) => (isPct ? v + "%" : v)
          },
          grid: { color: "rgba(255,255,255,0.07)" }
        },
        x: {
          ticks: { color: "#9aa2c0", font: { weight: "700" } },
          grid: { display: false }
        }
      }
    }
  });

  // Week Navigator Labels & Comparison vs Previous Week
  const wkKey = getWeekStartKey(weekOffset);
  const prevWkKey = getWeekStartKey(weekOffset - 1);
  const prevMetrics = computeWeekMetrics(prevWkKey);
  const delta = metrics.overallPct - prevMetrics.overallPct;

  document.getElementById("viewedWeekTitle").textContent =
    weekOffset === 0 ? "This Week" : weekOffset === -1 ? "Last Week" : `Week of ${wkKey}`;
  document.getElementById("nextWeekBtn").disabled = weekOffset >= 0;

  const deltaEl = document.getElementById("weekVsLastBadge");
  if (prevMetrics.totalPossible === 0) {
    deltaEl.textContent = `Score: ${metrics.overallPct}%`;
  } else {
    const arrow = delta >= 0 ? `↑ +${delta}%` : `↓ ${delta}%`;
    deltaEl.textContent = `${arrow} vs previous week`;
  }

  // Best & Worst Day Insights
  let bestIdx = 0;
  let worstIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (metrics.dailyPercentages[i] > metrics.dailyPercentages[bestIdx]) bestIdx = i;
    if (metrics.dailyPercentages[i] < metrics.dailyPercentages[worstIdx]) worstIdx = i;
  }

  document.getElementById("dayInsightsGrid").innerHTML = `
    <div class="insight-card">
      <span class="muted">🔥 Peak Day</span>
      <strong>${DAYS[bestIdx]} (${metrics.dailyPercentages[bestIdx]}%)</strong>
    </div>
    <div class="insight-card">
      <span class="muted">⚠️ Weakest Day</span>
      <strong>${DAYS[worstIdx]} (${metrics.dailyPercentages[worstIdx]}%)</strong>
    </div>
  `;
}

function renderHeatmap() {
  const grid = document.getElementById("activityHeatmapGrid");
  grid.innerHTML = "";
  const today = getRolledDate();

  // Render 84 days (12 weeks) ending today
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const pct = state.dailyHistory[key] || 0;

    let lvl = 0;
    if (pct >= 90) lvl = 4;
    else if (pct >= 65) lvl = 3;
    else if (pct >= 35) lvl = 2;
    else if (pct > 0) lvl = 1;

    const cell = document.createElement("div");
    cell.className = `hm-cell lvl-${lvl}`;
    cell.title = `${key}: ${pct}%`;
    grid.appendChild(cell);
  }
}

// ==========================================
// 10. RANK LEVELS, CHALLENGES, BADGES & LEADERBOARD
// ==========================================
function evaluateRank(pct) {
  let rank = "Noob";
  let emoji = "🛡️";
  let nextLabel = "Next: Silver (20%)";

  if (pct === 100) {
    rank = "Untouchable";
    emoji = "👑";
    nextLabel = "MAXIMUM RANK ACHIEVED";
  } else if (pct >= 90) {
    rank = "Grand Master";
    emoji = "🐉";
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
  }

  let message = "";
  if (pct < 20) message = "You are weak, Comeback!";
  else if (pct < 50) message = "Try harder!";
  else if (pct < 75) message = "Little more, come on!";
  else if (pct <= 90) message = "Fantastic, one more level to reach Grand Master!";
  else message = "Grand Master level!";

  return { rank, emoji, nextLabel, message };
}

function renderBadges(overallPct) {
  const unlockedSet = new Set();
  if ((state.totalChecksEver || 0) >= 1) unlockedSet.add("first_step");
  if ((state.streak.longest || 0) >= 7) unlockedSet.add("streak_7");
  if ((state.streak.longest || 0) >= 30) unlockedSet.add("streak_30");
  if (overallPct === 100) unlockedSet.add("perfect_week");
  if ((state.totalChecksEver || 0) >= 100) unlockedSet.add("tasks_100");
  if ((state.todosCompletedEver || 0) >= 10) unlockedSet.add("todo_10");
  if ((state.timersCompletedEver || 0) >= 1) unlockedSet.add("focus_1");
  if (overallPct >= 90) unlockedSet.add("grand_master");

  document.getElementById("unlockedBadgesCount").textContent = unlockedSet.size;
  const grid = document.getElementById("badgesGrid");
  grid.innerHTML = BADGES_CATALOG.map(
    (b) => `
      <div class="badge-tile ${unlockedSet.has(b.id) ? "unlocked" : ""}" title="${b.desc}">
        <span class="badge-tile-icon">${b.icon}</span>
        <span class="badge-tile-name">${b.name}</span>
      </div>
    `
  ).join("");
}

function renderRankTab(metrics) {
  const pct = metrics.overallPct;
  const { rank, emoji, nextLabel, message } = evaluateRank(pct);

  document.getElementById("weeklyPctBadge").textContent = `${pct}%`;
  document.getElementById("rankEmoji").textContent = emoji;
  document.getElementById("rankTitle").textContent = `${rank} Level`;
  document.getElementById("motivationVerdict").textContent = message;
  document.getElementById("currentRankLabel").textContent = `${rank} (${pct}%)`;
  document.getElementById("nextRankLabel").textContent = nextLabel;
  document.getElementById("rankProgressFill").style.width = `${pct}%`;

  // Trigger Full-Screen Rank-Up Celebration when advancing to a higher division
  const rankOrder = ["Noob", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite Master", "Grand Master", "Untouchable"];
  if (weekOffset === 0 && rankOrder.indexOf(rank) > rankOrder.indexOf(state.lastCelebratedRank)) {
    state.lastCelebratedRank = rank;
    saveState();
    document.getElementById("rankUpIcon").textContent = emoji;
    document.getElementById("rankUpNewTitle").textContent = `${rank} Level`;
    document.getElementById("rankUpSubtitle").textContent = message;
    document.getElementById("rankUpModal").classList.remove("hidden");
    launchConfetti(110);
    playTone("fanfare");
  }

  // Weekly Challenges
  const perfectDays = metrics.dailyPercentages.filter((p) => p === 100).length;
  const challenges = [
    { name: "Hit 90%+ Grand Master Score", curr: Math.min(pct, 90), target: 90, unit: "%" },
    { name: "Achieve 3 Perfect 100% Days", curr: Math.min(perfectDays, 3), target: 3, unit: " days" }
  ];
  document.getElementById("weeklyChallengesList").innerHTML = challenges
    .map((c) => {
      const barPct = Math.round((c.curr / c.target) * 100);
      return `
        <div class="challenge-card">
          <div class="challenge-top">
            <span>${c.name}</span>
            <span>${c.curr}/${c.target}${c.unit}</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${barPct}%"></div></div>
        </div>
      `;
    })
    .join("");

  // Leaderboard (User + Friends/Rivals)
  const board = [
    { name: `${state.userName} (You)`, pct, streak: state.streak.count, isMe: true },
    ...state.friends
  ].sort((a, b) => b.pct - a.pct);

  document.getElementById("leaderboardList").innerHTML = board
    .map(
      (entry, i) => `
        <div class="lb-row ${entry.isMe ? "me-row" : ""}">
          <span><strong>#${i + 1}</strong> ${escapeHTML(entry.name)}</span>
          <span>🔥${entry.streak} • <strong>${entry.pct}%</strong></span>
        </div>
      `
    )
    .join("");

  // Habit Consistency Breakdown
  const wkKey = getWeekStartKey(weekOffset);
  document.getElementById("activitiesList").innerHTML = metrics.activeHabits
    .map((h) => {
      const activeTotal = h.activeDays.filter(Boolean).length;
      const done = h.weekLogs[wkKey].filter((v, idx) => v && h.activeDays[idx]).length;
      const hPct = activeTotal > 0 ? Math.round((done / activeTotal) * 100) : 0;
      return `
        <div>
          <div class="activity-row-top">
            <span>${escapeHTML(h.name)}</span>
            <span class="muted">${done}/${activeTotal} (${hPct}%)</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${hPct}%"></div></div>
        </div>
      `;
    })
    .join("");

  renderBadges(pct);
}

// ==========================================
// 11. FOCUS / POMODORO TIMER MODAL
// ==========================================
function openTimerModal(habitId) {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;
  clearInterval(activeTimer.interval);
  activeTimer = {
    habitId,
    totalSec: (habit.timerMins || 25) * 60,
    remainingSec: (habit.timerMins || 25) * 60,
    interval: null,
    running: false
  };
  document.getElementById("timerTaskTitle").textContent = habit.name;
  document.getElementById("timerStartPauseBtn").textContent = "▶ Start";
  updateTimerDisplay();
  document.getElementById("timerModal").classList.remove("hidden");
}

function updateTimerDisplay() {
  const m = String(Math.floor(activeTimer.remainingSec / 60)).padStart(2, "0");
  const s = String(activeTimer.remainingSec % 60).padStart(2, "0");
  document.getElementById("timerClockDisplay").textContent = `${m}:${s}`;
}

document.getElementById("timerStartPauseBtn").addEventListener("click", () => {
  const btn = document.getElementById("timerStartPauseBtn");
  if (activeTimer.running) {
    clearInterval(activeTimer.interval);
    activeTimer.running = false;
    btn.textContent = "▶ Resume";
  } else {
    activeTimer.running = true;
    btn.textContent = "⏸ Pause";
    activeTimer.interval = setInterval(() => {
      activeTimer.remainingSec -= 1;
      updateTimerDisplay();
      if (activeTimer.remainingSec <= 0) {
        clearInterval(activeTimer.interval);
        activeTimer.running = false;
        state.timersCompletedEver = (state.timersCompletedEver || 0) + 1;
        awardXP(25);
        playTone("fanfare");
        launchConfetti(60);
        document.getElementById("timerModal").classList.add("hidden");

        // Auto-check today's box for this habit
        const todayIdx = getRolledDate().getDay();
        const wkKey = getWeekStartKey(0);
        const h = state.habits.find((item) => item.id === activeTimer.habitId);
        if (h && h.activeDays[todayIdx] && !h.weekLogs[wkKey]?.[todayIdx]) {
          weekOffset = 0;
          toggleHabitCheck(h.id, todayIdx);
        }
        showToast("⏱️ Focus Session Complete! +25 XP");
      }
    }, 1000);
  }
});

document.getElementById("timerResetBtn").addEventListener("click", () => {
  clearInterval(activeTimer.interval);
  activeTimer.running = false;
  activeTimer.remainingSec = activeTimer.totalSec;
  document.getElementById("timerStartPauseBtn").textContent = "▶ Start";
  updateTimerDisplay();
});

document.getElementById("timerCloseBtn").addEventListener("click", () => {
  clearInterval(activeTimer.interval);
  document.getElementById("timerModal").classList.add("hidden");
});

// ==========================================
// 12. SHAREABLE WEEKLY REPORT CARD (PNG)
// ==========================================
document.getElementById("generateReportCardBtn").addEventListener("click", () => {
  const wkKey = getWeekStartKey(weekOffset);
  const metrics = computeWeekMetrics(wkKey);
  const { rank, emoji } = evaluateRank(metrics.overallPct);

  const canvas = document.getElementById("reportCardCanvas");
  const ctx = canvas.getContext("2d");

  // Background Gradient
  const bg = ctx.createLinearGradient(0, 0, 720, 900);
  bg.addColorStop(0, "#14162b");
  bg.addColorStop(0.5, "#2b1238");
  bg.addColorStop(1, "#090a14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 720, 900);

  // Accent Glow Circle
  ctx.fillStyle = "rgba(255, 46, 136, 0.22)";
  ctx.beginPath();
  ctx.arc(360, 320, 210, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DISCIPLINE REPORT CARD", 360, 95);

  ctx.fillStyle = "#9aa2c0";
  ctx.font = "24px sans-serif";
  ctx.fillText(`${state.userName} • Week of ${wkKey}`, 360, 140);

  ctx.font = "120px sans-serif";
  ctx.fillText(emoji, 360, 310);

  ctx.fillStyle = "#ffbe3b";
  ctx.font = "900 54px sans-serif";
  ctx.fillText(`${rank.toUpperCase()} LEVEL`, 360, 405);

  ctx.fillStyle = "#00d4b6";
  ctx.font = "900 96px sans-serif";
  ctx.fillText(`${metrics.overallPct}%`, 360, 525);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px sans-serif";
  ctx.fillText(`🔥 ${state.streak.count}-Day Streak   •   ⚡ Level ${Math.floor((state.xp || 0) / 100) + 1}`, 360, 625);

  ctx.fillStyle = "#9aa2c0";
  ctx.font = "22px sans-serif";
  ctx.fillText("Tracked on Discipline App", 360, 825);

  document.getElementById("reportCardModal").classList.remove("hidden");
});

document.getElementById("downloadReportImageBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `discipline-report-${getDayKey()}.png`;
  link.href = document.getElementById("reportCardCanvas").toDataURL("image/png");
  link.click();
});

document.getElementById("shareReportImageBtn").addEventListener("click", async () => {
  const canvas = document.getElementById("reportCardCanvas");
  canvas.toBlob(async (blob) => {
    const file = new File([blob], "discipline-report.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "My Weekly Discipline Report",
        text: `Check out my weekly Discipline rank and ${state.streak.count}-day streak!`,
        files: [file]
      });
    } else {
      document.getElementById("downloadReportImageBtn").click();
      showToast("Report PNG saved—ready to post on WhatsApp/Instagram!");
    }
  });
});

document.getElementById("closeReportModalBtn").addEventListener("click", () => {
  document.getElementById("reportCardModal").classList.add("hidden");
});

// ==========================================
// 13. SETTINGS, REMINDERS, BACKUP & SYNC CODE
// ==========================================
document.getElementById("openSettingsBtn").addEventListener("click", () => {
  renderArchivedHabits();
  document.getElementById("settingsModal").classList.remove("hidden");
});
document.getElementById("closeSettingsBtn").addEventListener("click", () => {
  document.getElementById("settingsModal").classList.add("hidden");
});

document.getElementById("saveUserNameBtn").addEventListener("click", () => {
  const val = document.getElementById("userNameInput").value.trim();
  if (val) {
    state.userName = val;
    saveState();
    renderAll();
    showToast("Name updated!");
  }
});

document.querySelectorAll(".theme-choice").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.theme = btn.dataset.themeVal;
    saveState();
    applyEnvironmentAndTheme();
  });
});

document.querySelectorAll(".swatch-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.accent = btn.dataset.accentVal;
    saveState();
    applyEnvironmentAndTheme();
    renderAll();
  });
});

document.getElementById("enableNotifBtn").addEventListener("click", async () => {
  state.reminderTime = document.getElementById("dailyReminderTimeInput").value;
  if ("Notification" in window) {
    const perm = await Notification.requestPermission();
    state.notificationsEnabled = perm === "granted";
    document.getElementById("notifStatusText").textContent =
      perm === "granted"
        ? `✅ Alerts active for ${state.reminderTime} & 9:00 PM Streak Protection.`
        : "⚠️ Please allow notifications in your browser/phone settings.";
  }
  saveState();
});

function renderArchivedHabits() {
  const list = document.getElementById("archivedHabitsList");
  const archived = state.habits.filter((h) => h.archived);
  document.getElementById("archivedCountBadge").textContent = archived.length;
  if (archived.length === 0) {
    list.innerHTML = `<span class="muted">No archived habits.</span>`;
    return;
  }
  list.innerHTML = archived
    .map(
      (h) => `
        <div class="archived-row">
          <span>${escapeHTML(h.name)}</span>
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn-ghost-sm" onclick="restoreHabit('${h.id}'); renderArchivedHabits();">Restore</button>
            <button type="button" class="btn-ghost-sm" onclick="deleteHabitForever('${h.id}'); renderArchivedHabits();">Delete</button>
          </div>
        </div>
      `
    )
    .join("");
}

document.getElementById("exportJsonBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `discipline-backup-${getDayKey()}.json`;
  a.click();
});

document.getElementById("importJsonInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (parsed && parsed.habits) {
        state = parsed;
        saveState();
        applyEnvironmentAndTheme();
        renderAll();
        showToast("✅ Backup restored successfully!");
      }
    } catch (_) {
      showToast("❌ Invalid backup file.");
    }
  };
  reader.readAsText(file);
});

document.getElementById("copySyncCodeBtn").addEventListener("click", () => {
  const metrics = computeWeekMetrics(getWeekStartKey(0));
  const payload = btoa(encodeURIComponent(JSON.stringify({ name: state.userName, pct: metrics.overallPct, streak: state.streak.count })));
  navigator.clipboard?.writeText(payload);
  showToast("🔗 Friend/Sync code copied to clipboard!");
});

document.getElementById("loadSyncCodeBtn").addEventListener("click", () => {
  const code = prompt("Paste a Friend's Sync Code to add them to your Leaderboard:");
  if (!code) return;
  try {
    const friend = JSON.parse(decodeURIComponent(atob(code.trim())));
    if (friend && friend.name) {
      state.friends.push({ name: friend.name, pct: friend.pct || 0, streak: friend.streak || 1 });
      saveState();
      renderAll();
      showToast(`Added ${friend.name} to Leaderboard!`);
    }
  } catch (_) {
    showToast("Invalid code.");
  }
});

document.getElementById("addFriendScoreBtn").addEventListener("click", () => {
  document.getElementById("loadSyncCodeBtn").click();
});

// ==========================================
// 14. NAVIGATION, FORM EVENTS & MASTER RENDER
// ==========================================
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-view").forEach((v) => v.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`view-${target}`).classList.add("active");
    if (target === "graph") renderAll();
  });
});

document.getElementById("scrollToAppBtn")?.addEventListener("click", () => {
  document.getElementById("mainAppShell").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("toggleComposerOptsBtn").addEventListener("click", () => {
  document.getElementById("composerAdvanced").classList.toggle("open");
});

document.getElementById("openHabitComposerBtn").addEventListener("click", () => {
  document.getElementById("composerAdvanced").classList.add("open");
  document.getElementById("habitNameInput").focus();
});

document.getElementById("habitTypeInput").addEventListener("change", (e) => {
  document.getElementById("qtyTargetGroup").classList.toggle("hidden", e.target.value !== "qty");
});

document.querySelectorAll("#composerDaysRow .day-pill").forEach((pill) => {
  pill.addEventListener("click", () => pill.classList.toggle("active"));
});

document.getElementById("habitForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("habitNameInput").value.trim();
  if (!name) return;

  const activeDays = Array.from(document.querySelectorAll("#composerDaysRow .day-pill")).map((p) =>
    p.classList.contains("active")
  );
  if (!activeDays.some(Boolean)) activeDays[0] = true;

  const wkKey = getWeekStartKey(weekOffset);
  state.habits.push({
    id: "h_" + Date.now(),
    name,
    category: document.getElementById("habitCategoryInput").value,
    type: document.getElementById("habitTypeInput").value,
    qtyTarget: Math.max(2, Number(document.getElementById("habitQtyTargetInput").value) || 8),
    priority: document.getElementById("habitPriorityInput").checked,
    note: document.getElementById("habitNoteInput").value.trim(),
    timerMins: Math.max(0, Number(document.getElementById("habitTimerInput").value) || 0),
    reminderTime: document.getElementById("habitReminderInput").value,
    activeDays,
    archived: false,
    weekLogs: { [wkKey]: [false, false, false, false, false, false, false] },
    qtyLogs: { [wkKey]: [0, 0, 0, 0, 0, 0, 0] }
  });

  document.getElementById("habitNameInput").value = "";
  document.getElementById("habitNoteInput").value = "";
  saveState();
  renderAll();
  showToast(`Added "${name}"!`);
});

document.getElementById("resetWeekBtn").addEventListener("click", () => {
  if (!confirm("Reset all checkboxes for the currently viewed week?")) return;
  const wkKey = getWeekStartKey(weekOffset);
  state.habits.forEach((h) => {
    h.weekLogs[wkKey] = [false, false, false, false, false, false, false];
    h.qtyLogs[wkKey] = [0, 0, 0, 0, 0, 0, 0];
  });
  saveState();
  renderAll();
});

document.getElementById("openArchiveQuickBtn").addEventListener("click", () => {
  document.getElementById("openSettingsBtn").click();
});

document.getElementById("prevWeekBtn").addEventListener("click", () => {
  weekOffset -= 1;
  renderAll();
});
document.getElementById("nextWeekBtn").addEventListener("click", () => {
  if (weekOffset < 0) weekOffset += 1;
  renderAll();
});

document.getElementById("modePctBtn").addEventListener("click", () => {
  chartMode = "pct";
  document.getElementById("modePctBtn").classList.add("active");
  document.getElementById("modeCountBtn").classList.remove("active");
  document.getElementById("graphSubtitle").textContent = "Daily weighted completion %";
  renderAll();
});
document.getElementById("modeCountBtn").addEventListener("click", () => {
  chartMode = "count";
  document.getElementById("modeCountBtn").classList.add("active");
  document.getElementById("modePctBtn").classList.remove("active");
  document.getElementById("graphSubtitle").textContent = "Tasks completed per day";
  renderAll();
});

document.getElementById("nextQuoteBtn").addEventListener("click", () => {
  quoteOffset += 1;
  syncStreakAndClock();
});
document.getElementById("copyQuoteBtn").addEventListener("click", () => {
  const txt = document.getElementById("dailyQuoteText").textContent;
  navigator.clipboard?.writeText(txt);
  showToast("Quote copied!");
});

document.getElementById("closeRankUpBtn").addEventListener("click", () => {
  document.getElementById("rankUpModal").classList.add("hidden");
});

function renderAll() {
  const wkKey = getWeekStartKey(weekOffset);
  const metrics = computeWeekMetrics(wkKey);
  const todayIdx = getRolledDate().getDay();

  // Update Header & Today's Widget
  const currentWkMetrics = computeWeekMetrics(getWeekStartKey(0));
  const todayScheduled = currentWkMetrics.activeHabits.filter((h) => h.activeDays[todayIdx]).length;
  const todayDone = currentWkMetrics.dailyRawDone[todayIdx];
  const todayPct = currentWkMetrics.dailyPercentages[todayIdx];

  document.getElementById("todayDateLabel").textContent = `TODAY (${DAYS[todayIdx].toUpperCase()})`;
  document.getElementById("todayDoneFraction").textContent = `${todayDone} / ${todayScheduled}`;
  document.getElementById("todayPctPill").textContent = `${todayPct}%`;
  document.getElementById("overallScoreBadge").textContent = `${metrics.totalEarned} / ${metrics.totalPossible} pts`;
  document.getElementById("archivedCountBadge").textContent = state.habits.filter((h) => h.archived).length;

  // 9 PM Streak-in-Danger Alert Check
  const hourNow = new Date().getHours();
  const inDanger = hourNow >= 21 && todayScheduled > 0 && todayDone < todayScheduled;
  document.getElementById("streakDangerBanner").classList.toggle("hidden", !inDanger);

  renderXPBar();
  renderHabitCards();
  renderTodos();
  renderGraphAndInsights(metrics);
  renderHeatmap();
  renderRankTab(metrics);
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
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

applyEnvironmentAndTheme();
syncStreakAndClock();
renderAll();
setInterval(syncStreakAndClock, 20000);