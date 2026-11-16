const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATE_KEY = "discipline_super_state_v5";
const APP_LOCK_KEY = "discipline_is_installed_app";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// =========================================================================
// ALL 500+ MOTIVATIONAL QUOTES (LOCKED ALL DAY; ADVANCES +1 AT 12:01 AM)
// =========================================================================
const RAW_QUOTES_TEXT = `
"Discipline is choosing what you want most over what you want now."
"Small steps every day beat big plans never started."
"You don't need motivation. You need a routine."
"Do it tired. Do it bored. Do it anyway."
"Your future self is watching what you do today."
"Consistency beats intensity every single time."
"Show up even when you don't feel like it."
"Every checked box is a vote for the person you want to become."
"Discipline is a muscle. Train it daily."
"Today's effort is tomorrow's confidence."
"Don't wait for the mood. Create the momentum."
"The pain of discipline is lighter than the pain of regret."
"Be the person who keeps promises to yourself."
"One more rep. One more page. One more hour."
"Winners are built in the boring moments."
"Start now. Perfect later."
"You are one habit away from a different life."
"Stop negotiating with your alarm clock."
"Hard days build strong people."
"Progress is quiet, but it adds up loudly."
"Nobody is coming to save you. Get up and build it."
"Your habits are writing your future. Edit them carefully."
"Doing it badly beats not doing it at all."
"Excuses feel comfortable, but they build nothing."
"The version of you that you want is waiting on the other side of today's work."
"Discipline is self-respect in action."
"Make it a rule: no zero days."
"Win the morning, and you win the day."
"Motivation gets you started. Habit keeps you going."
"Do what needs to be done before you want to do it."
"Every day you skip makes the next skip easier. Break the chain of excuses."
"Be stronger than your strongest excuse."
"You become what you repeatedly do."
"Pressure makes diamonds, and daily effort makes champions."
"Don't count the days. Make the days count."
"The grind is quiet. The results are loud."
"Your goals don't care about your mood."
"Choose the hard path today so life is easier tomorrow."
"A little progress each day adds up to big results."
"Quit waiting. Start working."
"Discipline today, freedom tomorrow."
"Be consistent when nobody is watching."
"Don't stop when you're tired. Stop when you're done."
"Make your routine so strong that excuses can't fit inside it."
"Follow your plan, not your feelings."
"The easiest time to quit is right before the breakthrough."
"Today is a perfect day to be better than yesterday."
"Your only competition is who you were yesterday."
"Success is a pile of small disciplines done daily."
"Be so consistent that doubt gets bored and leaves."
"If it matters to you, you will find a way. If not, you'll find an excuse."
"Don't break the streak. Protect it like it's gold."
"Every streak starts with day one. Make today day one."
"Your streak is proof that you keep your word."
"A streak isn't built in a week. It's built one day at a time."
"Missed a day? Fine. Never miss two."
"One day or day one. You decide."
"The streak you protect will protect your future."
"Fire up the streak, and keep the flame alive."
"Keep the fire burning, one day at a time."
"Every sunrise is another chance to extend the streak."
"Streaks are made by people who refuse to quit."
"Focus is saying no to a hundred good things so you can do one great thing."
"Put your phone down and pick your future up."
"Deep work today, deep results tomorrow."
"Distraction is the enemy of dreams."
"Where your attention goes, your life goes."
"One task. Full focus. Zero excuses."
"Silence the noise and hear your goals."
"You can't build a big life with scattered effort."
"Concentrate your energy like a laser, not a flashlight."
"Mute the world for an hour and build something."
"Attention is your most valuable currency. Spend it wisely."
"Do one thing at a time, and do it well."
"Focus on the next step, not the whole staircase."
"Clear mind, clear goals, clear progress."
"Scrolling won't build your future. Working will."
"The world is loud. Stay locked in."
"Eliminate distractions, and watch your progress speed up."
"Your focus today decides your results next year."
"A focused hour beats a distracted day."
"Lock in. Block out. Level up."
"Study now, so your future self can thank you."
"Every page you read is a step ahead of who you were."
"Learning is the only investment that always pays."
"Thirty minutes of study a day will change your life in a year."
"Knowledge builds slowly, then all at once."
"Don't memorize the answers. Understand the questions."
"Open the book. The rest follows."
"Exams are temporary. What you learn stays."
"Hard subjects are just easy subjects you haven't practiced enough."
"Be a student for life, and you'll never stop growing."
"The more you learn, the more doors open."
"Smart is not born. Smart is built, one hour at a time."
"Revise today, relax on result day."
"Today's homework is tomorrow's advantage."
"Study like your dream depends on it, because it does."
"Your brain grows every time you struggle with something new."
"Confusion is the first step to understanding."
"Keep learning, keep leveling up."
"Questions are the start of every discovery."
"A good student isn't the one who knows it all, but the one who keeps trying."
"Code a little every day, and one day you'll build anything."
"Every bug you fix makes you a better developer."
"Don't just watch tutorials. Build something."
"Great programmers aren't born. They're debugged."
"Ship it, learn from it, improve it."
"Today's error message is tomorrow's experience."
"Write code today that your future self will thank you for."
"One line at a time, you can build an empire."
"Practice builds skill, and skill builds opportunity."
"The best developers are the ones who never stop practicing."
"Failing tests are just lessons in disguise."
"Build projects, break things, and learn fast."
"Skills are built in the dark, and the results show in the light."
"Keep coding, keep learning, keep growing."
"Master the basics, and the advanced becomes easy."
"Your body can handle almost anything. It's your mind you have to convince."
"Sweat today, shine tomorrow."
"The workout you skip is the one you needed most."
"Strong body, strong mind, strong life."
"Don't wish for a better body. Work for it."
"Train like it matters, because it does."
"The first mile is always the hardest. Keep going."
"You never regret a workout. You only regret skipping it."
"Stronger than yesterday, weaker than tomorrow."
"Your health is your wealth. Invest daily."
"Move your body, and your mind will follow."
"Get up, get moving, get better."
"Every rep builds more than muscle. It builds character."
"Pain is temporary. Pride lasts."
"Run when you want to quit."
"Take care of your body. It's the only place you have to live."
"Fitness is not a phase. It's a lifestyle."
"A 30-minute workout is only 2% of your day. No excuses."
"Be proud of every step you take toward a healthier you."
"Your body keeps the score of every effort you make."
"Rest if you must, but never quit."
"Sleep well, eat well, train hard, repeat."
"Failure is just feedback. Take it and try again."
"Fall seven times, stand up eight."
"A setback is a setup for a comeback."
"The strongest people are the ones who rise after every fall."
"You haven't failed until you stop trying."
"Scars are proof that you kept going."
"Every master was once a disaster."
"Mistakes mean you're trying. Keep trying."
"Be patient with yourself. Growth takes time."
"Rock bottom is a solid foundation to build on."
"Storms make trees take deeper roots."
"Tough times don't last, but tough people do."
"Hard moments are shaping you, not breaking you."
"The comeback is always stronger than the setback."
"Don't let one bad day become a bad week."
"If you fall today, get up tomorrow with more fire."
"Courage is getting back up when everything says stay down."
"The only real failure is not learning from it."
"Get knocked down, get back up, and go harder."
"You are stronger than you think and braver than you feel."
"Your struggle is building the person your dreams need."
"Resilience is built in the moments you wanted to quit."
"You've survived every bad day so far. Keep going."
"Quitting is permanent. Resting is not."
"Turn your pain into progress."
"Breakdown today, breakthrough tomorrow."
"Believe in yourself even when no one else does."
"Your mindset is your superpower."
"Think like a winner, then act like one."
"If you can dream it, you can plan it. If you can plan it, you can do it."
"Negative thoughts are visitors. Don't give them a room."
"Replace 'I can't' with 'I'll find a way.'"
"What you think about, you become."
"Your attitude decides your altitude."
"Don't let a bad moment turn into a bad mindset."
"Be your own biggest fan."
"Belief comes first, results follow."
"A strong mind turns obstacles into stepping stones."
"Talk to yourself like someone you love."
"Confidence is built by keeping small promises to yourself."
"Your mind is a garden. Plant good thoughts."
"You are capable of more than you imagine."
"Doubt kills more dreams than failure ever will."
"The mind quits first. Don't let it win."
"Think big, start small, move fast."
"Positive energy attracts positive results."
"You don't need to be fearless. Just don't let fear drive."
"Your thoughts shape your reality. Choose wisely."
"Time is the one thing you can't earn back. Use it well."
"You have the same 24 hours as everyone who's winning."
"Stop saying you don't have time. You have priorities."
"Spend your time like it's money, and invest it in your dreams."
"Every minute wasted is a minute you can't get back."
"Plan your day or someone else will plan it for you."
"Don't be busy. Be productive."
"Today will never come again. Make it count."
"Five minutes of effort is better than five hours of regret."
"Time passes either way. Make it pass with progress."
"The best time to start was yesterday. The next best time is now."
"A day well spent brings a peaceful night."
"Use your time to build, not just to pass."
"Hours become years faster than you think. Spend them wisely."
"Do the most important thing first."
"Your schedule reveals your priorities."
"Be early, be ready, be relentless."
"Make every hour a step toward your goal."
"Wake up with purpose, and sleep with pride."
"The early morning belongs to those who want more."
"Get up. Dress up. Show up."
"A good morning routine sets the tone for greatness."
"While others sleep, you build your future."
"Rise before the excuses do."
"Morning discipline is the foundation of a successful day."
"The first hour of your day is the rudder of the day."
"Make your bed, make your day."
"Start your day with a win, and the rest will follow."
"Every morning is a fresh page. Write something great."
"The sunrise is proof that you can start again."
"Wake up and be awesome."
"Beat the sun to the grind."
"Early to rise, early to win."
"Finish the day strong, and tomorrow starts easy."
"Reflect tonight, improve tomorrow."
"Sleep is not laziness. It's recovery for greatness."
"Close the day with gratitude and open tomorrow with purpose."
"Before you rest, ask: did I do my best today?"
"End the day proud of what you did."
"Tonight's rest powers tomorrow's results."
"Check your tasks, tick your boxes, sleep in peace."
"A productive night starts with a prepared tomorrow."
"Today's mistakes are tomorrow's lessons. Sleep on it."
"Go to bed knowing you gave it your all."
"Finish what you started, then finally rest."
"Don't end the day with unfinished promises to yourself."
"Goals without a plan are just wishes."
"Set goals that scare you a little."
"A big dream needs small daily actions."
"Write your goals down, then go chase them."
"Break big goals into small wins."
"Aim high and work harder."
"Dreams don't work unless you do."
"Your goals are waiting. Go get them."
"Know your why, and the how will follow."
"Set the target, start the journey, enjoy the climb."
"A goal without a deadline is just a dream."
"Be so focused on your goals that nothing else matters."
"Keep your eyes on the prize and your hands to the grind."
"Every big achievement was once a small goal."
"The difference between a dream and a goal is action."
"Success starts with a decision to try."
"Success is not luck. It's repeated effort."
"Success is the sum of small efforts repeated day in and day out."
"Great things never come from comfort zones."
"Your comfort zone is a beautiful place, but nothing grows there."
"Be uncomfortable now, be unstoppable later."
"Growth begins where comfort ends."
"Do something today that your future self will thank you for."
"Do one thing every day that scares you."
"Step out of your comfort zone and into your power."
"What feels hard today will feel easy tomorrow."
"The magic happens just outside your comfort zone."
"Stretch yourself. That's how you grow."
"Make progress, not excuses."
"Hustle in silence and let success make the noise."
"Work hard in silence. Let your results speak."
"Dream big, work harder."
"Success doesn't come to you. You go to it."
"Nothing worth having comes easy."
"Work until your idols become your rivals."
"Be a rare kind of person: one who actually follows through."
"Don't chase success. Become someone who deserves it."
"The harder you work, the luckier you get."
"Greatness is built daily, not found suddenly."
"If it was easy, everyone would do it."
"Aim to be better than you were yesterday."
"Make today so good that yesterday gets jealous."
"Don't be afraid to start over. It's a chance to build better."
"You don't have to be great to start, but you have to start to be great."
"There's no elevator to success. Take the stairs."
"Do not let what you cannot do stop you from doing what you can."
"No one ever drowned in sweat."
"Hard work beats talent when talent doesn't work hard."
"Make it happen. Shock everyone."
"Be proud of how far you've come and focus on how far you can go."
"Little by little, a little becomes a lot."
"Patience is working hard while you wait."
"Slow progress is still progress."
"Don't rush the process. Trust it."
"Great things take time, so give it time."
"Rome wasn't built in a day, but they were laying bricks every hour."
"Keep going. Your effort is invisible until it isn't."
"Results take time. Effort takes only today."
"Plant the seeds today, and the harvest will come."
"Trust the process, even when it's slow."
"The best view comes after the hardest climb."
"Don't dig up the seed every day to check if it's growing."
"Stay patient, stay consistent, stay hungry."
"Growth is slow, but quitting is slower."
"Every expert was once a beginner who didn't quit."
"No excuses. Only results."
"Excuses don't burn calories, finish tasks, or build futures."
"You can have results or excuses, but not both."
"Stop saying tomorrow. Tomorrow never comes."
"If you want it, you'll find a way. If not, a reason."
"Complaining doesn't change anything. Action does."
"Don't tell me how busy you are. Show me what you've done."
"Blame no one. Do the work."
"The best way to get something done is to begin."
"Procrastination is the thief of progress."
"Done is better than perfect."
"Don't think about it, just begin."
"Later is a lie. Do it now."
"Excuses are the nails used to build a house of failure."
"Cut the excuses, keep the promises."
"You are the only one stopping you."
"The only way to do it is to do it."
"You're not tired. You're uninspired. Find your why."
"Act now. Regret nothing."
"Take the first step. The path appears as you walk."
"Action cures fear."
"Begin where you are. Use what you have. Do what you can."
"Self-discipline is self-love."
"Respect yourself enough to do what's good for you."
"Treat your goals like they matter, because you do."
"You owe it to yourself to try."
"Be proud of yourself for showing up today."
"Take care of your mind like you take care of your phone. Recharge it."
"You are worth the effort."
"Love yourself enough to build a better life."
"Your habits are a reflection of how much you value yourself."
"You deserve the life you're working for."
"Be kind to yourself, and keep going."
"Don't compare your chapter one to someone else's chapter twenty."
"Be the reason you smile tomorrow."
"Your life changes when you decide to change it."
"Choose growth over comfort every time."
"Be the energy you want to attract."
"Surround yourself with people who push you up."
"Your circle should challenge you to grow."
"Be around people who make your goals feel normal."
"Inspire others by finishing what you start."
"You are the average of the habits you keep."
"Be the example you wish you had."
"Lift others as you rise."
"Good habits are the quiet architects of a great life."
"Build habits, and habits will build you."
"Habits shape destiny. Choose them wisely."
"Break bad habits before they break you."
"Replace one bad habit with one good habit today."
"You don't rise to the level of your goals. You fall to the level of your habits."
"First you make your habits, then your habits make you."
"A good habit repeated becomes a superpower."
"Make good habits easy and bad habits hard."
"Stack small habits and watch your life level up."
"The secret of your future is hidden in your daily routine."
"Tiny habits, massive results."
"Habits are the compound interest of self-improvement."
"What you do daily matters more than what you do occasionally."
"Start with two minutes. Momentum does the rest."
"Courage doesn't mean you're not afraid. It means you move anyway."
"Be brave enough to start and strong enough to finish."
"Fear is a liar. Move forward."
"The scariest step is the first one. Take it."
"Do it scared."
"Bravery is just fear that said its prayers and went to work."
"Take the risk, or lose the chance."
"What if it works? Try and see."
"Every great journey starts with a single brave step."
"Don't fear failure. Fear never trying."
"You'll never know your limit until you push past it."
"Believe it, then build it."
"Sacrifice now, celebrate later."
"Give up the short-term pleasure for the long-term win."
"You can't have a million-dollar dream with a minimum-wage work ethic."
"Skip the party, finish the plan."
"Every sacrifice today is an investment in tomorrow."
"Trade comfort for progress."
"Say no to what's easy so you can say yes to what's great."
"Willpower is a decision, not a feeling."
"The things you give up today will give back tomorrow."
"Choose discipline over regret."
"Hunger is better than comfort when chasing a dream."
"Let your goals cost you your excuses."
"Reward yourself for the work, not for the wish."
"Celebrate small wins. They're the stepping stones of success."
"Every tick is a victory. Count them."
"Perfect weeks are made of ordinary days done right."
"One hundred percent today. That's all it takes."
"Finish every day with a full checklist and a proud heart."
"A completed checklist is a day well lived."
"Check the box, build the habit, become the person."
"Be proud of the small wins. They build the big ones."
"Every task you complete is a promise you kept."
"Tick it off and move on to the next victory."
"When the list is done, the mind is free."
"You can't improve what you don't track."
"Track your habits, and you'll track your growth."
"Level up your life, one task at a time."
"Rank up by showing up."
"From noob to master, it's all about repetition."
"Master level starts with beginner effort repeated daily."
"Grandmasters are made one day at a time."
"Be untouchable by being unstoppable."
"Every legend started as a beginner who kept going."
"Climb the ranks with consistent effort, not talent alone."
"Earn your rank every single day."
"Become the version of yourself that others look up to."
"The top is not a place. It's a habit."
"Untouchable is not a title. It's a lifestyle."
"Don't aim to be the best. Aim to be better than yesterday, every day."
"Level 100 starts with level 1 consistency."
"Be legendary in your own story."
"A champion is someone who gets up when they can't."
"Winners focus on winning. Losers focus on winners."
"Champions train when nobody is clapping."
"Dedication looks different when no one is watching."
"Greatness lives on the other side of consistent effort."
"Run your own race and be proud of your pace."
"The difference between ordinary and extraordinary is that little extra."
"Do something today that your future self will brag about."
"If you're going through hell, keep going."
"Believe you can, and you're halfway there."
"Nothing changes if nothing changes."
"Your time is now. Don't waste it waiting."
"Make your future self proud."
"Dream. Plan. Execute. Repeat."
"You're closer than you think. Keep going."
"The only bad workout is the one that didn't happen."
"The best project you'll ever work on is you."
"Don't stop now. You've come too far."
"Keep pushing. Your breakthrough is near."
"Today's pain is tomorrow's power."
"Stay hungry, stay humble, stay consistent."
"Do the work. Trust the process. Enjoy the results."
"Your dreams are valid. Now go make them real."
"Hard work makes dreams come true."
"It always seems impossible until it's done."
"You are not behind. You are on your own timeline."
"Make today's version of you proud of yesterday's version."
"Your goals are closer than your excuses."
"You were built for this. Keep going."
"The grind never lies."
"Choose progress over perfection."
"Be fearless in the pursuit of what sets your soul on fire."
"Think less, do more."
"Stay on track, even when the road gets rough."
"Let discipline carry you when motivation leaves."
"The only limit is the one you set yourself."
"It's not about being the best. It's about being better than before."
"A little discipline today saves a lot of struggle tomorrow."
"Build the life you want, brick by brick."
"Today's goal: don't quit."
"No shortcuts. Just steady steps."
"A year from now you'll wish you had started today."
"Success is rented, and the rent is due every day."
"Don't wait for opportunity. Create it."
"Your best work is ahead of you."
"Everything you want is on the other side of consistency."
"Be relentless in the pursuit of your better self."
"The harder the battle, the sweeter the victory."
"Discipline turns dreams into plans, and plans into reality."
"Keep your promises to yourself, and the world will keep its promises to you."
"One percent better every day makes you unrecognizable in a year."
"Own your day before it owns you."
"What you do today can improve all your tomorrows."
"Don't stop until you're proud."
"Your effort will never go to waste."
"Chase progress, not applause."
"Give your best today and let tomorrow take care of itself."
"Believe in the work you're putting in."
"Quiet discipline builds loud success."
"The hardest part is starting. The second hardest is continuing. Do both."
"Every effort counts. Every day matters."
"A strong routine is a strong future."
"Get 1% better, 100% of the time."
"Don't give up on the day. Give it everything."
"Rise, grind, repeat."
"Hold the line. The reward is coming."
"Mind over mood."
"Fall in love with the process, and results will follow."
"Make the most of today. It's a gift."
"Today is your chance to prove yesterday wrong."
"Do it for the person you'll be a year from now."
"Work now, thank yourself later."
"Your work ethic is your legacy."
"Be better than your last best."
"If you commit, follow through."
"Another day, another chance to be great."
"Fuel your dreams with daily effort."
"Make every day your masterpiece."
"Let your actions be louder than your plans."
"Turn up the discipline, turn down the excuses."
"The grind is where legends are made."
"Take pride in your daily progress, however small."
"Stay committed to your decisions but flexible in your approach."
"Persistence beats resistance."
"Don't be afraid of slow progress. Be afraid of standing still."
"Strive for progress, not perfection."
"Your daily choices write your life story."
"The best way to predict your future is to build it."
"Never underestimate the power of showing up."
"Success is a habit. So is failure. Choose wisely."
"Be ruthless with your time and kind with your heart."
"Tomorrow's success is built on today's discipline."
"Today, you are one step closer to your dream."
"Stay focused, stay driven, stay unstoppable."
"A disciplined mind is a free mind."
"Keep your head up, your standards high, and your effort higher."
"You've got this. Go prove it."
"Do the hard thing. Then do it again tomorrow."
"Done is powerful. Consistent is unstoppable."
"You've already started. Now keep going."
"Never give up on the person you're becoming."
"Believe in the daily grind."
"Even the smallest step is a step forward."
"Nobody cares. Work harder, and then they'll notice."
"Make the effort, and the result will make sense."
"Stop wishing. Start doing."
"Your next level is waiting for you to earn it."
"Respect the process, and the process will respect you."
"What you do every day matters more than what you do once in a while."
"Be someone who makes things happen."
"You become unstoppable when you stop making excuses."
"Don't just dream of success. Schedule it."
"Your discipline will outlast your motivation."
"Never stop becoming."
"Dedicate yourself to being better each day."
"Win your day, win your life."
"A better you starts with a better today."
"Don't be average. Be consistent."
"Every day is a new chance to level up."
"Keep going. The best is yet to come."
"It's you versus you. Win."
"You're not stuck. You're just not moving yet."
"Make it happen, one day at a time."
"The dream is free. The hustle is sold separately."
"Finish strong, every single day."
`;

