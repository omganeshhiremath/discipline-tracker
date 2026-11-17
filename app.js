(() => {
  "use strict";

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const STORAGE_KEY = "discipline_v10_state";
  const FALLBACK_QUOTES = [
    "Discipline is choosing what you want most over what you want now.",
    "You are not weak. Work harder.",
    "Nobody cares. Work harder.",
    "Pain is temporary. Pride is forever.",
    "Don't stop when you're tired. Stop when you're done."
  ];

  const QUOTES =
    Array.isArray(window.QUOTES_LIST) && window.QUOTES_LIST.length > 0
      ? window.QUOTES_LIST
      : FALLBACK_QUOTES;

  const CATEGORY_ICONS = {
    Fitness: "💪",
    Study: "📚",
    Health: "💧",
    Mindset: "🧠",
    Work: "💻"
  };

  const CHALLENGES = [
    { id: "c1", title: "Iron Start", desc: "Complete 100% of today's habits", target: 1, type: "perfectToday" },
    { id: "c2", title: "Week Warrior", desc: "Reach 75%+ weekly completion", target: 75, type: "weeklyPct" },
    { id: "c3", title: "Streak Keeper", desc: "Hold a 7-day login streak", target: 7, type: "streak" },
    { id: "c4", title: "Zero Backlog", desc: "Complete at least 5 To-Do items", target: 5, type: "todosDone" }
  ];

  const BADGES = [
    { id: "b1", icon: "🔥", name: "3-Day Spark", desc: "3-day streak", check: (s) => s.longestStreak >= 3 },
    { id: "b2", icon: "⚡", name: "7-Day Flame", desc: "7-day streak", check: (s) => s.longestStreak >= 7 },
    { id: "b3", icon: "🛡️", name: "30-Day Titan", desc: "30-day streak", check: (s) => s.longestStreak >= 30 },
    { id: "b4", icon: "💎", name: "Diamond Week", desc: "61%+ weekly rate", check: (_, m) => m.weeklyPct >= 61 },
    { id: "b5", icon: "👑", name: "Untouchable", desc: "100% weekly rate", check: (_, m) => m.weeklyPct === 100 && m.totalPossible > 0 },
    { id: "b6", icon: "📝", name: "Task Slayer", desc: "10 To-Dos done", check: (s) => s.completedTodos.length >= 10 },
    { id: "b7", icon: "⏱️", name: "Deep Focus", desc: "Finish a focus timer", check: (s) => (s.timersFinished || 0) >= 1 },
    { id: "b8", icon: "⚔️", name: "XP Grinder", desc: "Reach Level 5", check: (s) => getLevelInfo(s.xp || 0).level >= 5 }
  ];

  function getDefaultState() {
    const todayKey = getStreakDayString();
    const weekKey = getWeekStartKey();
    return {
      userName: "You",
      theme: "oled",
      accent: "mono",
      soundOn: true,
      xp: 0,
      streak: {
        count: 1,
        longest: 1,
        lastDate: todayKey,
        freezesLeft: 1,
        freezeMonth: todayKey.slice(0, 7)
      },
      quoteOffset: 0,
      lastRank: "Noob",
      currentWeekKey: weekKey,
      habits: [
        {
          id: "h_1",
          name: "Daily 30 min Exercise",
          category: "Fitness",
          type: "check",
          qtyTarget: 1,
          timerMin: 30,
          reminderTime: "",
          priority: true,
          note: "No zero days",
          activeDays: [0, 1, 2, 3, 4, 5, 6],
          checks: [false, false, false, false, false, false, false],
          qtyProgress: [0, 0, 0, 0, 0, 0, 0],
          archived: false
        },
        {
          id: "h_2",
          name: "Read 20 Pages",
          category: "Study",
          type: "check",
          qtyTarget: 1,
          timerMin: 25,
          reminderTime: "",
          priority: false,
          note: "Deep focus reading",
          activeDays: [0, 1, 2, 3, 4, 5, 6],
          checks: [false, false, false, false, false, false, false],
          qtyProgress: [0, 0, 0, 0, 0, 0, 0],
          archived: false
        },
        {
          id: "h_3",
          name: "Drink 8 Glasses Water",
          category: "Health",
          type: "qty",
          qtyTarget: 8,
          timerMin: 0,
          reminderTime: "",
          priority: false,
          note: "Stay hydrated",
          activeDays: [0, 1, 2, 3, 4, 5, 6],
          checks: [false, false, false, false, false, false, false],
          qtyProgress: [0, 0, 0, 0, 0, 0, 0],
          archived: false
        }
      ],
      todos: [],
      completedTodos: [],
      weekHistory: {},
      dailyHistory: {},
      friends: [
        { name: "Marcus", pct: 84, streak: 19 },
        { name: "Elena", pct: 72, streak: 11 }
      ],
      notifications: {
        enabled: false,
        reminderTime: "20:00",
        dismissedPrompt: false,
        lastDailyAlertDate: "",
        lastStreakDangerDate: "",
        alertedOverdueIds: []
      },
      timersFinished: 0
    };
  }

  let state = loadState();
  let activeTab = "tasks";
  let chartMode = "pct";
  let weekOffset = 0; // 0 = current week, -1 = last week, etc.
  let chartPointsCache = [];
  let undoPayload = null;
  let undoTimer = null;

  // Timer state
  let timerState = {
    habitId: null,
    totalSeconds: 1800,
    remainingSeconds: 1800,
    running: false,
    intervalId: null
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultState();
      const parsed = JSON.parse(raw);
      const def = getDefaultState();
      return {
        ...def,
        ...parsed,
        streak: { ...def.streak, ...(parsed.streak || {}) },
        notifications: { ...def.notifications, ...(parsed.notifications || {}) },
        habits: Array.isArray(parsed.habits) ? parsed.habits : def.habits,
        todos: Array.isArray(parsed.todos) ? parsed.todos : [],
        completedTodos: Array.isArray(parsed.completedTodos) ? parsed.completedTodos : [],
        weekHistory: parsed.weekHistory || {},
        dailyHistory: parsed.dailyHistory || {},
        friends: Array.isArray(parsed.friends) ? parsed.friends : def.friends
      };
    } catch {
      return getDefaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }

  // ==========================================
  // 1. DATE & 12:01 AM STREAK ENGINE
  // ==========================================
  function getShiftedDate(dateObj = new Date()) {
    // 12:00 AM belongs to previous day; 12:01 AM starts new streak day
    return new Date(dateObj.getTime() - 60 * 1000);
  }

  function getStreakDayString(dateObj = new Date()) {
    const shifted = getShiftedDate(dateObj);
    const y = shifted.getFullYear();
    const m = String(shifted.getMonth() + 1).padStart(2, "0");
    const d = String(shifted.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getTodayDayIndex(dateObj = new Date()) {
    return getShiftedDate(dateObj).getDay(); // 0 = Sun ... 6 = Sat
  }

  function getWeekStartKey(dateObj = new Date()) {
    const shifted = getShiftedDate(dateObj);
    const sun = new Date(shifted);
    sun.setDate(shifted.getDate() - shifted.getDay());
    const y = sun.getFullYear();
    const m = String(sun.getMonth() + 1).padStart(2, "0");
    const d = String(sun.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getOffsetWeekKey(offset) {
    const shifted = getShiftedDate(new Date());
    const sun = new Date(shifted);
    sun.setDate(shifted.getDate() - shifted.getDay() + offset * 7);
    const y = sun.getFullYear();
    const m = String(sun.getMonth() + 1).padStart(2, "0");
    const d = String(sun.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function formatWeekRangeLabel(weekStartStr) {
    const [y, m, d] = weekStartStr.split("-").map(Number);
    const start = new Date(y, m - 1, d);
    const end = new Date(y, m - 1, d + 6);
    const opts = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
  }

  function getDayDifference(prevDateStr, currDateStr) {
    const [py, pm, pd] = prevDateStr.split("-").map(Number);
    const [cy, cm, cd] = currDateStr.split("-").map(Number);
    const prevUtc = Date.UTC(py, pm - 1, pd);
    const currUtc = Date.UTC(cy, cm - 1, cd);
    return Math.round((currUtc - prevUtc) / 86400000);
  }

  function syncStreakAndWeekRollover() {
    const now = new Date();
    const todayKey = getStreakDayString(now);
    const currMonth = todayKey.slice(0, 7);

    // Replenish 1 monthly freeze at start of each month
    if (state.streak.freezeMonth !== currMonth) {
      state.streak.freezeMonth = currMonth;
      state.streak.freezesLeft = 1;
    }

    if (!state.streak.lastDate) {
      state.streak.count = 1;
      state.streak.lastDate = todayKey;
    } else {
      const diff = getDayDifference(state.streak.lastDate, todayKey);
      if (diff === 1) {
        state.streak.count += 1;
        state.streak.lastDate = todayKey;
        awardXP(15);
      } else if (diff === 2 && state.streak.freezesLeft > 0) {
        // Auto-protect streak with monthly freeze if 1 day missed
        state.streak.freezesLeft -= 1;
        state.streak.count += 1;
        state.streak.lastDate = todayKey;
        showToast("❄️ Monthly Streak Freeze saved your streak!");
      } else if (diff > 1) {
        state.streak.count = 1;
        state.streak.lastDate = todayKey;
      }
    }

    if (state.streak.count > (state.streak.longest || 1)) {
      state.streak.longest = state.streak.count;
    }

    // Archive old week snapshot if a new Sunday started
    const activeWeekKey = getWeekStartKey(now);
    if (state.currentWeekKey && state.currentWeekKey !== activeWeekKey) {
      const snapshot = computeWeeklyMetrics();
      state.weekHistory[state.currentWeekKey] = {
        dailyPct: snapshot.dailyPercentages,
        dailyCount: snapshot.dailyCounts,
        weeklyPct: snapshot.weeklyPct
      };
      state.habits = state.habits.map((h) => ({
        ...h,
        checks: [false, false, false, false, false, false, false],
        qtyProgress: [0, 0, 0, 0, 0, 0, 0]
      }));
      state.currentWeekKey = activeWeekKey;
    }

    saveState();
  }

  function updateCountdownClock() {
    const now = new Date();
    // Next 12:01 AM
    const nextRollover = new Date(now);
    nextRollover.setHours(0, 1, 0, 0);
    if (now >= nextRollover) {
      nextRollover.setDate(nextRollover.getDate() + 1);
    }
    const diffMs = nextRollover - now;
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);

    const el = document.getElementById("resetCountdownText");
    if (el) {
      el.textContent = `Next streak +1 in ${hrs}h ${mins}m (12:01 AM)`;
    }
  }

  // ==========================================
  // 2. SOUND, THEME & XP ENGINE
  // ==========================================
  function playTone(freq = 540, duration = 0.09) {
    if (!state.soundOn) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio blocks
    }
  }

  function applyThemeAndAccent() {
    const html = document.documentElement;
    html.setAttribute("data-theme", state.theme || "oled");
    html.setAttribute("data-accent", state.accent || "mono");

    const metaTheme = document.getElementById("metaThemeColor");
    if (metaTheme) {
      metaTheme.setAttribute(
        "content",
        state.theme === "light" ? "#f5f5f5" : state.theme === "aurora" ? "#121212" : "#0a0a0a"
      );
    }

    document.querySelectorAll(".theme-choice").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.themeVal === state.theme);
    });
    document.querySelectorAll(".swatch-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.accentVal === state.accent);
    });

    const soundBtn = document.getElementById("toggleSoundBtn");
    if (soundBtn) {
      soundBtn.textContent = state.soundOn ? "🔊 Sound: ON" : "🔇 Sound: OFF";
    }
  }

  function getLevelInfo(xp) {
    const level = Math.floor(xp / 100) + 1;
    const currentLevelXp = xp % 100;
    const titles = [
      "Initiate",
      "Apprentice",
      "Contender",
      "Disciplined",
      "Relentless",
      "Ironclad",
      "Vanguard",
      "Commander",
      "Apex",
      "Legend"
    ];
    const title = titles[Math.min(level - 1, titles.length - 1)];
    return { level, currentLevelXp, title };
  }

  function awardXP(amount) {
    state.xp = Math.max(0, (state.xp || 0) + amount);
  }

  // ==========================================
  // 3. METRICS, RANKS & WEEKLY SNAPSHOTS
  // ==========================================
  function getRankInfo(pct) {
    if (pct === 100) return { rank: "Untouchable", emoji: "👑", next: "MAX RANK ACHIEVED", verdict: "Grand Master level!" };
    if (pct >= 90) return { rank: "Grand Master", emoji: "🔥", next: "Next: Untouchable (100%)", verdict: "Grand Master level!" };
    if (pct > 80) return { rank: "Elite Master", emoji: "⚡", next: "Next: Grand Master (90%)", verdict: "Fantastic, one more level to reach Grand Master!" };
    if (pct > 75) return { rank: "Master", emoji: "⚔️", next: "Next: Elite Master (81%)", verdict: "Fantastic, one more level to reach Grand Master!" };
    if (pct > 60) return { rank: "Diamond", emoji: "💎", next: "Next: Master (76%)", verdict: "Little more, come on!" };
    if (pct > 50) return { rank: "Platinum", emoji: "💠", next: "Next: Diamond (61%)", verdict: "Little more, come on!" };
    if (pct >= 40) return { rank: "Gold", emoji: "🥇", next: "Next: Platinum (51%)", verdict: "Try harder!" };
    if (pct >= 20) return { rank: "Silver", emoji: "🥈", next: "Next: Gold (40%)", verdict: "Try harder!" };
    return { rank: "Noob", emoji: "🛡️", next: "Next: Silver (20%)", verdict: "You are weak, Comeback!" };
  }

  function computeWeeklyMetrics() {
    const activeHabits = state.habits.filter((h) => !h.archived);
    const todayIdx = getTodayDayIndex();

    const dailyCounts = [0, 0, 0, 0, 0, 0, 0];
    const dailyPercentages = [0, 0, 0, 0, 0, 0, 0];

    let totalWeightedEarned = 0;
    let totalWeightedPossible = 0;
    let rawCompleted = 0;
    let rawPossible = 0;

    for (let d = 0; d < 7; d++) {
      let dayWeightEarned = 0;
      let dayWeightPossible = 0;
      let dayDoneCount = 0;

      activeHabits.forEach((h) => {
        const activeDays = Array.isArray(h.activeDays) ? h.activeDays : [0, 1, 2, 3, 4, 5, 6];
        if (!activeDays.includes(d)) return;

        const weight = h.priority ? 2 : 1;
        dayWeightPossible += weight;
        rawPossible += 1;

        const isDone = Boolean(h.checks[d]);
        if (isDone) {
          dayWeightEarned += weight;
          dayDoneCount += 1;
          rawCompleted += 1;
        }
      });

      dailyCounts[d] = dayDoneCount;
      dailyPercentages[d] = dayWeightPossible > 0 ? Math.round((dayWeightEarned / dayWeightPossible) * 100) : 0;

      totalWeightedEarned += dayWeightEarned;
      totalWeightedPossible += dayWeightPossible;
    }

    const weeklyPct =
      totalWeightedPossible > 0 ? Math.round((totalWeightedEarned / totalWeightedPossible) * 100) : 0;

    // Today stats
    let todayDone = 0;
    let todayTotal = 0;
    activeHabits.forEach((h) => {
      const activeDays = Array.isArray(h.activeDays) ? h.activeDays : [0, 1, 2, 3, 4, 5, 6];
      if (!activeDays.includes(todayIdx)) return;
      todayTotal += 1;
      if (h.checks[todayIdx]) todayDone += 1;
    });

    const todayPct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

    // Save live snapshots for current week & today
    const weekKey = getWeekStartKey();
    state.weekHistory[weekKey] = {
      dailyPct: dailyPercentages,
      dailyCount: dailyCounts,
      weeklyPct
    };
    state.dailyHistory[getStreakDayString()] = todayPct;

    return {
      activeHabits,
      dailyCounts,
      dailyPercentages,
      weeklyPct,
      rawCompleted,
      rawPossible,
      totalPossible: totalWeightedPossible,
      todayDone,
      todayTotal,
      todayPct
    };
  }

  // ==========================================
  // 4. NOTIFICATIONS & DANGER ALERTS
  // ==========================================
  function sendSystemNotification(title, body, tag = "discipline-alert") {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          if (reg && reg.showNotification) {
            reg.showNotification(title, {
              body,
              icon: "icon-512.png",
              badge: "icon-512.png",
              tag,
              renotify: true
            });
          } else {
            new Notification(title, { body, icon: "icon-512.png" });
          }
        })
        .catch(() => {
          try {
            new Notification(title, { body, icon: "icon-512.png" });
          } catch {}
        });
    } else {
      try {
        new Notification(title, { body, icon: "icon-512.png" });
      } catch {}
    }
  }

  function checkSmartAlerts(metrics) {
    const now = new Date();
    const todayKey = getStreakDayString(now);
    const hour = now.getHours();
    const pendingTodos = state.todos.length;
    const remainingHabits = Math.max(0, metrics.todayTotal - metrics.todayDone);

    // 1. Streak-in-Danger Banner after 9:00 PM (21:00)
    const banner = document.getElementById("streakDangerBanner");
    const bannerText = document.getElementById("streakDangerText");
    const freezeBtn = document.getElementById("useFreezeBtn");

    if (hour >= 21 && (remainingHabits > 0 || pendingTodos > 0)) {
      if (banner) banner.classList.remove("hidden");
      if (bannerText) {
        bannerText.textContent = `${remainingHabits} habit(s) & ${pendingTodos} To-Do(s) left before 12:01 AM!`;
      }
      if (freezeBtn) {
        freezeBtn.classList.toggle("hidden", (state.streak.freezesLeft || 0) <= 0);
      }

      if (
        state.notifications.enabled &&
        state.notifications.lastStreakDangerDate !== todayKey
      ) {
        state.notifications.lastStreakDangerDate = todayKey;
        sendSystemNotification(
          "⚠️ Streak Ending Soon!",
          `Finish ${remainingHabits} remaining habit(s) before 12:01 AM to keep your ${state.streak.count}-day streak!`,
          "streak-danger"
        );
        saveState();
      }
    } else if (banner) {
      banner.classList.add("hidden");
    }

    // 2. Scheduled Daily Reminder
    if (state.notifications.enabled && state.notifications.reminderTime) {
      const [remH, remM] = state.notifications.reminderTime.split(":").map(Number);
      if (
        (hour > remH || (hour === remH && now.getMinutes() >= remM)) &&
        state.notifications.lastDailyAlertDate !== todayKey &&
        (remainingHabits > 0 || pendingTodos > 0)
      ) {
        state.notifications.lastDailyAlertDate = todayKey;
        sendSystemNotification(
          "🔥 Discipline Check-In",
          `You have ${remainingHabits} habit(s) and ${pendingTodos} To-Do(s) waiting today.`,
          "daily-checkin"
        );
        saveState();
      }
    }

    // 3. 1-Day Overdue To-Do Notification (> 24 hours old)
    const oneDayMs = 24 * 60 * 60 * 1000;
    const overdueTodos = state.todos.filter((t) => Date.now() - t.createdAt >= oneDayMs);
    if (state.notifications.enabled && overdueTodos.length > 0) {
      const alerted = new Set(state.notifications.alertedOverdueIds || []);
      const freshOverdue = overdueTodos.filter((t) => !alerted.has(t.id));
      if (freshOverdue.length > 0) {
        freshOverdue.forEach((t) => alerted.add(t.id));
        state.notifications.alertedOverdueIds = Array.from(alerted);
        sendSystemNotification(
          "⏰ Overdue To-Do Alert (> 1 Day)",
          `"${freshOverdue[0].text}" has been pending for over 24 hours. Complete it now!`,
          "todo-overdue"
        );
        saveState();
      }
    }

    // Prompt visibility
    const promptCard = document.getElementById("notifPromptCard");
    if (promptCard) {
      const shouldShow =
        "Notification" in window &&
        Notification.permission === "default" &&
        !state.notifications.dismissedPrompt;
      promptCard.classList.toggle("hidden", !shouldShow);
    }
  }

  // ==========================================
  // 5. RENDERING: HERO, QUOTES & HABITS
  // ==========================================
  function renderHeroAndQuote(metrics) {
    const streakEl = document.getElementById("streakCount");
    if (streakEl) streakEl.textContent = state.streak.count;

    const freezeEl = document.getElementById("freezeCountChip");
    if (freezeEl) freezeEl.textContent = `❄️${state.streak.freezesLeft || 0}`;

    const lvl = getLevelInfo(state.xp || 0);
    const badgeEl = document.getElementById("rpgLevelBadge");
    if (badgeEl) badgeEl.textContent = `LVL ${lvl.level}`;

    const titleEl = document.getElementById("xpLevelTitle");
    if (titleEl) titleEl.textContent = `Level ${lvl.level} • ${lvl.title}`;

    const numEl = document.getElementById("xpNumericText");
    if (numEl) numEl.textContent = `${lvl.currentLevelXp} / 100 XP`;

    const fillEl = document.getElementById("xpProgressFill");
    if (fillEl) fillEl.style.width = `${lvl.currentLevelXp}%`;

    // Today Mission Ring
    const dateLabel = document.getElementById("todayDateLabel");
    if (dateLabel) {
      const todayName = new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
      dateLabel.textContent = `TODAY • ${todayName.toUpperCase()}`;
    }

    const fracEl = document.getElementById("todayDoneFraction");
    if (fracEl) fracEl.textContent = `${metrics.todayDone} / ${metrics.todayTotal}`;

    const todoInlineEl = document.getElementById("todayTodoPendingInline");
    if (todoInlineEl) todoInlineEl.textContent = String(state.todos.length);

    const pctPillEl = document.getElementById("todayPctPill");
    if (pctPillEl) pctPillEl.textContent = `${metrics.todayPct}%`;

    const ringCircle = document.getElementById("todayRingCircle");
    if (ringCircle) {
      const circumference = 113.1;
      const offset = circumference - (metrics.todayPct / 100) * circumference;
      ringCircle.style.strokeDashoffset = String(offset);
    }

    // Quote locked to 12:01 AM day + manual offset
    const todayKey = getStreakDayString();
    const [y, m, d] = todayKey.split("-").map(Number);
    const dayNumber = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
    const qIdx = (dayNumber + (state.quoteOffset || 0)) % QUOTES.length;

    const quoteCounter = document.getElementById("quoteCounterLabel");
    if (quoteCounter) {
      quoteCounter.textContent = `QUOTE #${qIdx + 1} / ${QUOTES.length} • UPDATES 12:01 AM`;
    }

    const quoteText = document.getElementById("dailyQuoteText");
    if (quoteText) {
      quoteText.textContent = `"${QUOTES[qIdx]}"`;
    }
  }

  function renderHabits(metrics) {
    const rangeLabel = document.getElementById("activeWeekRangeLabel");
    if (rangeLabel) {
      rangeLabel.textContent = `Current Week (${formatWeekRangeLabel(getWeekStartKey())})`;
    }

    const scoreBadge = document.getElementById("overallScoreBadge");
    if (scoreBadge) {
      scoreBadge.textContent = `${metrics.rawCompleted} / ${metrics.rawPossible}`;
    }

    const archivedCount = state.habits.filter((h) => h.archived).length;
    const archBadge = document.getElementById("archivedCountBadge");
    if (archBadge) archBadge.textContent = String(archivedCount);

    const list = document.getElementById("habitCardsList");
    if (!list) return;
    list.innerHTML = "";

    if (metrics.activeHabits.length === 0) {
      list.innerHTML = `<p class="muted" style="text-align:center; padding:20px 0;">No active habits. Tap <strong>+ New</strong> above to add your first habit.</p>`;
      return;
    }

    const todayIdx = getTodayDayIndex();

    metrics.activeHabits.forEach((habit) => {
      const activeDays = Array.isArray(habit.activeDays) ? habit.activeDays : [0, 1, 2, 3, 4, 5, 6];
      const doneDays = activeDays.filter((d) => habit.checks[d]).length;
      const catIcon = CATEGORY_ICONS[habit.category] || "⚡";

      let daysHTML = "";
      for (let d = 0; d < 7; d++) {
        const isScheduled = activeDays.includes(d);
        const isChecked = Boolean(habit.checks[d]);
        const isToday = d === todayIdx;

        if (!isScheduled) {
          daysHTML += `
            <div class="day-cell rest-day" title="Rest day">
              <span class="day-label">${DAYS[d]}</span>
              <span class="rest-dash">—</span>
            </div>
          `;
        } else if (habit.type === "qty") {
          const curQty = (habit.qtyProgress && habit.qtyProgress[d]) || 0;
          const target = habit.qtyTarget || 8;
          daysHTML += `
            <button type="button" class="day-cell qty-cell ${isChecked ? "done" : ""} ${isToday ? "today-col" : ""}"
              data-action="qty" data-id="${habit.id}" data-day="${d}" title="Tap to +1 (${curQty}/${target})">
              <span class="day-label">${DAYS[d]}</span>
              <span class="qty-pill">${curQty}/${target}</span>
            </button>
          `;
        } else {
          daysHTML += `
            <label class="day-cell ${isToday ? "today-col" : ""}">
              <span class="day-label">${DAYS[d]}</span>
              <input type="checkbox" class="day-box" data-action="toggle" data-id="${habit.id}" data-day="${d}" ${isChecked ? "checked" : ""} />
            </label>
          `;
        }
      }

      const timerBtnHTML =
        habit.timerMin && Number(habit.timerMin) > 0
          ? `<button type="button" class="btn-ghost-sm" data-action="timer" data-id="${habit.id}" title="Start ${habit.timerMin}m Focus Timer">⏱️ ${habit.timerMin}m</button>`
          : "";

      const card = document.createElement("div");
      card.className = `habit-item-card ${habit.priority ? "priority-card" : ""}`;
      card.innerHTML = `
        <div class="habit-item-top">
          <div class="habit-title-wrap">
            <span class="habit-title">${catIcon} ${escapeHTML(habit.name)} ${habit.priority ? '<span class="prio-tag">2X</span>' : ""}</span>
            ${habit.note ? `<span class="habit-note">${escapeHTML(habit.note)}</span>` : ""}
          </div>
          <div class="habit-controls">
            ${timerBtnHTML}
            <span class="habit-score-tag">${doneDays}/${activeDays.length}</span>
            <button type="button" class="icon-btn" data-action="archive" data-id="${habit.id}" title="Archive habit">📦</button>
            <button type="button" class="icon-btn" data-action="delete" data-id="${habit.id}" title="Delete habit">🗑️</button>
          </div>
        </div>
        <div class="days-grid-7">${daysHTML}</div>
      `;
      list.appendChild(card);
    });
  }

  // ==========================================
  // 6. RENDERING: DEDICATED TO-DO WORKSPACE
  // ==========================================
  function renderTodos() {
    const countBadge = document.getElementById("todoCountBadge");
    if (countBadge) countBadge.textContent = `${state.todos.length} Pending`;

    const compCount = document.getElementById("todoCompletedCount");
    if (compCount) compCount.textContent = String(state.completedTodos.length);

    const container = document.getElementById("todoListContainer");
    if (container) {
      container.innerHTML = "";
      if (state.todos.length === 0) {
        container.innerHTML = `<p class="muted" style="text-align:center; padding:18px 0;">Zero pending tasks. Add any one-off task above.</p>`;
      } else {
        const oneDayMs = 24 * 60 * 60 * 1000;
        state.todos.forEach((todo, idx) => {
          const ageMs = Date.now() - todo.createdAt;
          const isOverdue = ageMs >= oneDayMs;
          const hrsOld = Math.max(1, Math.floor(ageMs / 3600000));
          const ageLabel = isOverdue ? `⚠️ Overdue (${Math.floor(hrsOld / 24)}d)` : `${hrsOld}h ago`;

          const row = document.createElement("div");
          row.className = `todo-item-row ${isOverdue ? "todo-overdue" : ""}`;
          row.innerHTML = `
            <label class="todo-left-label">
              <input type="checkbox" class="day-box" data-todo-action="complete" data-id="${todo.id}" />
              <span class="todo-num">#${idx + 1}</span>
              <span class="todo-text">${escapeHTML(todo.text)}</span>
            </label>
            <div class="todo-right-meta">
              <span class="todo-age-tag">${ageLabel}</span>
              <button type="button" class="icon-btn" data-todo-action="delete" data-id="${todo.id}" title="Remove">✕</button>
            </div>
          `;
          container.appendChild(row);
        });
      }
    }

    const completedList = document.getElementById("completedTodoList");
    if (completedList) {
      completedList.innerHTML = "";
      state.completedTodos.slice(0, 15).forEach((item) => {
        const div = document.createElement("div");
        div.className = "completed-todo-row";
        div.innerHTML = `<span>✓ ${escapeHTML(item.text)}</span>`;
        completedList.appendChild(div);
      });
    }
  }

  // ==========================================
  // 7. RENDERING: 100% OFFLINE CANVAS GRAPH & HEATMAP
  // ==========================================
  function renderGraphAndHeatmap(metrics) {
    const viewedWeekKey = getOffsetWeekKey(weekOffset);
    const weekData =
      weekOffset === 0
        ? { dailyPct: metrics.dailyPercentages, dailyCount: metrics.dailyCounts, weeklyPct: metrics.weeklyPct }
        : state.weekHistory[viewedWeekKey] || { dailyPct: [0, 0, 0, 0, 0, 0, 0], dailyCount: [0, 0, 0, 0, 0, 0, 0], weeklyPct: 0 };

    const titleEl = document.getElementById("viewedWeekTitle");
    if (titleEl) {
      titleEl.textContent =
        weekOffset === 0
          ? "This Week"
          : weekOffset === -1
          ? "Last Week"
          : formatWeekRangeLabel(viewedWeekKey);
    }

    const prevWeekKey = getOffsetWeekKey(weekOffset - 1);
    const prevData = state.weekHistory[prevWeekKey];
    const deltaBadge = document.getElementById("weekVsLastBadge");
    if (deltaBadge) {
      if (prevData) {
        const diff = weekData.weeklyPct - prevData.weeklyPct;
        deltaBadge.textContent = `${diff >= 0 ? "+" : ""}${diff}% vs prior week`;
      } else {
        deltaBadge.textContent = formatWeekRangeLabel(viewedWeekKey);
      }
    }

    const nextBtn = document.getElementById("nextWeekBtn");
    if (nextBtn) nextBtn.disabled = weekOffset >= 0;

    drawOfflineSplineChart(
      chartMode === "pct" ? weekData.dailyPct : weekData.dailyCount,
      chartMode === "pct" ? 100 : Math.max(metrics.activeHabits.length, 1)
    );

    // Day Insights Grid
    const insights = document.getElementById("dayInsightsGrid");
    if (insights) {
      let bestDay = 0;
      for (let i = 1; i < 7; i++) {
        if (weekData.dailyPct[i] > weekData.dailyPct[bestDay]) bestDay = i;
      }
      const totalDoneWeek = weekData.dailyCount.reduce((a, b) => a + b, 0);
      insights.innerHTML = `
        <div class="insight-tile">
          <span class="muted">Weekly Score</span>
          <strong>${weekData.weeklyPct}%</strong>
        </div>
        <div class="insight-tile">
          <span class="muted">Strongest Day</span>
          <strong>${DAYS[bestDay]} (${weekData.dailyPct[bestDay]}%)</strong>
        </div>
        <div class="insight-tile">
          <span class="muted">Total Check-Ins</span>
          <strong>${totalDoneWeek}</strong>
        </div>
      `;
    }

    // 12-Week Consistency Heatmap (84 days)
    const hmGrid = document.getElementById("activityHeatmapGrid");
    if (hmGrid) {
      hmGrid.innerHTML = "";
      const shiftedToday = getShiftedDate(new Date());
      for (let i = 83; i >= 0; i--) {
        const d = new Date(shiftedToday);
        d.setDate(shiftedToday.getDate() - i);
        const key = getStreakDayString(d);
        const pct = state.dailyHistory[key] || 0;
        const lvl = pct === 0 ? 0 : pct < 30 ? 1 : pct < 60 ? 2 : pct < 90 ? 3 : 4;
        const cell = document.createElement("div");
        cell.className = `hm-box lvl-${lvl}`;
        cell.title = `${key}: ${pct}%`;
        hmGrid.appendChild(cell);
      }
    }
  }

  function drawOfflineSplineChart(values, maxVal) {
    const canvas = document.getElementById("modernWeeklyChart");
    if (!canvas) return;
    const parent = canvas.parentElement;
    const width = Math.max(280, parent ? parent.clientWidth : 340);
    const height = 230;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const isLight = state.theme === "light";
    const lineStroke = isLight ? "#111111" : "#ffffff";
    const gridStroke = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
    const labelColor = isLight ? "#525252" : "#a3a3a3";

    const padLeft = 36;
    const padRight = 18;
    const padTop = 22;
    const padBottom = 30;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Horizontal grid lines
    ctx.font = "600 11px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const steps = 4;
    for (let s = 0; s <= steps; s++) {
      const ratio = s / steps;
      const y = padTop + plotH - ratio * plotH;
      const val = Math.round(ratio * maxVal);

      ctx.strokeStyle = gridStroke;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = labelColor;
      ctx.fillText(chartMode === "pct" ? `${val}%` : `${val}`, padLeft - 6, y);
    }

    // Compute points
    chartPointsCache = values.map((v, i) => {
      const x = padLeft + (i / 6) * plotW;
      const clamped = Math.min(maxVal, Math.max(0, v));
      const y = padTop + plotH - (clamped / (maxVal || 1)) * plotH;
      return { x, y, val: v, day: DAYS[i] };
    });

    // Area fill gradient (Monochrome silver/white fade)
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    if (isLight) {
      grad.addColorStop(0, "rgba(0, 0, 0, 0.20)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
    } else {
      grad.addColorStop(0, "rgba(255, 255, 255, 0.26)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    }

    ctx.beginPath();
    ctx.moveTo(chartPointsCache[0].x, padTop + plotH);
    chartPointsCache.forEach((pt, idx) => {
      if (idx === 0) {
        ctx.lineTo(pt.x, pt.y);
      } else {
        const prev = chartPointsCache[idx - 1];
        const midX = (prev.x + pt.x) / 2;
        ctx.bezierCurveTo(midX, prev.y, midX, pt.y, pt.x, pt.y);
      }
    });
    ctx.lineTo(chartPointsCache[6].x, padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Smooth spline stroke
    ctx.beginPath();
    chartPointsCache.forEach((pt, idx) => {
      if (idx === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        const prev = chartPointsCache[idx - 1];
        const midX = (prev.x + pt.x) / 2;
        ctx.bezierCurveTo(midX, prev.y, midX, pt.y, pt.x, pt.y);
      }
    });
    ctx.strokeStyle = lineStroke;
    ctx.lineWidth = 2.8;
    ctx.stroke();

    // Points & X-axis labels
    const todayIdx = getTodayDayIndex();
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    chartPointsCache.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, idx === todayIdx && weekOffset === 0 ? 5.5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? "#ffffff" : "#0a0a0a";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = lineStroke;
      ctx.stroke();

      ctx.fillStyle = idx === todayIdx && weekOffset === 0 ? lineStroke : labelColor;
      ctx.font =
        idx === todayIdx && weekOffset === 0
          ? "700 11px -apple-system, BlinkMacSystemFont, sans-serif"
          : "600 11px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(pt.day, pt.x, padTop + plotH + 8);
    });
  }

  // ==========================================
  // 8. RENDERING: RANK, CHALLENGES, BADGES & LEADERBOARD
  // ==========================================
  function renderRankAndGamification(metrics) {
    const pct = metrics.weeklyPct;
    const rankObj = getRankInfo(pct);

    const pctBadge = document.getElementById("weeklyPctBadge");
    if (pctBadge) pctBadge.textContent = `${pct}%`;

    const emojiEl = document.getElementById("rankEmoji");
    if (emojiEl) emojiEl.textContent = rankObj.emoji;

    const titleEl = document.getElementById("rankTitle");
    if (titleEl) titleEl.textContent = `${rankObj.rank} Level`;

    const verdictEl = document.getElementById("motivationVerdict");
    if (verdictEl) verdictEl.textContent = rankObj.verdict;

    const curLabel = document.getElementById("currentRankLabel");
    if (curLabel) curLabel.textContent = `${rankObj.rank} (${pct}%)`;

    const nextLabel = document.getElementById("nextRankLabel");
    if (nextLabel) nextLabel.textContent = rankObj.next;

    const progFill = document.getElementById("rankProgressFill");
    if (progFill) progFill.style.width = `${pct}%`;

    // Rank promotion popup check
    if (state.lastRank && state.lastRank !== rankObj.rank && pct > 0) {
      const rankOrder = ["Noob", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite Master", "Grand Master", "Untouchable"];
      if (rankOrder.indexOf(rankObj.rank) > rankOrder.indexOf(state.lastRank)) {
        openRankUpModal(rankObj);
      }
    }
    state.lastRank = rankObj.rank;

    // Weekly Challenges
    const chList = document.getElementById("weeklyChallengesList");
    if (chList) {
      chList.innerHTML = "";
      CHALLENGES.forEach((ch) => {
        let cur = 0;
        if (ch.type === "perfectToday") cur = metrics.todayTotal > 0 && metrics.todayDone === metrics.todayTotal ? 1 : 0;
        if (ch.type === "weeklyPct") cur = metrics.weeklyPct;
        if (ch.type === "streak") cur = state.streak.count;
        if (ch.type === "todosDone") cur = state.completedTodos.length;

        const done = cur >= ch.target;
        const barPct = Math.min(100, Math.round((cur / ch.target) * 100));

        const item = document.createElement("div");
        item.className = `challenge-row ${done ? "challenge-done" : ""}`;
        item.innerHTML = `
          <div class="activity-row-top">
            <strong>${done ? "✅" : "⚔️"} ${ch.title} — <span class="muted">${ch.desc}</span></strong>
            <span>${Math.min(cur, ch.target)}/${ch.target}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${barPct}%"></div>
          </div>
        `;
        chList.appendChild(item);
      });
    }

    // Trophy Shelf
    const badgesGrid = document.getElementById("badgesGrid");
    let unlockedTotal = 0;
    if (badgesGrid) {
      badgesGrid.innerHTML = "";
      BADGES.forEach((b) => {
        const unlocked = b.check(state.streak ? { ...state, longestStreak: state.streak.longest } : state, metrics);
        if (unlocked) unlockedTotal += 1;
        const tile = document.createElement("div");
        tile.className = `badge-tile ${unlocked ? "unlocked" : "locked"}`;
        tile.innerHTML = `
          <div class="badge-tile-icon">${b.icon}</div>
          <div class="badge-tile-name">${b.name}</div>
          <div class="badge-tile-desc">${b.desc}</div>
        `;
        badgesGrid.appendChild(tile);
      });
    }
    const unlockedCountEl = document.getElementById("unlockedBadgesCount");
    if (unlockedCountEl) unlockedCountEl.textContent = String(unlockedTotal);

    // Leaderboard
    const lbList = document.getElementById("leaderboardList");
    if (lbList) {
      const entries = [
        { name: `${state.userName || "You"} (You)`, pct, streak: state.streak.count, isMe: true },
        ...(state.friends || []).map((f) => ({ ...f, isMe: false }))
      ].sort((a, b) => b.pct - a.pct || b.streak - a.streak);

      lbList.innerHTML = "";
      entries.forEach((entry, idx) => {
        const row = document.createElement("div");
        row.className = `leaderboard-row ${entry.isMe ? "me-row" : ""}`;
        row.innerHTML = `
          <span><strong>#${idx + 1}</strong> ${escapeHTML(entry.name)}</span>
          <span>🔥 ${entry.streak}d • <strong>${entry.pct}%</strong></span>
        `;
        lbList.appendChild(row);
      });
    }

    // Habit Consistency Breakdown
    const actList = document.getElementById("activitiesList");
    if (actList) {
      actList.innerHTML = "";
      metrics.activeHabits.forEach((h) => {
        const activeDays = Array.isArray(h.activeDays) ? h.activeDays : [0, 1, 2, 3, 4, 5, 6];
        const done = activeDays.filter((d) => h.checks[d]).length;
        const hPct = activeDays.length > 0 ? Math.round((done / activeDays.length) * 100) : 0;
        const row = document.createElement("div");
        row.innerHTML = `
          <div class="activity-row-top">
            <span>${escapeHTML(h.name)}</span>
            <span class="muted">${done}/${activeDays.length} (${hPct}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${hPct}%"></div>
          </div>
        `;
        actList.appendChild(row);
      });
    }
  }

  function renderSettingsLists() {
    const nameInput = document.getElementById("userNameInput");
    if (nameInput && document.activeElement !== nameInput) {
      nameInput.value = state.userName || "You";
    }

    const remInput = document.getElementById("dailyReminderTimeInput");
    if (remInput && document.activeElement !== remInput) {
      remInput.value = state.notifications.reminderTime || "20:00";
    }

    const longestEl = document.getElementById("longestStreakStat");
    if (longestEl) longestEl.textContent = String(state.streak.longest || 1);

    const freezeVault = document.getElementById("freezeVaultStat");
    if (freezeVault) freezeVault.textContent = String(state.streak.freezesLeft || 0);

    const quotesStat = document.getElementById("totalQuotesStat");
    if (quotesStat) quotesStat.textContent = String(QUOTES.length);

    const archList = document.getElementById("archivedHabitsList");
    if (archList) {
      const archived = state.habits.filter((h) => h.archived);
      archList.innerHTML = "";
      if (archived.length === 0) {
        archList.innerHTML = `<p class="muted">No archived habits.</p>`;
      } else {
        archived.forEach((h) => {
          const row = document.createElement("div");
          row.className = "archived-item-row";
          row.innerHTML = `
            <span>${escapeHTML(h.name)}</span>
            <button type="button" class="btn-ghost-sm" data-restore-id="${h.id}">Restore</button>
          `;
          archList.appendChild(row);
        });
      }
    }
  }

  // ==========================================
  // 9. MODALS: FOCUS TIMER, REPORT CARD, RANK UP
  // ==========================================
  function openFocusTimer(habitId) {
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit) return;
    stopTimerInterval();
    const mins = Math.max(1, Number(habit.timerMin) || 25);
    timerState = {
      habitId,
      totalSeconds: mins * 60,
      remainingSeconds: mins * 60,
      running: false,
      intervalId: null
    };
    document.getElementById("timerTaskTitle").textContent = habit.name;
    updateTimerDisplay();
    document.getElementById("timerStartPauseBtn").textContent = "▶ Start";
    document.getElementById("timerModal").classList.remove("hidden");
  }

  function updateTimerDisplay() {
    const m = String(Math.floor(timerState.remainingSeconds / 60)).padStart(2, "0");
    const s = String(timerState.remainingSeconds % 60).padStart(2, "0");
    document.getElementById("timerClockDisplay").textContent = `${m}:${s}`;
  }

  function stopTimerInterval() {
    if (timerState.intervalId) {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
    }
    timerState.running = false;
  }

  function toggleTimerRun() {
    const btn = document.getElementById("timerStartPauseBtn");
    if (timerState.running) {
      stopTimerInterval();
      btn.textContent = "▶ Resume";
      return;
    }
    timerState.running = true;
    btn.textContent = "⏸ Pause";
    timerState.intervalId = setInterval(() => {
      timerState.remainingSeconds -= 1;
      updateTimerDisplay();
      if (timerState.remainingSeconds <= 0) {
        stopTimerInterval();
        btn.textContent = "✅ Done";
        playTone(780, 0.25);
        const h = state.habits.find((item) => item.id === timerState.habitId);
        if (h) {
          const todayIdx = getTodayDayIndex();
          h.checks[todayIdx] = true;
          if (h.type === "qty") h.qtyProgress[todayIdx] = h.qtyTarget || 8;
        }
        state.timersFinished = (state.timersFinished || 0) + 1;
        awardXP(25);
        saveState();
        renderAll();
        showToast("⏱️ Focus session complete! +25 XP");
      }
    }, 1000);
  }

  function openRankUpModal(rankObj) {
    document.getElementById("rankUpIcon").textContent = rankObj.emoji;
    document.getElementById("rankUpNewTitle").textContent = rankObj.rank;
    document.getElementById("rankUpSubtitle").textContent = rankObj.verdict;
    document.getElementById("rankUpModal").classList.remove("hidden");
    launchConfetti();
  }

  function launchConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    const shades = ["#ffffff", "#d4d4d4", "#a3a3a3", "#737373"];
    const pieces = Array.from({ length: 65 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 120,
      r: 4 + Math.random() * 4,
      vy: 2 + Math.random() * 4,
      vx: -2 + Math.random() * 4,
      color: shades[Math.floor(Math.random() * shades.length)]
    }));

    let frame = 0;
    function step() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.r, p.r * 1.4);
      });
      frame += 1;
      if (frame < 90) requestAnimationFrame(step);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(step);
  }

  function drawWeeklyReportCard(metrics) {
    const canvas = document.getElementById("reportCardCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = 720;
    const h = 900;

    // Monochrome Black/Grey/White Report Card
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#2e2e2e";
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, w - 48, h - 48);

    ctx.fillStyle = "#a3a3a3";
    ctx.font = "700 22px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("DISCIPLINE • WEEKLY REPORT", 60, 90);

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 46px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(state.userName || "Athlete", 60, 152);

    const rankObj = getRankInfo(metrics.weeklyPct);

    // Rank Box
    ctx.fillStyle = "#161616";
    ctx.fillRect(60, 195, w - 120, 180);
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 195, w - 120, 180);

    ctx.fillStyle = "#a3a3a3";
    ctx.font = "700 20px sans-serif";
    ctx.fillText("CURRENT DIVISION", 92, 242);

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 52px sans-serif";
    ctx.fillText(`${rankObj.emoji} ${rankObj.rank}`, 92, 308);

    ctx.fillStyle = "#d4d4d4";
    ctx.font = "600 24px sans-serif";
    ctx.fillText(`Weekly Score: ${metrics.weeklyPct}%   •   Streak: 🔥 ${state.streak.count} Days`, 92, 352);

    // 7-Day Bar Chart inside Report Card
    ctx.fillStyle = "#a3a3a3";
    ctx.font = "700 20px sans-serif";
    ctx.fillText("DAILY PERFORMANCE (SUN – SAT)", 60, 435);

    const barAreaTop = 470;
    const barMaxH = 220;
    const colW = (w - 140) / 7;

    metrics.dailyPercentages.forEach((pct, i) => {
      const x = 75 + i * colW;
      const barH = Math.max(8, (pct / 100) * barMaxH);
      const y = barAreaTop + barMaxH - barH;

      ctx.fillStyle = "#262626";
      ctx.fillRect(x, barAreaTop, 48, barMaxH);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, 48, barH);

      ctx.fillStyle = "#d4d4d4";
      ctx.font = "700 20px sans-serif";
      ctx.fillText(DAYS[i], x + 4, barAreaTop + barMaxH + 34);
    });

    // Footer Quote
    ctx.fillStyle = "#a3a3a3";
    ctx.font = "italic 22px sans-serif";
    ctx.fillText(`"${rankObj.verdict}"`, 60, 810);

    ctx.fillStyle = "#737373";
    ctx.font = "600 18px sans-serif";
    ctx.fillText(formatWeekRangeLabel(getWeekStartKey()), 60, 848);
  }

  // ==========================================
  // 10. TOAST & EVENT LISTENERS
  // ==========================================
  function showToast(msg, withUndo = false) {
    const bar = document.getElementById("toastBar");
    const textEl = document.getElementById("toastMessage");
    const undoBtn = document.getElementById("toastUndoBtn");
    if (!bar || !textEl) return;

    textEl.textContent = msg;
    bar.classList.remove("hidden");
    if (undoBtn) undoBtn.classList.toggle("hidden", !withUndo);

    if (undoTimer) clearTimeout(undoTimer);
    undoTimer = setTimeout(() => {
      bar.classList.add("hidden");
      undoPayload = null;
    }, 4500);
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

  function setupEventListeners() {
    // Bottom Navigation Tabs
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
        document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".tab-view").forEach((v) => v.classList.remove("active"));
        const targetView = document.getElementById(`view-${activeTab}`);
        if (targetView) targetView.classList.add("active");
        if (activeTab === "graph") renderAll();
      });
    });

    // Quote Cycle & Copy
    document.getElementById("nextQuoteBtn")?.addEventListener("click", () => {
      state.quoteOffset = ((state.quoteOffset || 0) + 1) % QUOTES.length;
      saveState();
      renderAll();
    });

    document.getElementById("copyQuoteBtn")?.addEventListener("click", () => {
      const txt = document.getElementById("dailyQuoteText")?.textContent || "";
      navigator.clipboard?.writeText(txt).catch(() => {});
      showToast("📋 Quote copied to clipboard");
    });

    // Habit Composer Toggle & Type Switch
    document.getElementById("openHabitComposerBtn")?.addEventListener("click", () => {
      document.getElementById("habitNameInput")?.focus();
      document.getElementById("composerAdvanced")?.classList.toggle("open");
    });

    document.getElementById("toggleComposerOptsBtn")?.addEventListener("click", () => {
      document.getElementById("composerAdvanced")?.classList.toggle("open");
    });

    document.getElementById("habitTypeInput")?.addEventListener("change", (e) => {
      document.getElementById("qtyTargetGroup")?.classList.toggle("hidden", e.target.value !== "qty");
    });

    document.querySelectorAll("#composerDaysRow .day-pill").forEach((pill) => {
      pill.addEventListener("click", () => pill.classList.toggle("active"));
    });

    // Create New Habit
    document.getElementById("habitForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("habitNameInput");
      const name = nameInput.value.trim();
      if (!name) return;

      const selectedDays = Array.from(document.querySelectorAll("#composerDaysRow .day-pill.active")).map((b) =>
        Number(b.dataset.day)
      );

      state.habits.push({
        id: `h_${Date.now()}`,
        name,
        category: document.getElementById("habitCategoryInput")?.value || "Fitness",
        type: document.getElementById("habitTypeInput")?.value || "check",
        qtyTarget: Math.max(2, Number(document.getElementById("habitQtyTargetInput")?.value) || 8),
        timerMin: Math.max(0, Number(document.getElementById("habitTimerInput")?.value) || 0),
        reminderTime: document.getElementById("habitReminderInput")?.value || "",
        priority: Boolean(document.getElementById("habitPriorityInput")?.checked),
        note: (document.getElementById("habitNoteInput")?.value || "").trim(),
        activeDays: selectedDays.length > 0 ? selectedDays : [0, 1, 2, 3, 4, 5, 6],
        checks: [false, false, false, false, false, false, false],
        qtyProgress: [0, 0, 0, 0, 0, 0, 0],
        archived: false
      });

      nameInput.value = "";
      document.getElementById("habitNoteInput").value = "";
      document.getElementById("composerAdvanced")?.classList.remove("open");
      playTone(620, 0.08);
      saveState();
      renderAll();
      showToast("✅ Habit added");
    });

    // Habit Card Actions (Delegated)
    document.getElementById("habitCardsList")?.addEventListener("change", (e) => {
      const target = e.target;
      if (target.dataset.action === "toggle") {
        const habit = state.habits.find((h) => h.id === target.dataset.id);
        const day = Number(target.dataset.day);
        if (habit) {
          habit.checks[day] = target.checked;
          if (target.checked) {
            awardXP(habit.priority ? 20 : 10);
            playTone(660, 0.08);
          } else {
            awardXP(habit.priority ? -20 : -10);
          }
          saveState();
          renderAll();
        }
      }
    });

    document.getElementById("habitCardsList")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      const habit = state.habits.find((h) => h.id === btn.dataset.id);
      if (!habit) return;

      if (action === "qty") {
        const day = Number(btn.dataset.day);
        const target = habit.qtyTarget || 8;
        const cur = (habit.qtyProgress[day] || 0) + 1;
        if (cur > target) {
          habit.qtyProgress[day] = 0;
          habit.checks[day] = false;
        } else {
          habit.qtyProgress[day] = cur;
          if (cur === target && !habit.checks[day]) {
            habit.checks[day] = true;
            awardXP(habit.priority ? 20 : 10);
            playTone(720, 0.1);
          }
        }
        saveState();
        renderAll();
      } else if (action === "timer") {
        openFocusTimer(habit.id);
      } else if (action === "archive") {
        habit.archived = true;
        saveState();
        renderAll();
        showToast("📦 Habit archived");
      } else if (action === "delete") {
        const index = state.habits.findIndex((h) => h.id === habit.id);
        undoPayload = { type: "habit", item: { ...habit }, index };
        state.habits.splice(index, 1);
        saveState();
        renderAll();
        showToast("Habit deleted", true);
      }
    });

    // Reset Week & Quick Archive Open
    document.getElementById("resetWeekBtn")?.addEventListener("click", () => {
      if (!confirm("Uncheck all habit boxes for a fresh week?")) return;
      state.habits = state.habits.map((h) => ({
        ...h,
        checks: [false, false, false, false, false, false, false],
        qtyProgress: [0, 0, 0, 0, 0, 0, 0]
      }));
      saveState();
      renderAll();
      showToast("↺ Week reset");
    });

    document.getElementById("openArchiveQuickBtn")?.addEventListener("click", () => {
      document.getElementById("settingsModal")?.classList.remove("hidden");
    });

    // Undo Toast
    document.getElementById("toastUndoBtn")?.addEventListener("click", () => {
      if (!undoPayload) return;
      if (undoPayload.type === "habit") {
        state.habits.splice(undoPayload.index, 0, undoPayload.item);
      } else if (undoPayload.type === "todo") {
        state.todos.splice(undoPayload.index, 0, undoPayload.item);
      }
      undoPayload = null;
      document.getElementById("toastBar")?.classList.add("hidden");
      saveState();
      renderAll();
    });

    // To-Do Workspace
    document.getElementById("todoForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("todoInput");
      const text = input.value.trim();
      if (!text) return;
      state.todos.unshift({
        id: `td_${Date.now()}`,
        text,
        createdAt: Date.now()
      });
      input.value = "";
      playTone(580, 0.07);
      saveState();
      renderAll();
    });

    document.getElementById("todoListContainer")?.addEventListener("change", (e) => {
      const target = e.target;
      if (target.dataset.todoAction === "complete") {
        const idx = state.todos.findIndex((t) => t.id === target.dataset.id);
        if (idx !== -1) {
          const [doneItem] = state.todos.splice(idx, 1);
          state.completedTodos.unshift({ ...doneItem, completedAt: Date.now() });
          awardXP(15);
          playTone(740, 0.1);
          saveState();
          renderAll();
          showToast("✅ To-Do completed! +15 XP");
        }
      }
    });

    document.getElementById("todoListContainer")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-todo-action='delete']");
      if (!btn) return;
      const idx = state.todos.findIndex((t) => t.id === btn.dataset.id);
      if (idx !== -1) {
        const [removed] = state.todos.splice(idx, 1);
        undoPayload = { type: "todo", item: removed, index: idx };
        saveState();
        renderAll();
        showToast("To-Do removed", true);
      }
    });

    document.getElementById("clearCompletedTodosBtn")?.addEventListener("click", () => {
      state.completedTodos = [];
      saveState();
      renderAll();
    });

    // Graph Controls & Tap Tooltip
    document.getElementById("modePctBtn")?.addEventListener("click", () => {
      chartMode = "pct";
      document.getElementById("modePctBtn").classList.add("active");
      document.getElementById("modeCountBtn").classList.remove("active");
      document.getElementById("graphSubtitle").textContent = "Daily weighted completion % (Tap any point)";
      renderAll();
    });

    document.getElementById("modeCountBtn")?.addEventListener("click", () => {
      chartMode = "count";
      document.getElementById("modeCountBtn").classList.add("active");
      document.getElementById("modePctBtn").classList.remove("active");
      document.getElementById("graphSubtitle").textContent = "Tasks completed per day (Tap any point)";
      renderAll();
    });

    document.getElementById("prevWeekBtn")?.addEventListener("click", () => {
      weekOffset -= 1;
      renderAll();
    });

    document.getElementById("nextWeekBtn")?.addEventListener("click", () => {
      if (weekOffset < 0) {
        weekOffset += 1;
        renderAll();
      }
    });

    document.getElementById("modernWeeklyChart")?.addEventListener("click", (e) => {
      const rect = e.target.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const tip = document.getElementById("chartPointTooltip");
      if (!tip || chartPointsCache.length === 0) return;

      let closest = chartPointsCache[0];
      let minDist = Math.abs(clickX - closest.x);
      chartPointsCache.forEach((pt) => {
        const d = Math.abs(clickX - pt.x);
        if (d < minDist) {
          minDist = d;
          closest = pt;
        }
      });

      tip.textContent = `${closest.day}: ${closest.val}${chartMode === "pct" ? "%" : " tasks"}`;
      tip.classList.remove("hidden");
    });

    // Focus Timer Modal Controls
    document.getElementById("timerStartPauseBtn")?.addEventListener("click", toggleTimerRun);
    document.getElementById("timerResetBtn")?.addEventListener("click", () => {
      stopTimerInterval();
      timerState.remainingSeconds = timerState.totalSeconds;
      updateTimerDisplay();
      document.getElementById("timerStartPauseBtn").textContent = "▶ Start";
    });
    document.getElementById("timerCloseBtn")?.addEventListener("click", () => {
      stopTimerInterval();
      document.getElementById("timerModal").classList.add("hidden");
    });

    // Rank-Up Modal Close
    document.getElementById("closeRankUpBtn")?.addEventListener("click", () => {
      document.getElementById("rankUpModal").classList.add("hidden");
    });

    // Weekly Report Card Modal
    document.getElementById("generateReportCardBtn")?.addEventListener("click", () => {
      const m = computeWeeklyMetrics();
      drawWeeklyReportCard(m);
      document.getElementById("reportCardModal").classList.remove("hidden");
    });

    document.getElementById("closeReportModalBtn")?.addEventListener("click", () => {
      document.getElementById("reportCardModal").classList.add("hidden");
    });

    document.getElementById("downloadReportImageBtn")?.addEventListener("click", () => {
      const canvas = document.getElementById("reportCardCanvas");
      const link = document.createElement("a");
      link.download = `discipline-report-${getStreakDayString()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });

    document.getElementById("shareReportImageBtn")?.addEventListener("click", () => {
      const canvas = document.getElementById("reportCardCanvas");
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "discipline-report.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: "My Weekly Discipline Report",
              text: "Check my weekly discipline score!",
              files: [file]
            });
            return;
          } catch {}
        }
        document.getElementById("downloadReportImageBtn")?.click();
      });
    });

    // Streak Freeze Manual Use
    document.getElementById("useFreezeBtn")?.addEventListener("click", () => {
      if ((state.streak.freezesLeft || 0) <= 0) return;
      state.streak.freezesLeft -= 1;
      state.streak.lastDate = getStreakDayString();
      document.getElementById("streakDangerBanner")?.classList.add("hidden");
      saveState();
      renderAll();
      showToast("❄️ Streak Freeze activated for tonight!");
    });

    // Notifications Permission & Settings
    async function requestAndEnableNotifications() {
      if (!("Notification" in window)) {
        showToast("Notifications not supported on this browser");
        return;
      }
      const perm = await Notification.requestPermission();
      const statusText = document.getElementById("notifStatusText");
      if (perm === "granted") {
        state.notifications.enabled = true;
        state.notifications.reminderTime =
          document.getElementById("dailyReminderTimeInput")?.value || "20:00";
        if (statusText) statusText.textContent = "✅ Reminders active!";
        sendSystemNotification("🔔 Discipline Alerts Enabled", "You're protected against missed streaks & overdue To-Dos.");
      } else {
        state.notifications.enabled = false;
        if (statusText) statusText.textContent = "⚠️ Permission blocked in browser/phone settings.";
      }
      saveState();
      renderAll();
    }

    document.getElementById("promptAllowNotifBtn")?.addEventListener("click", requestAndEnableNotifications);
    document.getElementById("promptDismissNotifBtn")?.addEventListener("click", () => {
      state.notifications.dismissedPrompt = true;
      saveState();
      renderAll();
    });

    document.getElementById("enableNotifBtn")?.addEventListener("click", requestAndEnableNotifications);
    document.getElementById("testNotifBtn")?.addEventListener("click", async () => {
      if ("Notification" in window && Notification.permission !== "granted") {
        await requestAndEnableNotifications();
      } else {
        sendSystemNotification("🔥 Test Alert", "Discipline notifications are working properly!");
      }
    });

    // Command Center Settings Modal
    document.getElementById("openSettingsBtn")?.addEventListener("click", () => {
      document.getElementById("settingsModal").classList.remove("hidden");
    });

    document.getElementById("closeSettingsBtn")?.addEventListener("click", () => {
      document.getElementById("settingsModal").classList.add("hidden");
    });

    document.getElementById("saveUserNameBtn")?.addEventListener("click", () => {
      const val = document.getElementById("userNameInput")?.value.trim();
      if (val) {
        state.userName = val;
        saveState();
        renderAll();
        showToast("✅ Name saved");
      }
    });

    document.querySelectorAll(".theme-choice").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.theme = btn.dataset.themeVal;
        saveState();
        applyThemeAndAccent();
        renderAll();
      });
    });

    document.querySelectorAll(".swatch-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.accent = btn.dataset.accentVal;
        saveState();
        applyThemeAndAccent();
      });
    });

    document.getElementById("toggleSoundBtn")?.addEventListener("click", () => {
      state.soundOn = !state.soundOn;
      saveState();
      applyThemeAndAccent();
      if (state.soundOn) playTone(600, 0.08);
    });

    document.getElementById("archivedHabitsList")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-restore-id]");
      if (!btn) return;
      const habit = state.habits.find((h) => h.id === btn.dataset.restoreId);
      if (habit) {
        habit.archived = false;
        saveState();
        renderAll();
        showToast("♻️ Habit restored");
      }
    });

    // Export / Import JSON & Friend Sync Code
    document.getElementById("exportJsonBtn")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `discipline-backup-${getStreakDayString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById("importJsonInput")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(String(reader.result));
          if (imported && Array.isArray(imported.habits)) {
            state = { ...getDefaultState(), ...imported };
            saveState();
            applyThemeAndAccent();
            renderAll();
            showToast("✅ Backup restored!");
          }
        } catch {
          showToast("⚠️ Invalid backup file");
        }
      };
      reader.readAsText(file);
    });

    function copyFriendCode() {
      const m = computeWeeklyMetrics();
      const payload = btoa(
        JSON.stringify({
          name: state.userName || "Friend",
          pct: m.weeklyPct,
          streak: state.streak.count
        })
      );
      navigator.clipboard?.writeText(payload).catch(() => {});
      showToast("🔗 Friend Sync Code copied!");
    }

    function promptAddFriendCode() {
      const code = prompt("Paste your friend's Discipline Sync Code:");
      if (!code) return;
      try {
        const parsed = JSON.parse(atob(code.trim()));
        if (parsed && parsed.name && typeof parsed.pct === "number") {
          state.friends = state.friends.filter((f) => f.name !== parsed.name);
          state.friends.push({
            name: String(parsed.name).slice(0, 24),
            pct: Math.min(100, Math.max(0, Math.round(parsed.pct))),
            streak: Math.max(1, Number(parsed.streak) || 1)
          });
          saveState();
          renderAll();
          showToast(`✅ Added ${parsed.name} to leaderboard!`);
        }
      } catch {
        showToast("⚠️ Invalid friend code");
      }
    }

    document.getElementById("copySyncCodeBtn")?.addEventListener("click", copyFriendCode);
    document.getElementById("loadSyncCodeBtn")?.addEventListener("click", promptAddFriendCode);
    document.getElementById("addFriendScoreBtn")?.addEventListener("click", promptAddFriendCode);

    window.addEventListener("resize", () => {
      if (activeTab === "graph") renderAll();
    });
  }

  function renderAll() {
    const metrics = computeWeeklyMetrics();
    renderHeroAndQuote(metrics);
    renderHabits(metrics);
    renderTodos();
    renderGraphAndHeatmap(metrics);
    renderRankAndGamification(metrics);
    renderSettingsLists();
    checkSmartAlerts(metrics);
  }

  // Register Service Worker for 100% Offline Airplane Mode
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  // Boot App
  applyThemeAndAccent();
  syncStreakAndWeekRollover();
  setupEventListeners();
  updateCountdownClock();
  renderAll();

  // Check every 15s for 12:01 AM rollover & smart notifications
  setInterval(() => {
    syncStreakAndWeekRollover();
    updateCountdownClock();
    const metrics = computeWeeklyMetrics();
    renderHeroAndQuote(metrics);
    checkSmartAlerts(metrics);
  }, 15000);
})();