const QUOTES_LIST = RAW_QUOTES_TEXT
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l.length > 0)
  .map((l) => l.replace(/^["“]+|["”]+$/g, ""));

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
// 1. 12:01 AM ROLLOVER DATE HELPERS
// ==========================================
function getRolledDate(dateObj = new Date()) {
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
// 2. STATE INITIALIZATION
// ==========================================
function loadInitialState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STATE_KEY));
    if (saved && Array.isArray(saved.habits)) return saved;
  } catch (_) {}

  const currentWeek = getWeekStartKey(0);
  return {
    userName: "Warrior",
    theme: "aurora",
    accent: "pink",
    soundEnabled: true,
    xp: 40,
    totalChecksEver: 5,
    todosCompletedEver: 0,
    timersCompletedEver: 0,
    lastCelebratedRank: "Noob",
    quoteIndex: 0,
    notifPromptDismissed: false,
    lastNotifDay: "",
    lastDangerNotifDay: "",
    claimedChallenges: {},
    streak: {
      count: 1,
      longest: 1,
      lastDate: getDayKey(),
      freezesLeft: 1,
      freezeMonth: getMonthKey()
    },
    habits: [
      {
        id: "h_1",
        name: "Daily 30 min Exercise",
        category: "Fitness",
        type: "check",
        qtyTarget: 1,
        priority: true,
        note: "No zero days",
        timerMins: 30,
        reminderTime: "",
        activeDays: [true, true, true, true, true, true, true],
        archived: false,
        weekLogs: { [currentWeek]: [true, true, false, false, false, false, false] },
        qtyLogs: {}
      },
      {
        id: "h_2",
        name: "Read 20 Pages",
        category: "Study",
        type: "check",
        qtyTarget: 1,
        priority: false,
        note: "Deep focus reading",
        timerMins: 25,
        reminderTime: "",
        activeDays: [true, true, true, true, true, true, true],
        archived: false,
        weekLogs: { [currentWeek]: [true, false, false, false, false, false, false] },
        qtyLogs: {}
      },
      {
        id: "h_3",
        name: "Drink 8 Glasses Water",
        category: "Health",
        type: "qty",
        qtyTarget: 8,
        priority: false,
        note: "",
        timerMins: 0,
        reminderTime: "",
        activeDays: [true, true, true, true, true, true, true],
        archived: false,
        weekLogs: { [currentWeek]: [true, true, false, false, false, false, false] },
        qtyLogs: { [currentWeek]: [8, 8, 0, 0, 0, 0, 0] }
      }
    ],
    todos: [
      { id: "td_1", text: "Computer Class work", createdAt: Date.now(), lastOverdueNotifDay: "" }
    ],
    completedTodosToday: [],
    dailyHistory: {},
    friends: [
      { name: "Arjun (Rival)", pct: 84, streak: 12 },
      { name: "Vikram (Rival)", pct: 68, streak: 6 }
    ],
    reminderTime: "20:00"
  };
}

let state = loadInitialState();
let weekOffset = 0;
let chartMode = "pct";
let lastMetricsSnapshot = null;
let lastDeletedTodo = null;
let forceAppPreview = false;
let activeTimer = { habitId: null, totalSec: 0, remainingSec: 0, interval: null, running: false };

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

// ==========================================
// 3. PERMANENT OFFLINE APP-MODE DETECTION
// ==========================================
function isInstalledAppMode() {
  if (forceAppPreview) return true;
  if (localStorage.getItem(APP_LOCK_KEY) === "1") return true;

  const params = new URLSearchParams(window.location.search);
  const detectedApp =
    params.get("mode") === "app" ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    window.navigator.standalone === true ||
    (document.referrer && document.referrer.includes("android-app://"));

  if (detectedApp) {
    localStorage.setItem(APP_LOCK_KEY, "1");
    return true;
  }
  return false;
}

function applyEnvironmentAndTheme() {
  const inApp = isInstalledAppMode();
  document.getElementById("webLandingView").classList.toggle("hidden", inApp);
  document.getElementById("mainAppShell").classList.toggle("hidden", !inApp);

  document.documentElement.setAttribute("data-theme", state.theme || "aurora");
  document.documentElement.setAttribute("data-accent", state.accent || "pink");
  document.getElementById("userNameInput").value = state.userName || "Warrior";
  document.getElementById("dailyReminderTimeInput").value = state.reminderTime || "20:00";
  document.getElementById("toggleSoundBtn").textContent =
    state.soundEnabled === false ? "🔇 Sound: OFF" : "🔊 Sound: ON";
}

document.getElementById("previewAppInBrowserBtn").addEventListener("click", () => {
  forceAppPreview = true;
  applyEnvironmentAndTheme();
  setupNotificationPrompt();
  renderAll();
});

// ==========================================
// 4. NOTIFICATIONS (STREAK ENDING + 1-DAY OVERDUE TO-DOS)
// ==========================================
function sendSystemNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => {
        reg.showNotification(title, {
          body,
          icon: "./icon-512.png",
          badge: "./icon-512.png",
          vibrate: [200, 100, 200]
        });
      })
      .catch(() => {
        try {
          new Notification(title, { body, icon: "./icon-512.png" });
        } catch (_) {}
      });
  } else {
    try {
      new Notification(title, { body, icon: "./icon-512.png" });
    } catch (_) {}
  }
}

function getPendingSummary() {
  const todayIdx = getRolledDate().getDay();
  const wkKey = getWeekStartKey(0);
  const activeToday = state.habits.filter((h) => !h.archived && h.activeDays[todayIdx]);
  const tasksLeft = activeToday.filter((h) => !h.weekLogs?.[wkKey]?.[todayIdx]).length;
  const todosLeft = state.todos.length;
  return { tasksLeft, todosLeft };
}

function setupNotificationPrompt() {
  const card = document.getElementById("notifPromptCard");
  if (!("Notification" in window)) return;

  if (Notification.permission === "default" && !state.notifPromptDismissed) {
    card.classList.remove("hidden");
  } else {
    card.classList.add("hidden");
  }

  if (Notification.permission === "granted") {
    document.getElementById("notifStatusText").textContent =
      `✅ Active! Daily reminder at ${state.reminderTime}, Streak-Ending alert at 9:00 PM & 1-Day Overdue To-Do alerts.`;
  }
}

async function requestNotificationAccess() {
  if (!("Notification" in window)) {
    showToast("Notifications are not supported here.");
    return;
  }
  const perm = await Notification.requestPermission();
  document.getElementById("notifPromptCard").classList.add("hidden");
  if (perm === "granted") {
    const { tasksLeft, todosLeft } = getPendingSummary();
    sendSystemNotification(
      "🔥 Discipline Notifications Allowed!",
      `You have ${tasksLeft} habit(s) and ${todosLeft} To-Do item(s) pending. We'll alert you before your streak ends or if a To-Do crosses 1 day!`
    );
    showToast("✅ Notifications enabled!");
    setupNotificationPrompt();
    checkScheduledAndOverdueNotifications();
  } else {
    showToast("⚠️ Please allow notifications in your phone's App Info settings.");
  }
}

document.getElementById("promptAllowNotifBtn").addEventListener("click", requestNotificationAccess);
document.getElementById("promptDismissNotifBtn").addEventListener("click", () => {
  state.notifPromptDismissed = true;
  saveState();
  document.getElementById("notifPromptCard").classList.add("hidden");
});

document.getElementById("enableNotifBtn").addEventListener("click", () => {
  state.reminderTime = document.getElementById("dailyReminderTimeInput").value || "20:00";
  saveState();
  requestNotificationAccess();
});

document.getElementById("testNotifBtn").addEventListener("click", () => {
  if (Notification.permission !== "granted") {
    requestNotificationAccess();
    return;
  }
  const { tasksLeft, todosLeft } = getPendingSummary();
  sendSystemNotification(
    "⚠️ Your Streak is About to End!",
    `Finish your ${tasksLeft} daily habit(s) and ${todosLeft} To-Do item(s) before 12:01 AM!`
  );
  showToast("🔔 Test notification sent!");
});

function checkScheduledAndOverdueNotifications() {
  const now = new Date();
  const nowMs = now.getTime();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const currentHHMM = `${hh}:${mm}`;
  const todayKey = getDayKey(now);
  const { tasksLeft, todosLeft } = getPendingSummary();

  let stateChanged = false;
  state.todos.forEach((todo) => {
    const createdAt = todo.createdAt || nowMs;
    if (nowMs - createdAt >= ONE_DAY_MS && todo.lastOverdueNotifDay !== todayKey) {
      todo.lastOverdueNotifDay = todayKey;
      stateChanged = true;
      const daysOverdue = Math.floor((nowMs - createdAt) / ONE_DAY_MS);
      sendSystemNotification(
        `⏰ Overdue To-Do (${daysOverdue}d+): ${todo.text}`,
        `You added "${todo.text}" over ${daysOverdue} day(s) ago and still haven't completed it. Finish & tick it off today!`
      );
    }
  });
  if (stateChanged) saveState();

  if ((tasksLeft > 0 || todosLeft > 0) && currentHHMM === state.reminderTime && state.lastNotifDay !== todayKey) {
    state.lastNotifDay = todayKey;
    saveState();
    sendSystemNotification(
      "⚡ Daily Discipline Reminder",
      `You have ${tasksLeft} daily task(s) and ${todosLeft} To-Do item(s) remaining today.`
    );
  }

  if ((tasksLeft > 0 || todosLeft > 0) && now.getHours() === 21 && now.getMinutes() === 0 && state.lastDangerNotifDay !== todayKey) {
    state.lastDangerNotifDay = todayKey;
    saveState();
    sendSystemNotification(
      `⚠️ Your ${state.streak.count}-Day Streak is About to End!`,
      `Complete your remaining ${tasksLeft} habit(s) and ${todosLeft} To-Do(s) before 12:01 AM or lose your streak!`
    );
  }

  const todayIdx = getRolledDate(now).getDay();
  const wkKey = getWeekStartKey(0);
  state.habits.forEach((h) => {
    if (!h.archived && h.activeDays[todayIdx] && h.reminderTime === currentHHMM) {
      const done = h.weekLogs?.[wkKey]?.[todayIdx];
      const tag = `${todayKey}_${h.id}`;
      if (!done && h._lastAlert !== tag) {
        h._lastAlert = tag;
        sendSystemNotification(`🔔 Habit Time: ${h.name}`, h.note || "Complete this task now to protect your streak!");
      }
    }
  });
}

// ==========================================
// 5. SOUND EFFECTS & CONFETTI
// ==========================================
function playTone(type = "check") {
  if (state.soundEnabled === false) return;
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
    } else {
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
  document.getElementById("toastMessage").textContent = msg;
  document.getElementById("toastUndoBtn").classList.toggle("hidden", !withUndo);
  bar.classList.remove("hidden");
  clearTimeout(bar._timer);
  bar._timer = setTimeout(() => bar.classList.add("hidden"), 3500);
}

// ==========================================
// 6. 12:01 AM STREAK +1 & LOCKED DAILY QUOTE
// ==========================================
function syncStreakAndClock() {
  const todayKey = getDayKey();
  const monthKey = getMonthKey();

  if (state.streak.freezeMonth !== monthKey) {
    state.streak.freezeMonth = monthKey;
    state.streak.freezesLeft = 1;
  }

  const diff = dayDiff(state.streak.lastDate, todayKey);
  if (diff === 1) {
    state.streak.count += 1;
    state.streak.lastDate = todayKey;
    state.quoteIndex = ((state.quoteIndex || 0) + 1) % QUOTES_LIST.length;
    if (state.streak.count > state.streak.longest) {
      state.streak.longest = state.streak.count;
    }
    showToast(`🔥 Streak +1 (${state.streak.count} Days) & New Daily Quote!`);
  } else if (diff > 1) {
    if (diff === 2 && state.streak.freezesLeft > 0) {
      state.streak.freezesLeft -= 1;
      state.streak.lastDate = todayKey;
      state.quoteIndex = ((state.quoteIndex || 0) + 1) % QUOTES_LIST.length;
      showToast("❄️ Monthly Streak Freeze protected your streak!");
    } else {
      state.streak.count = 1;
      state.streak.lastDate = todayKey;
      state.quoteIndex = ((state.quoteIndex || 0) + 1) % QUOTES_LIST.length;
    }
  }

  saveState();

  document.getElementById("streakCount").textContent = state.streak.count;
  document.getElementById("freezeCountChip").textContent = `❄️${state.streak.freezesLeft}`;
  document.getElementById("longestStreakStat").textContent = state.streak.longest;
  document.getElementById("freezeVaultStat").textContent = state.streak.freezesLeft;

  const qIdx = (state.quoteIndex || 0) % QUOTES_LIST.length;
  document.getElementById("quoteCounterLabel").textContent =
    `DAILY QUOTE #${qIdx + 1}/${QUOTES_LIST.length} • UPDATES AT 12:01 AM`;
  document.getElementById("dailyQuoteText").textContent = `"${QUOTES_LIST[qIdx]}"`;

  const now = new Date();
  const nextRollover = new Date(now);
  nextRollover.setHours(24, 1, 0, 0);
  const minsLeft = Math.max(1, Math.floor((nextRollover - now) / 60000));
  document.getElementById("resetCountdownText").textContent =
    `Next streak +1 in ${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m (12:01 AM)`;
}

document.getElementById("useFreezeBtn").addEventListener("click", () => {
  if (state.streak.freezesLeft <= 0) {
    showToast("No Monthly Streak Freezes left!");
    return;
  }
  state.streak.freezesLeft -= 1;
  state.streak.lastDate = getDayKey();
  saveState();
  syncStreakAndClock();
  document.getElementById("streakDangerBanner").classList.add("hidden");
  showToast("❄️ Streak Freeze applied for tonight!");
});

// ==========================================
// 7. XP & RPG LEVEL SYSTEM
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
// 8. 7-DAY HABIT GRID & SCORING
// ==========================================
function ensureWeekLog(habit, wkKey) {
  if (!habit.weekLogs) habit.weekLogs = {};
  if (!habit.weekLogs[wkKey]) habit.weekLogs[wkKey] = [false, false, false, false, false, false, false];
  if (!habit.qtyLogs) habit.qtyLogs = {};
  if (!habit.qtyLogs[wkKey]) habit.qtyLogs[wkKey] = [0, 0, 0, 0, 0, 0, 0];
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

  return { activeHabits, dailyWeightedEarned, dailyWeightedPossible, dailyRawDone, dailyPercentages, totalEarned, totalPossible, overallPct };
}

window.toggleHabitCheck = function (habitId, dayIdx) {
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

  const todayDayIdx = getRolledDate().getDay();
  if (weekOffset === 0 && dayIdx === todayDayIdx) {
    const m = computeWeekMetrics(wkKey);
    state.dailyHistory[getDayKey()] = m.dailyPercentages[todayDayIdx];
    if (m.dailyPercentages[todayDayIdx] === 100 && m.dailyWeightedPossible[todayDayIdx] > 0) {
      launchConfetti(60);
      playTone("fanfare");
      showToast("🔥 100% Daily Tasks Completed!");
    }
  }

  saveState();
  renderAll();
};

window.stepHabitQuantity = function (habitId, dayIdx, delta) {
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
    window.toggleHabitCheck(habitId, dayIdx);
  } else {
    saveState();
    renderAll();
  }
};

window.moveHabitOrder = function (habitId, dir) {
  const idx = state.habits.findIndex((h) => h.id === habitId);
  const targetIdx = idx + dir;
  if (idx < 0 || targetIdx < 0 || targetIdx >= state.habits.length) return;
  [state.habits[idx], state.habits[targetIdx]] = [state.habits[targetIdx], state.habits[idx]];
  saveState();
  renderAll();
};

window.editHabit = function (habitId) {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;
  const newName = prompt("Edit Habit Name:", habit.name);
  if (newName && newName.trim()) {
    habit.name = newName.trim();
  }
  const newNote = prompt("Edit Habit Note (leave blank for none):", habit.note || "");
  if (newNote !== null) {
    habit.note = newNote.trim();
  }
  saveState();
  renderAll();
  showToast("Habit updated!");
};

window.archiveHabit = function (habitId) {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;
  habit.archived = true;
  saveState();
  showToast(`Removed "${habit.name}" (saved in Archive)`);
  renderAll();
};

window.restoreHabit = function (habitId) {
  const habit = state.habits.find((h) => h.id === habitId);
  if (habit) {
    habit.archived = false;
    saveState();
    renderAll();
  }
};

window.deleteHabitForever = function (habitId) {
  state.habits = state.habits.filter((h) => h.id !== habitId);
  saveState();
  renderAll();
};

function renderHabitCards() {
  const wkKey = getWeekStartKey(weekOffset);
  const todayDayIdx = getRolledDate().getDay();
  const container = document.getElementById("habitCardsList");
  const activeHabits = state.habits.filter((h) => !h.archived);

  document.getElementById("activeWeekRangeLabel").textContent =
    weekOffset === 0 ? `Current Week (${wkKey})` : `Viewing Week (${wkKey})`;

  container.innerHTML = "";
  if (activeHabits.length === 0) {
    container.innerHTML = `<p class="muted" style="text-align:center; padding:18px 0;">No active habits. Add your first daily task above!</p>`;
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
          <button type="button" class="mini-action-btn" onclick="moveHabitOrder('${h.id}', 1)" title="Move Down">↓</button>
          <button type="button" class="mini-action-btn" onclick="editHabit('${h.id}')" title="Edit">✏️</button>
          <button type="button" class="mini-action-btn" onclick="archiveHabit('${h.id}')" title="Remove">🗑️</button>
        </div>
      </div>
      ${qtyHTML}
      <div class="days-grid-7">${daysHTML}</div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// 9. SEPARATE TO-DO LIST + 1-DAY OVERDUE DETECTOR
// ==========================================
document.getElementById("todoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("todoInput");
  const text = input.value.trim();
  if (!text) return;

  state.todos.push({
    id: "td_" + Date.now(),
    text,
    createdAt: Date.now(),
    lastOverdueNotifDay: ""
  });
  input.value = "";
  saveState();
  renderAll();
  showToast(`Added "${text}" to To-Do list!`);
});

window.completeTodoItem = function (todoId) {
  const idx = state.todos.findIndex((t) => t.id === todoId);
  if (idx === -1) return;

  const rowEl = document.getElementById(`todo-row-${todoId}`);
  if (rowEl) rowEl.classList.add("completing");

  const [removed] = state.todos.splice(idx, 1);
  lastDeletedTodo = removed;
  state.completedTodosToday.unshift({
    text: removed.text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });
  state.todosCompletedEver = (state.todosCompletedEver || 0) + 1;

  awardXP(15);
  playTone("check");
  saveState();

  setTimeout(() => {
    renderAll();
    showToast(`✓ Completed "${removed.text}" (+15 XP)`, true);
  }, 280);
};

window.editTodoItem = function (todoId) {
  const item = state.todos.find((t) => t.id === todoId);
  if (!item) return;
  const updated = prompt("Edit To-Do item:", item.text);
  if (updated && updated.trim()) {
    item.text = updated.trim();
    saveState();
    renderAll();
  }
};

document.getElementById("toastUndoBtn").addEventListener("click", () => {
  if (!lastDeletedTodo) return;
  state.todos.push(lastDeletedTodo);
  state.completedTodosToday.shift();
  lastDeletedTodo = null;
  awardXP(-15);
  saveState();
  renderAll();
  document.getElementById("toastBar").classList.add("hidden");
});

document.getElementById("clearCompletedTodosBtn").addEventListener("click", () => {
  state.completedTodosToday = [];
  saveState();
  renderTodos();
});

function renderTodos() {
  const listEl = document.getElementById("todoListContainer");
  const nowMs = Date.now();
  document.getElementById("todoCountBadge").textContent = `${state.todos.length} Pending`;
  document.getElementById("todoCompletedCount").textContent = state.completedTodosToday.length;

  listEl.innerHTML = "";
  if (state.todos.length === 0) {
    listEl.innerHTML = `<p class="muted" style="text-align:center; padding:24px 0;">Your To-Do workspace is clear! Add any work above.</p>`;
  } else {
    state.todos.forEach((item, index) => {
      const ageMs = nowMs - (item.createdAt || nowMs);
      const isOverdue = ageMs >= ONE_DAY_MS;
      const daysOld = Math.floor(ageMs / ONE_DAY_MS);

      const row = document.createElement("div");
      row.className = `todo-row-card ${isOverdue ? "overdue-todo" : ""}`;
      row.id = `todo-row-${item.id}`;
      row.innerHTML = `
        <div class="todo-left">
          <span class="todo-number">${index + 1}.</span>
          <div class="todo-text-block">
            <span class="todo-text">${escapeHTML(item.text)}</span>
            <span class="todo-age-tag ${isOverdue ? "overdue" : ""}">
              ${isOverdue ? `⚠️ Overdue (${daysOld} day${daysOld > 1 ? "s" : ""} pending) — Finish today!` : "Added today"}
            </span>
          </div>
        </div>
        <div class="todo-right-controls">
          <button type="button" class="mini-action-btn" onclick="editTodoItem('${item.id}')" title="Edit">✏️</button>
          <input
            type="checkbox"
            class="todo-checkbox"
            title="Tick when finished to remove"
            onchange="completeTodoItem('${item.id}')"
          />
        </div>
      `;
      listEl.appendChild(row);
    });
  }

  document.getElementById("completedTodoList").innerHTML = state.completedTodosToday
    .slice(0, 12)
    .map((c) => `<div class="completed-todo-item">✓ ${escapeHTML(c.text)} (${c.time})</div>`)
    .join("");
}

// ==========================================
// 10. 100% OFFLINE NATIVE CANVAS SPLINE GRAPH
// ==========================================
function drawOfflineSplineChart(metrics) {
  const canvasEl = document.getElementById("modernWeeklyChart");
  if (!canvasEl || !canvasEl.parentElement) return;

  const rect = canvasEl.parentElement.getBoundingClientRect();
  const width = Math.max(280, rect.width - 12);
  const height = Math.max(220, rect.height - 18);
  const dpr = window.devicePixelRatio || 1;

  canvasEl.width = width * dpr;
  canvasEl.height = height * dpr;
  canvasEl.style.width = `${width}px`;
  canvasEl.style.height = `${height}px`;

  const ctx = canvasEl.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const isPct = chartMode === "pct";
  const values = isPct ? metrics.dailyPercentages : metrics.dailyRawDone;
  const maxVal = isPct ? 100 : Math.max(...values, metrics.activeHabits.length, 4);

  const accentHex = getComputedStyle(document.documentElement).getPropertyValue("--accent-1").trim() || "#ff2e88";
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const gridColor = isLight ? "rgba(15, 23, 42, 0.1)" : "rgba(255, 255, 255, 0.08)";
  const labelColor = isLight ? "#52607a" : "#9aa2c0";

  const padLeft = 42;
  const padRight = 18;
  const padTop = 26;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Horizontal grid lines & Y-axis labels
  ctx.font = "700 11px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let step = 0; step <= 4; step++) {
    const ratio = step / 4;
    const y = padTop + plotH - ratio * plotH;
    const tickVal = Math.round(maxVal * ratio);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
    ctx.stroke();

    ctx.fillStyle = labelColor;
    ctx.fillText(isPct ? `${tickVal}%` : `${tickVal}`, padLeft - 8, y);
  }

  // Compute points
  const points = values.map((val, idx) => ({
    x: padLeft + (plotW / 6) * idx,
    y: padTop + plotH - (Math.min(val, maxVal) / maxVal) * plotH,
    val
  }));

  // Draw smooth spline path
  function traceSmoothCurve() {
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
    }
  }

  // Gradient fill under curve
  const grad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
  grad.addColorStop(0, accentHex + "88");
  grad.addColorStop(1, "rgba(0, 212, 182, 0.0)");

  ctx.beginPath();
  traceSmoothCurve();
  ctx.lineTo(points[points.length - 1].x, padTop + plotH);
  ctx.lineTo(points[0].x, padTop + plotH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Stroke glowing spline line
  ctx.beginPath();
  traceSmoothCurve();
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.stroke();

  // Draw X-axis day names, glowing nodes & value labels
  ctx.textAlign = "center";
  points.forEach((pt, idx) => {
    ctx.fillStyle = labelColor;
    ctx.font = "700 11px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(DAYS[idx], pt.x, padTop + plotH + 16);

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = accentHex;
    ctx.stroke();

    ctx.fillStyle = isLight ? "#0f172a" : "#ffffff";
    ctx.font = "800 10px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(isPct ? `${pt.val}%` : `${pt.val}`, pt.x, pt.y - 12);
  });
}

function renderGraphAndInsights(metrics) {
  lastMetricsSnapshot = metrics;
  drawOfflineSplineChart(metrics);

  const wkKey = getWeekStartKey(weekOffset);
  const prevMetrics = computeWeekMetrics(getWeekStartKey(weekOffset - 1));
  const delta = metrics.overallPct - prevMetrics.overallPct;

  document.getElementById("viewedWeekTitle").textContent =
    weekOffset === 0 ? "This Week" : weekOffset === -1 ? "Last Week" : `Week of ${wkKey}`;
  document.getElementById("nextWeekBtn").disabled = weekOffset >= 0;

  const deltaEl = document.getElementById("weekVsLastBadge");
  deltaEl.textContent =
    prevMetrics.totalPossible === 0
      ? `Score: ${metrics.overallPct}%`
      : `${delta >= 0 ? `↑ +${delta}%` : `↓ ${delta}%`} vs previous week`;

  let bestIdx = 0;
  let worstIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (metrics.dailyPercentages[i] > metrics.dailyPercentages[bestIdx]) bestIdx = i;
    if (metrics.dailyPercentages[i] < metrics.dailyPercentages[worstIdx]) worstIdx = i;
  }
  const perfectDays = metrics.dailyPercentages.filter((p) => p === 100).length;

  document.getElementById("dayInsightsGrid").innerHTML = `
    <div class="insight-card">
      <span class="muted">🔥 Peak Day</span>
      <strong>${DAYS[bestIdx]} (${metrics.dailyPercentages[bestIdx]}%)</strong>
    </div>
    <div class="insight-card">
      <span class="muted">⚠️ Weakest Day</span>
      <strong>${DAYS[worstIdx]} (${metrics.dailyPercentages[worstIdx]}%)</strong>
    </div>
    <div class="insight-card">
      <span class="muted">📊 Weekly Average</span>
      <strong>${metrics.overallPct}% Weighted</strong>
    </div>
    <div class="insight-card">
      <span class="muted">👑 Perfect 100% Days</span>
      <strong>${perfectDays} / 7 Days</strong>
    </div>
  `;
}

window.addEventListener("resize", () => {
  if (lastMetricsSnapshot) drawOfflineSplineChart(lastMetricsSnapshot);
});

function renderHeatmap() {
  const grid = document.getElementById("activityHeatmapGrid");
  grid.innerHTML = "";
  const today = getRolledDate();

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
// 11. RANK LEVELS, CHALLENGES, BADGES & REPORT
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

window.claimChallengeXP = function (challengeId, xpReward) {
  const wkKey = getWeekStartKey(0);
  const tag = `${wkKey}_${challengeId}`;
  if (state.claimedChallenges?.[tag]) return;
  if (!state.claimedChallenges) state.claimedChallenges = {};
  state.claimedChallenges[tag] = true;
  awardXP(xpReward);
  playTone("fanfare");
  launchConfetti(45);
  showToast(`🎉 Challenge Claimed! +${xpReward} XP`);
  renderAll();
};

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
  document.getElementById("badgesGrid").innerHTML = BADGES_CATALOG.map(
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

  const wkKey = getWeekStartKey(weekOffset);
  const perfectDays = metrics.dailyPercentages.filter((p) => p === 100).length;
  const challenges = [
    { id: "c_gm", name: "Hit 90%+ Grand Master Score", curr: Math.min(pct, 90), target: 90, unit: "%", xp: 100 },
    { id: "c_3d", name: "Achieve 3 Perfect 100% Days", curr: Math.min(perfectDays, 3), target: 3, unit: " days", xp: 75 }
  ];

  document.getElementById("weeklyChallengesList").innerHTML = challenges
    .map((c) => {
      const barPct = Math.round((c.curr / c.target) * 100);
      const done = c.curr >= c.target;
      const claimed = state.claimedChallenges?.[`${wkKey}_${c.id}`];
      return `
        <div class="challenge-card">
          <div class="challenge-top">
            <span>${c.name}</span>
            ${
              done && !claimed
                ? `<button type="button" class="btn-primary-sm" onclick="claimChallengeXP('${c.id}', ${c.xp})">Claim +${c.xp} XP</button>`
                : `<span>${claimed ? "✅ Claimed" : `${c.curr}/${c.target}${c.unit}`}</span>`
            }
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${barPct}%"></div></div>
        </div>
      `;
    })
    .join("");

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
// 12. FOCUS TIMER & REPORT CARD GENERATOR
// ==========================================
window.openTimerModal = function (habitId) {
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
};

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

        const todayIdx = getRolledDate().getDay();
        const wkKey = getWeekStartKey(0);
        const h = state.habits.find((item) => item.id === activeTimer.habitId);
        if (h && h.activeDays[todayIdx] && !h.weekLogs[wkKey]?.[todayIdx]) {
          weekOffset = 0;
          window.toggleHabitCheck(h.id, todayIdx);
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

document.getElementById("generateReportCardBtn").addEventListener("click", () => {
  const wkKey = getWeekStartKey(weekOffset);
  const metrics = computeWeekMetrics(wkKey);
  const { rank, emoji } = evaluateRank(metrics.overallPct);

  const canvas = document.getElementById("reportCardCanvas");
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, 720, 900);
  bg.addColorStop(0, "#14162b");
  bg.addColorStop(0.5, "#2b1238");
  bg.addColorStop(1, "#090a14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 720, 900);

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

document.getElementById("shareReportImageBtn").addEventListener("click", () => {
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
      showToast("Report PNG saved—ready to share!");
    }
  });
});

document.getElementById("closeReportModalBtn").addEventListener("click", () => {
  document.getElementById("reportCardModal").classList.add("hidden");
});

// ==========================================
// 13. SETTINGS, BACKUP, ARCHIVE & EVENTS
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

document.getElementById("toggleSoundBtn").addEventListener("click", () => {
  state.soundEnabled = state.soundEnabled === false ? true : false;
  saveState();
  applyEnvironmentAndTheme();
  if (state.soundEnabled) playTone("check");
});

document.querySelectorAll(".theme-choice").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.theme = btn.dataset.themeVal;
    saveState();
    applyEnvironmentAndTheme();
    if (lastMetricsSnapshot) drawOfflineSplineChart(lastMetricsSnapshot);
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
        showToast("✅ Backup restored!");
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
  showToast("🔗 Friend code copied!");
});

document.getElementById("loadSyncCodeBtn").addEventListener("click", () => {
  const code = prompt("Paste a Friend's Code to add them to your Leaderboard:");
  if (!code) return;
  try {
    const friend = JSON.parse(decodeURIComponent(atob(code.trim())));
    if (friend && friend.name) {
      state.friends.push({ name: friend.name, pct: friend.pct || 0, streak: friend.streak || 1 });
      saveState();
      renderAll();
      showToast(`Added ${friend.name}!`);
    }
  } catch (_) {
    showToast("Invalid code.");
  }
});

document.getElementById("addFriendScoreBtn").addEventListener("click", () => {
  document.getElementById("loadSyncCodeBtn").click();
});

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

  const currentWkMetrics = computeWeekMetrics(getWeekStartKey(0));
  const todayScheduled = currentWkMetrics.activeHabits.filter((h) => h.activeDays[todayIdx]).length;
  const todayDone = currentWkMetrics.dailyRawDone[todayIdx];
  const todayPct = currentWkMetrics.dailyPercentages[todayIdx];

  document.getElementById("todayDateLabel").textContent = `TODAY'S MISSION (${DAYS[todayIdx].toUpperCase()})`;
  document.getElementById("todayDoneFraction").textContent = `${todayDone} / ${todayScheduled}`;
  document.getElementById("todayTodoPendingInline").textContent = state.todos.length;
  document.getElementById("todayPctPill").textContent = `${todayPct}%`;
  document.getElementById("overallScoreBadge").textContent = `${metrics.totalEarned} / ${metrics.totalPossible} pts`;
  document.getElementById("archivedCountBadge").textContent = state.habits.filter((h) => h.archived).length;

  const hourNow = new Date().getHours();
  const incompleteToday = (todayScheduled > 0 && todayDone < todayScheduled) || state.todos.length > 0;
  const showDanger = hourNow >= 21 && incompleteToday;
  document.getElementById("streakDangerBanner").classList.toggle("hidden", !showDanger);
  document.getElementById("useFreezeBtn").classList.toggle("hidden", !(showDanger && state.streak.freezesLeft > 0));

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
    navigator.serviceWorker.register("./sw.js").then((reg) => reg.update()).catch(() => {});
  });
}

applyEnvironmentAndTheme();
setupNotificationPrompt();
syncStreakAndClock();
renderAll();
checkScheduledAndOverdueNotifications();

setInterval(() => {
  syncStreakAndClock();
  checkScheduledAndOverdueNotifications();
}, 20000);