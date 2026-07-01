const desktop = document.querySelector("#desktop");
const folders = document.querySelectorAll(".drag-item");
const statusText = document.querySelector("#statusText");
const musicButton = document.querySelector("#musicButton");
const availabilityDot = document.querySelector("#availabilityDot");
const systemTime = document.querySelector("#systemTime");
const boot = document.querySelector("#boot");
const bootLine = document.querySelector("#bootLine");
const companionNotice = document.querySelector("#companionNotice");
const noticeLabel = document.querySelector("#noticeLabel");
const noticeMessage = document.querySelector("#noticeMessage");
const noticeAction = document.querySelector("#noticeAction");
const replyOptions = document.querySelector("#replyOptions");
const companion = document.querySelector("#companion");
const speechCard = document.querySelector("#speechCard");
const previewWindow = document.querySelector("#previewWindow");
const previewTitle = document.querySelector("#previewTitle");
const previewHeading = document.querySelector("#previewHeading");
const previewType = document.querySelector("#previewType");
const previewCopy = document.querySelector("#previewCopy");
const openFullStory = document.querySelector("#openFullStory");
const closePreview = document.querySelector("#closePreview");
const vinylPanel = document.querySelector("#vinylPanel");
const themeToggle = document.querySelector("#themeToggle");
const soundToggle = document.querySelector("#soundToggle");
const lightButton = document.querySelector("#lightButton");
const trackTitle = document.querySelector("#trackTitle");
const trackArtist = document.querySelector("#trackArtist");
const miniCover = document.querySelector("#miniCover");
const playTrack = document.querySelector("#playTrack");
const desktopAudio = document.querySelector("#desktopAudio");
const spaceEntryWash = document.querySelector("#spaceEntryWash");
const retainedLight = document.querySelector("#retainedLight");
const lightConstellation = document.querySelector("#lightConstellation");
const lightReceipt = document.querySelector("#lightReceipt");
const retainedLightCount = document.querySelector("#retainedLightCount");
const lastVisitLine = document.querySelector("#lastVisitLine");
const themeKey = "life-exe-theme-v1";
const storedTheme = localStorage.getItem(themeKey);
let themeMode = ["auto", "day", "night"].includes(storedTheme) ? storedTheme : "auto";
const entryParams = new URLSearchParams(window.location.search);
const skipIntro = entryParams.get("skipIntro") === "1";
const fromSpace = entryParams.get("from") === "space";

const lightStorageKey = "pravallika_space_light_v1";
const lightTransferKey = "pravallika_space_transfer_v1";
const globalSignalKey = "pravallika_space_global_signal_v1";
let lightTransfer = null;
try {
  lightTransfer = JSON.parse(sessionStorage.getItem(lightTransferKey) || "null");
  sessionStorage.removeItem(lightTransferKey);
} catch {
  lightTransfer = null;
}
let retainedColors = [];
if (Array.isArray(lightTransfer?.colors)) {
  retainedColors = lightTransfer.colors;
} else {
  try {
    const storedLight = JSON.parse(localStorage.getItem(lightStorageKey) || "[]");
    if (Array.isArray(storedLight)) retainedColors = storedLight;
  } catch {
    retainedColors = [];
  }
}
retainedColors = retainedColors.filter((color) => /^#[0-9a-f]{6}$/i.test(color)).slice(-220);
const retainedCount = Number.isFinite(lightTransfer?.count) ? lightTransfer.count : retainedColors.length;
const transferredGlobalSignal = Number(lightTransfer?.globalSignal);
const storedGlobalSignal = Number(localStorage.getItem(globalSignalKey));
const globalSignalTotal = Math.max(
  retainedCount,
  Number.isFinite(transferredGlobalSignal) ? transferredGlobalSignal : 0,
  Number.isFinite(storedGlobalSignal) ? storedGlobalSignal : 0
);
localStorage.setItem(globalSignalKey, String(globalSignalTotal));
const averageLight = (() => {
  if (Array.isArray(lightTransfer?.average) && lightTransfer.average.length === 3) return lightTransfer.average;
  if (!retainedColors.length) return [159, 182, 224];
  const total = retainedColors.reduce((sum, color) => {
    sum[0] += parseInt(color.slice(1, 3), 16);
    sum[1] += parseInt(color.slice(3, 5), 16);
    sum[2] += parseInt(color.slice(5, 7), 16);
    return sum;
  }, [0, 0, 0]);
  return total.map((value) => Math.round(value / retainedColors.length));
})();
const hasSpaceConnection = fromSpace || retainedColors.length > 0;
const lightStrength = Math.min(.72, .24 + retainedCount * .018);

if (hasSpaceConnection) {
  desktop.classList.add("space-connected");
  desktop.style.setProperty("--retained-rgb", averageLight.join(", "));
  desktop.style.setProperty("--light-strength", lightStrength.toFixed(2));
  retainedLightCount.textContent = String(retainedCount);
  retainedColors.slice(-24).forEach((color, index) => {
    const mote = document.createElement("i");
    mote.className = `retained-mote${index % 4 === 2 ? " spark" : ""}`;
    const size = 2 + (index % 4);
    mote.style.left = `${4 + ((index * 37) % 92)}%`;
    mote.style.top = `${8 + ((index * 53) % 82)}%`;
    mote.style.width = `${size}px`;
    mote.style.height = `${size}px`;
    mote.style.color = color;
    mote.style.background = color;
    mote.style.setProperty("--duration", `${8 + (index % 7)}s`);
    mote.style.setProperty("--delay", `${-(index % 6)}s`);
    mote.addEventListener("pointerenter", () => playTone("star"));
    retainedLight.appendChild(mote);
  });
  setTimeout(() => lightReceipt.classList.add("show"), fromSpace ? 450 : 120);
  setTimeout(() => lightReceipt.classList.add("settled"), 5200);
}
if (fromSpace) {
  spaceEntryWash.classList.add("active");
}
lightButton.querySelector("span").textContent = `light ${retainedCount}`;
lightButton.disabled = retainedCount === 0;
lightButton.setAttribute("aria-label", retainedCount ? `Wake ${retainedCount} retained lights` : "No retained light yet");
const lastVisitKey = "pravallika-space-last-desktop-visit";
const previousVisit = Number(localStorage.getItem(lastVisitKey));
if (Number.isFinite(previousVisit) && previousVisit > 0) {
  const elapsedDays = Math.floor((Date.now() - previousVisit) / 86400000);
  lastVisitLine.hidden = false;
  lastVisitLine.textContent = elapsedDays === 0 ? "last visit: earlier today" : elapsedDays === 1 ? "last visit: yesterday" : `last visit: ${elapsedDays} days ago`;
}
localStorage.setItem(lastVisitKey, String(Date.now()));

const friendStateKey = "pravallika-space-friend-state-v2";
let friendState = {
  desktopVisits: 0,
  lastMessageId: "",
  lastMessageText: "",
  lastReplyId: "",
  relationshipMode: "standard",
  lastSeenAt: 0,
  pendingReturn: "",
  returnStartedAt: 0,
  recentMessageIds: []
};
try { friendState = { ...friendState, ...JSON.parse(localStorage.getItem(friendStateKey) || "{}") }; } catch {}
const previousFriendSeenAt = Number(friendState.lastSeenAt) || 0;
const sessionReturn = sessionStorage.getItem("pravallika-space-current-case") || "";
sessionStorage.removeItem("pravallika-space-current-case");
const pendingReturn = friendState.pendingReturn || sessionReturn;
const returnStartedAt = Number(friendState.returnStartedAt) || Date.now();
friendState.pendingReturn = "";
friendState.returnStartedAt = 0;
friendState.desktopVisits += 1;
const firstDesktopVisit = friendState.desktopVisits === 1;
const friendAbsence = previousFriendSeenAt ? Date.now() - previousFriendSeenAt : 0;
const persistFriendState = () => localStorage.setItem(friendStateKey, JSON.stringify(friendState));
let lastPreviewTrigger = null;
const hidePreview = () => {
  previewWindow.classList.remove("show", "maximized");
  lastPreviewTrigger?.focus?.();
  lastPreviewTrigger = null;
};
persistFriendState();
if (friendState.lastMessageText) {
  noticeLabel.textContent = "previous note";
  noticeMessage.textContent = friendState.lastMessageText;
  speechCard.className = "speech-card ambient";
}
window.addEventListener("pagehide", () => {
  friendState.lastSeenAt = Date.now();
  persistFriendState();
});

const relationshipKey = "life-exe-relationship-v1";
let relationship;
try {
  relationship = JSON.parse(localStorage.getItem(relationshipKey) || "");
} catch {
  relationship = null;
}
const hasCurrentPaceVersion = relationship?.paceVersion === 2;
relationship = { visits: 0, pace: friendState.relationshipMode || "standard", lastReply: "", lastResponse: "", ...relationship, paceVersion: 2 };
if (!hasCurrentPaceVersion) {
  relationship.pace = "standard";
}
relationship.visits += 1;
localStorage.setItem(relationshipKey, JSON.stringify(relationship));

const soundPreferenceKey = "pravallika-space-sound-v3";
let soundEnabled = false;
localStorage.setItem(soundPreferenceKey, "off");
let audioContext;
let audioUnlocked = false;
const renderSoundToggle = () => {
  soundToggle.querySelector("span").textContent = soundEnabled ? "sound on" : "sound off";
  soundToggle.querySelector("i").textContent = soundEnabled ? "♫" : "♩";
  soundToggle.setAttribute("aria-label", soundEnabled ? "Turn interface sounds off" : "Turn interface sounds on");
};
const ensureAudio = () => {
  if (!soundEnabled) return Promise.resolve(false);
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return Promise.resolve(false);
  try {
    audioContext ||= new AudioEngine();
    if (audioContext.state === "suspended") return audioContext.resume().then(() => true).catch(() => false);
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
};
const emitTone = (kind = "click") => {
  const tones = {
    click: [420, .035, .035],
    open: [460, .075, .05],
    pickup: [190, .06, .035],
    move: [235, .025, .018],
    drop: [145, .08, .055],
    message: [620, .12, .035],
    reply: [520, .11, .04],
    star: [760, .14, .025]
  };
  const [frequency, duration, gainValue] = tones[kind] || tones.click;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = kind === "drop" ? "triangle" : "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(gainValue, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
};
const playTone = (kind = "click") => {
  ensureAudio().then((ready) => { if (ready) emitTone(kind); });
};
renderSoundToggle();
document.addEventListener("pointerdown", (event) => {
  if (audioUnlocked || event.target.closest("#soundToggle")) return;
  ensureAudio().then((ready) => {
    if (!ready) return;
    audioUnlocked = true;
    emitTone("open");
  });
}, { capture: true, passive: true });
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem(soundPreferenceKey, soundEnabled ? "on" : "off");
  renderSoundToggle();
  audioUnlocked = false;
  if (!soundEnabled && audioContext) {
    try { audioContext.close(); } catch {}
    audioContext = null;
  }
  playTone("click");
});
document.addEventListener("click", (event) => {
  if (event.target.closest("button") && !event.target.closest("#soundToggle, #themeToggle")) playTone("click");
});

const messages = [
  "available for fun problems",
  "currently building: Pfizer document intelligence",
  "double-click gently"
];
let messageIndex = 0;
let hoveredFolder = null;
setInterval(() => {
  if (hoveredFolder) return;
  messageIndex = (messageIndex + 1) % messages.length;
  statusText.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 450 });
  statusText.textContent = messages[messageIndex];
  availabilityDot.classList.toggle("hidden", messageIndex !== 0);
}, 9000);

const updateSystemTime = () => {
  const now = new Date();
  systemTime.textContent = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(now);
  const hour = now.getHours();
  desktop.classList.toggle("night", themeMode === "night" || (themeMode === "auto" && (hour >= 20 || hour < 6)));
};
const renderThemeToggle = () => {
  const themes = {
    auto: ["auto", "◐", "automatic"],
    day: ["day", "☀", "day"],
    night: ["night", "☾", "night"]
  };
  const [label, icon, accessibleName] = themes[themeMode];
  themeToggle.innerHTML = `<span>${label}</span><i>${icon}</i>`;
  themeToggle.setAttribute("aria-label", `Change atmosphere: ${accessibleName}`);
};
renderThemeToggle();
updateSystemTime();
setInterval(updateSystemTime, 30000);

themeToggle.addEventListener("click", () => {
  if (themeMode === "auto") {
    themeMode = "day";
  } else if (themeMode === "day") {
    themeMode = "night";
  } else {
    themeMode = "auto";
  }
  localStorage.setItem(themeKey, themeMode);
  renderThemeToggle();
  updateSystemTime();
  renderTrack();
  messageQueue = [];
  messageQueueContext = "";
  if (companionNotice.classList.contains("show")) hideContextToast();
  scheduleNextMessage(true);
  playTone("click");
});

const bootLines = ["Loading memories...", "Loading unfinished ideas...", "Loading optimism..."];
if (skipIntro) {
  boot.classList.add("done");
  folders.forEach((folder) => folder.classList.add("arrive"));
  history.replaceState(null, "", "constellation.html?skipIntro=1");
} else {
  bootLines.forEach((line, index) => setTimeout(() => { bootLine.textContent = line; }, index * 500));
  setTimeout(() => boot.classList.add("done"), 1900);
  setTimeout(() => folders.forEach((folder, index) => setTimeout(() => folder.classList.add("arrive"), index * 120)), 1450);
}

let idleTimer;
const schedulePeek = () => {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    const folder = folders[Math.floor(Math.random() * folders.length)];
    folder.classList.add("peek");
    setTimeout(() => folder.classList.remove("peek"), 1800);
    schedulePeek();
  }, 8000);
};
["pointermove", "pointerdown", "keydown"].forEach((eventName) => window.addEventListener(eventName, schedulePeek));
schedulePeek();

const reply = (label, response, pace) => ({ label, response, pace });
const sharedMessages = [
  { id:"details", type:"ambient", label:"tiny check-in", message:"Do you notice tiny details too?", replies:[reply("always","I had a feeling we would get along."),reply("sometimes","Sometimes is where the good surprises hide.")] },
  { id:"problem", type:"ambient", label:"desktop friend", message:"What kind of problem are you carrying today?", replies:[reply("a messy one","Excellent. Messy problems usually have the best stories."),reply("just browsing","That counts too. Wandering is research.")] },
  { id:"company", type:"ambient", label:"desktop friend", message:"Want me to keep you company?", replies:[reply("stay awhile","I’m right here. No need to perform.","company"),reply("quietly, please","Of course. I’ll check in less often.","quiet")] },
  { id:"curiosity", type:"ambient", label:"small question", message:"What caught your curiosity today?", replies:[reply("something new","The best kind of beginning."),reply("still searching","Searching counts as movement.")] },
  { id:"permission", type:"ambient", label:"gentle permission", message:"You’re allowed to explore without a plan.", replies:[reply("needed that","Then keep it. It’s yours."),reply("already am","Excellent form. Carry on.")] },
  { id:"archive", type:"notification", label:"thought archived", message:"A tiny detail just became important.", action:"okay" }
];
const dayMessages = [
  { id:"whitespace", type:"ambient", label:"small reminder", message:"Your best work still needs whitespace.", replies:[reply("true","Whitespace is annoyingly wise like that."),reply("still learning","Same. We can leave a little room for it.")] },
  { id:"interesting", type:"ambient", label:"hello there", message:"Found anything interesting yet?", replies:[reply("yes","Good. I knew one of these folders would find you."),reply("still looking","No rush. Curiosity has no loading bar.")] },
  { id:"bright", type:"ambient", label:"day thought", message:"Today feels like a good day to open the strange folder.", replies:[reply("which one?","Whichever one made you pause."),reply("maybe later","It knows how to wait.")] },
  { id:"wander", type:"ambient", label:"day thought", message:"Wandering is a perfectly valid research method.", replies:[reply("agreed","We’re already making progress."),reply("convince me","You found this desktop, didn’t you?")] }
];
const dayOpener = {
  id:"day-opener", type:"notification", label:"good day, internet friend",
  message:"The folders are ready whenever curiosity is.", action:"take a look"
};
const nightOpener = {
  id:"night-opener", type:"notification", label:"hey there, internet friend",
  message:"Make yourself at home. I keep the desk light low at this hour.", action:"take a look"
};
const visitorMessage = {
  id:"visitor-note", type:"notification", label:"visitor note",
  message:"Another internet friend wandered through pravallika.space.", action:"hello"
};
const nightMessages = [
  { id:"working-late", type:"ambient", label:"late-night message", message:"Working late again?", replies:[reply("yes","Thought so. I’ll keep the little desk light on.","company"),reply("not tonight","Good. The ideas will still be here tomorrow.","quiet")] },
  { id:"sleep", type:"ambient", label:"small reminder", message:"Curiosity also needs sleep. Eventually.", replies:[reply("five more mins","A classic. I’m starting a very gentle timer."),reply("fair point","I rarely get to hear that. Thank you.","quiet")] },
  { id:"two-am", type:"ambient", label:"night thought", message:"Is this a good idea or a 2 AM idea?", replies:[reply("both","The most interesting category."),reply("ask tomorrow","Wise. I’ll archive it until morning.","quiet")] },
  { id:"quiet-company", type:"ambient", label:"desktop friend", message:"Want some quiet company?", replies:[reply("stay awhile","I’m right here. No need to perform.","company"),reply("I’m okay","Okay. I’ll be quietly nearby.","quiet")] },
  { id:"night-kind", type:"ambient", label:"night thought", message:"The night makes unfinished ideas feel kinder.", replies:[reply("it does","Maybe they only needed softer lighting."),reply("not mine","Then we’ll leave them alone for now.")] }
];
const buildThoughts = (prefix, labels, beginnings, endings) => beginnings.flatMap((beginning, row) =>
  endings.map((ending, column) => ({
    id: `${prefix}-${row}-${column}`,
    type: "ambient",
    label: labels[(row + column) % labels.length],
    message: `${beginning} ${ending}`
  }))
);
const dayThoughts = buildThoughts(
  "day",
  ["passing thought", "desktop note", "tiny observation"],
  ["A fresh screen can be", "Good work is sometimes", "Curiosity looks a lot like", "A useful detour is", "A quiet beginning can be", "Today might be for"],
  ["a small invitation.", "leaving one thing unfinished.", "opening the folder you almost ignored.", "still part of the journey.", "enough progress for now.", "following the interesting question."]
);
const nightThoughts = buildThoughts(
  "night",
  ["late-night thought", "quiet note", "desktop whisper"],
  ["Some ideas only arrive", "The unfinished parts feel softer", "It is okay to stop", "Quiet can be", "The late hours are good for", "Tonight might be for"],
  ["when the room gets quiet.", "under late-night light.", "before the idea is perfect.", "a form of progress too.", "letting the question breathe.", "saving one thought for tomorrow."]
);
const returningMessage = firstDesktopVisit ? {
  id:"welcome", type:"ambient", label:"hey there, internet friend", message:"Make yourself at home. Nothing here is arranged by importance.",
  replies:[reply("I like that","Then we’re off to a good start."),reply("where first?","Open whichever story catches your eye.")]
} : {
  id:"returning", type:"ambient", label:"welcome back",
  message: desktop.classList.contains("night") ? "I thought you might come back." : "I kept your place.",
  replies:[reply("you remembered?","Only the gentle parts."),reply("hello again","Hello again. Take your time.")]
};
const returnMessages = {
  ascent: "You’re back. How are things over there?",
  clara: "You’re back. Still thinking about that one?",
  parks: "You’re back. Did the park leave you with anything?",
  playground: "You’re back. Did you make something strange?",
  about: "You’re back. I kept your place."
};
let contextualReturnMessage = pendingReturn ? {
  id:`return-${pendingReturn}-${Date.now()}`,
  type:"ambient",
  label:"welcome back",
  message:returnMessages[pendingReturn] || "You’re back."
} : null;
let messageQueue = [];
let messageQueueContext = "";
let recentMessageIds = Array.isArray(friendState.recentMessageIds) ? friendState.recentMessageIds : [];
let openedContexts = new Set(firstDesktopVisit && !pendingReturn ? [] : ["day", "night"]);
const contextMessageCounts = { day: 0, night: 0 };
let returningMessageShown = firstDesktopVisit || Boolean(pendingReturn) || friendAbsence < 21600000;
let noticeCount = 0;
let noticeLeaveTimer;
let noticeHideTimer;
let messageScheduleTimer;
let currentMessageHasReplies = false;
const hideContextToast = () => {
  clearTimeout(noticeLeaveTimer);
  companionNotice.classList.add("leaving");
  noticeHideTimer = setTimeout(() => companionNotice.classList.remove("show", "leaving"), 2500);
};
companionNotice.addEventListener("mouseenter", () => clearTimeout(noticeLeaveTimer));
companionNotice.addEventListener("mouseleave", () => {
  if (!companionNotice.classList.contains("show") || currentMessageHasReplies) return;
  clearTimeout(noticeLeaveTimer);
  noticeLeaveTimer = setTimeout(hideContextToast, 18000);
});
const showContextToast = () => {
  if (companionNotice.classList.contains("show") && replyOptions.children.length) return;
  const isNight = desktop.classList.contains("night");
  const context = isNight ? "night" : "day";
  const pool = [...sharedMessages, ...(isNight ? [...nightMessages, ...nightThoughts] : [...dayMessages, ...dayThoughts])];
  if (messageQueueContext !== context) {
    messageQueue = [];
    messageQueueContext = context;
  }
  if (!messageQueue.length) {
    messageQueue = pool.filter(item => !recentMessageIds.includes(item.id)).sort(() => Math.random() - .5);
    if (!messageQueue.length) {
      recentMessageIds = recentMessageIds.slice(-3);
      messageQueue = pool.filter(item => !recentMessageIds.includes(item.id)).sort(() => Math.random() - .5);
    }
  }
  let item;
  let memoryObservation = null;
  try {
    const stats = JSON.parse(localStorage.getItem("pravallika-space-folder-stats") || "{}");
    const topEntry = Object.entries(stats.counts || {}).sort((a, b) => b[1] - a[1])[0];
    const firstEntry = Object.entries(stats.firstCounts || {}).sort((a, b) => b[1] - a[1])[0];
    if (firstEntry?.[1] >= 2) memoryObservation = { id:`first-${firstEntry[0]}`, type:"ambient", label:"small observation", message:`You often visit ${firstEntry[0]} first.` };
    else if (topEntry?.[1] >= 3) {
      const interests = { Ascent:"high-stakes systems", Clara:"responsible AI", Parks:"public futures", Playground:"experiments", About:"personal archives", Resume:"the details" };
      memoryObservation = { id:`likes-${topEntry[0]}`, type:"ambient", label:"small observation", message:`You seem to like ${interests[topEntry[0]] || topEntry[0]}.` };
    }
  } catch {}
  if (contextualReturnMessage) {
    item = contextualReturnMessage;
    contextualReturnMessage = null;
  } else if (!openedContexts.has(context)) {
    item = isNight ? nightOpener : dayOpener;
    openedContexts.add(context);
  } else if (!returningMessageShown) {
    item = returningMessage;
    returningMessageShown = true;
  } else if (contextMessageCounts[context] === 2) {
    item = visitorMessage;
  } else if (memoryObservation && noticeCount >= 3 && Math.random() < .14) {
    item = memoryObservation;
  } else {
    item = messageQueue.shift();
  }
  contextMessageCounts[context] += 1;
  noticeCount += 1;
  recentMessageIds.push(item.id);
  recentMessageIds = recentMessageIds.slice(-10);
  friendState.lastMessageId = item.id;
  friendState.lastMessageText = item.message;
  friendState.recentMessageIds = recentMessageIds;
  persistFriendState();
  noticeLabel.textContent = item.label;
  noticeMessage.textContent = item.message;
  noticeAction.textContent = item.action || "";
  speechCard.className = `speech-card ${item.type}`;
  replyOptions.innerHTML = "";
  currentMessageHasReplies = Boolean(item.replies);
  const quietReturn = item.id.startsWith("return-");
  if (item.replies) {
    item.replies.forEach((reply) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.response = reply.response;
      if (reply.pace) button.dataset.pace = reply.pace;
      button.textContent = reply.label;
      replyOptions.append(button);
    });
  }
  clearTimeout(noticeLeaveTimer);
  clearTimeout(noticeHideTimer);
  companionNotice.classList.remove("leaving");
  companionNotice.classList.toggle("quiet-return", quietReturn);
  companionNotice.classList.add("show");
  if (!quietReturn) {
    companionNotice.classList.add("arriving");
    playTone("message");
    setTimeout(() => companionNotice.classList.remove("arriving"), 3900);
  }
  if (item.replies) return;
  noticeLeaveTimer = setTimeout(() => {
    hideContextToast();
  }, 18000);
};
const STANDARD_MESSAGE_DELAY = 140000;
const COMPANY_MESSAGE_DELAY = 40000;
const QUIET_MESSAGE_DELAY = 120000;
const scheduleNextMessage = (initial = false) => {
  clearTimeout(messageScheduleTimer);
  const delay = initial ? (contextualReturnMessage ? 3200 : firstDesktopVisit ? 12000 : friendAbsence >= 21600000 ? 8000 : 60000)
    : relationship.pace === "company" ? COMPANY_MESSAGE_DELAY
    : relationship.pace === "quiet" ? QUIET_MESSAGE_DELAY
    : STANDARD_MESSAGE_DELAY;
  messageScheduleTimer = setTimeout(() => {
    showContextToast();
    scheduleNextMessage();
  }, delay);
};
scheduleNextMessage(true);

lightButton.addEventListener("click", () => {
  if (!retainedCount) return;
  desktop.classList.remove("light-awake");
  void desktop.offsetWidth;
  desktop.classList.add("light-awake");
  const desktopRect = desktop.getBoundingClientRect();
  const points = [...retainedLight.querySelectorAll(".retained-mote")].slice(-14).map((mote) => {
    const rect = mote.getBoundingClientRect();
    return { x: rect.left + rect.width / 2 - desktopRect.left, y: rect.top + rect.height / 2 - desktopRect.top };
  });
  lightConstellation.replaceChildren();
  points.forEach((point, index) => {
    const next = points[index + 1];
    if (!next) return;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", point.x);
    line.setAttribute("y1", point.y);
    line.setAttribute("x2", next.x);
    line.setAttribute("y2", next.y);
    lightConstellation.append(line);
  });
  lightConstellation.classList.add("show");
  window.setTimeout(() => desktop.classList.remove("light-awake"), 1500);
  window.setTimeout(() => lightConstellation.classList.remove("show"), 2200);
  noticeLabel.textContent = "light retained";
  noticeMessage.textContent = `${retainedCount} small light${retainedCount === 1 ? "" : "s"} made it through with you.`;
  noticeAction.textContent = "keep it";
  replyOptions.innerHTML = "";
  currentMessageHasReplies = false;
  speechCard.className = "speech-card notification";
  companionNotice.classList.remove("leaving");
  companionNotice.classList.add("show");
  playTone("star");
});

noticeAction.addEventListener("click", () => {
  hideContextToast();
});

replyOptions.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  noticeLabel.textContent = "desktop friend";
  noticeMessage.textContent = button.dataset.response || "I’m glad you answered.";
  relationship.lastReply = button.textContent;
  relationship.lastResponse = noticeMessage.textContent;
  if (button.dataset.pace) relationship.pace = button.dataset.pace;
  friendState.lastReplyId = button.textContent;
  friendState.relationshipMode = relationship.pace;
  friendState.lastMessageText = noticeMessage.textContent;
  persistFriendState();
  localStorage.setItem(relationshipKey, JSON.stringify(relationship));
  scheduleNextMessage();
  replyOptions.innerHTML = "";
  speechCard.className = "speech-card response";
  companion.classList.add("responding");
  setTimeout(() => companion.classList.remove("responding"), 900);
  noticeLeaveTimer = setTimeout(hideContextToast, 9000);
});

companion.addEventListener("click", () => {
  companion.classList.remove("clicked");
  void companion.offsetWidth;
  companion.classList.add("clicked");
  setTimeout(() => companion.classList.remove("clicked"), 700);
});

let active = null;
let offsetX = 0;
let offsetY = 0;
let lastMoveSound = 0;
let dragDistance = 0;
let pointerStartX = 0;
let pointerStartY = 0;
const openedFolderKey = "pravallika-space-opened-folders";
const folderStatsKey = "pravallika-space-folder-stats";
let openedFolders = [];
let folderStats = { counts: {}, firstCounts: {} };
try { openedFolders = JSON.parse(localStorage.getItem(openedFolderKey) || "[]"); } catch { openedFolders = []; }
try { folderStats = { counts: {}, firstCounts: {}, ...JSON.parse(localStorage.getItem(folderStatsKey) || "{}") }; } catch {}
if (openedFolders.includes("About me")) {
  openedFolders = [...new Set(openedFolders.map((label) => label === "About me" ? "About" : label))];
  localStorage.setItem(openedFolderKey, JSON.stringify(openedFolders));
}
["counts", "firstCounts"].forEach((group) => {
  if (!folderStats[group]?.["About me"]) return;
  folderStats[group].About = (folderStats[group].About || 0) + folderStats[group]["About me"];
  delete folderStats[group]["About me"];
  localStorage.setItem(folderStatsKey, JSON.stringify(folderStats));
});
folders.forEach((folder) => {
  const label = folder.querySelector("b")?.textContent;
  if (openedFolders.includes(label)) folder.classList.add("remembered");
});
if (openedFolders.length) {
  statusText.textContent = `${openedFolders.length} folder${openedFolders.length === 1 ? "" : "s"} remember you.`;
  availabilityDot.classList.add("hidden");
  window.setTimeout(() => {
    if (hoveredFolder) return;
    statusText.textContent = messages[messageIndex];
    availabilityDot.classList.toggle("hidden", messageIndex !== 0);
  }, 5200);
}
const rememberFolder = (folder, label) => {
  folder.classList.add("remembered");
  if (!openedFolders.includes(label)) openedFolders.push(label);
  localStorage.setItem(openedFolderKey, JSON.stringify(openedFolders));
  folderStats.counts[label] = (folderStats.counts[label] || 0) + 1;
  if (!sessionStorage.getItem("pravallika-space-first-folder")) {
    sessionStorage.setItem("pravallika-space-first-folder", label);
    folderStats.firstCounts[label] = (folderStats.firstCounts[label] || 0) + 1;
  }
  localStorage.setItem(folderStatsKey, JSON.stringify(folderStats));
};

folders.forEach((folder) => {
  folder.addEventListener("pointerenter", () => {
    const label = folder.querySelector("b")?.textContent || "This folder";
    hoveredFolder = folder;
    const firstNotes = {
      Ascent: "built for decisions under pressure",
      Clara: "responsible AI boundaries",
      Parks: "public futures, made discussable",
      Playground: "unfinished ideas are welcome here",
      About: "the personal file is being rewritten",
      Resume: "CV attached as a PDF"
    };
    statusText.textContent = folder.classList.contains("remembered") ? `${label} remembers you.` : firstNotes[label];
    availabilityDot.classList.add("hidden");
  });
  folder.addEventListener("pointerleave", () => {
    if (hoveredFolder !== folder) return;
    hoveredFolder = null;
    statusText.textContent = messages[messageIndex];
    availabilityDot.classList.toggle("hidden", messageIndex !== 0);
  });
  folder.addEventListener("pointerdown", (event) => {
    active = folder;
    const rect = folder.getBoundingClientRect();
    const deskRect = desktop.getBoundingClientRect();
    folder.style.left = `${rect.left - deskRect.left}px`;
    folder.style.top = `${rect.top - deskRect.top}px`;
    folder.style.right = "auto";
    folder.style.bottom = "auto";
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    dragDistance = 0;
    folder.classList.add("dragging");
    folder.style.transform = `rotate(${Math.random() * 5 - 2.5}deg)`;
    folder.setPointerCapture(event.pointerId);
    playTone("pickup");
  });
  folder.addEventListener("pointermove", (event) => {
    if (active !== folder) return;
    dragDistance = Math.max(dragDistance, Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY));
    const deskRect = desktop.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - deskRect.left - offsetX, deskRect.width - folder.offsetWidth));
    const y = Math.max(65, Math.min(event.clientY - deskRect.top - offsetY, deskRect.height - folder.offsetHeight - 65));
    folder.style.left = `${x}px`;
    folder.style.top = `${y}px`;
    if (event.timeStamp - lastMoveSound > 170) {
      playTone("move");
      lastMoveSound = event.timeStamp;
    }
  });
  folder.addEventListener("pointerup", () => {
    const openOnTap = window.matchMedia("(pointer: coarse)").matches && dragDistance < 8;
    folder.classList.remove("dragging");
    active = null;
    playTone("drop");
    if (openOnTap) folder.dispatchEvent(new MouseEvent("dblclick"));
  });
  folder.addEventListener("dblclick", () => {
    const label = folder.querySelector("b").textContent;
    rememberFolder(folder, label);
    if (label === "Ascent") {
      playTone("open");
      window.location.href = "ascent.html";
      return;
    }
    if (label === "Clara") {
      playTone("open");
      window.location.href = "clara.html";
      return;
    }
    if (label === "Parks") {
      playTone("open");
      window.location.href = "parks.html";
      return;
    }
    if (label === "Playground") {
      playTone("open");
      window.location.href = "playground.html";
      return;
    }
    if (label === "About") {
      playTone("open");
      window.location.href = "about.html";
      return;
    }
    if (label === "Resume") {
      playTone("open");
      window.location.href = "assets/Pravallika-Navuluru-CV.pdf";
      return;
    }
    const descriptions = {
      Ascent: ["CASE STUDY · INCIDENT COMMAND", "Helping incident commanders recognize firefighter risk and make timely rehab decisions."],
      Clara: ["CASE STUDY · RESPONSIBLE AI", "Designing support, trust, and human handoff boundaries for an AI mental-health concept."],
      Parks: ["CASE STUDY · PUBLIC FUTURES", "A first-prize sprint imagining parks that remember, respond, and include."],
      Playground: ["EXPERIMENTS · DRAFTS", "Small interface experiments, motion ideas, and concept sketches."],
      About: ["PERSONAL FILE", "A little context about how I think and what shapes my work."],
      Resume: ["DOCUMENT · PDF", "Experience, skills, and the places where I learned them."]
    };
    previewTitle.textContent = label;
    previewHeading.textContent = label;
    previewType.textContent = descriptions[label][0];
    previewCopy.textContent = descriptions[label][1];
    openFullStory.href = "#";
    lastPreviewTrigger = folder;
    previewWindow.classList.add("show");
    playTone("open");
    closePreview.focus();
  });
  folder.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    folder.dispatchEvent(new MouseEvent("dblclick"));
  });
});

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let proximityFrame = 0;
  desktop.addEventListener("pointermove", (event) => {
    if (proximityFrame) return;
    proximityFrame = requestAnimationFrame(() => {
      folders.forEach((folder) => {
        if (folder.classList.contains("dragging")) return;
        const rect = folder.getBoundingClientRect();
        const distance = Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2));
        folder.style.setProperty("--near", Math.max(0, 1 - distance / 180).toFixed(2));
      });
      proximityFrame = 0;
    });
  }, { passive: true });
}

document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle("page-paused", document.hidden);
});

document.querySelector("#minimizePreview").addEventListener("click", () => {
  hidePreview();
  playTone("click");
});
document.querySelector("#maximizePreview").addEventListener("click", () => {
  previewWindow.classList.toggle("maximized");
  playTone("click");
});

musicButton.addEventListener("click", () => {
  const playing = musicButton.classList.toggle("playing");
  musicButton.querySelector("span").textContent = playing ? "✦ playing something dreamy" : "✦ play something";
  vinylPanel.classList.toggle("show", playing);
});

const playlists = {
  day: [
    { title: "Darl+ing", artist: "day frequency", src: "assets/audio/darling.mp3", fallback: "", colors: ["#efb493", "#e8d37d"] },
    { title: "love.", artist: "soft signal", src: "assets/audio/love.mp3", fallback: "", colors: ["#9bcfbd", "#9ab8dc"] }
  ],
  night: [
    { title: "Diet Mountain Dew", artist: "night frequency", src: "assets/audio/diet-mountain-dew.mp3", fallback: "", colors: ["#8296bd", "#c1a8cf"] },
    { title: "Nothing", artist: "quiet tapes", src: "assets/audio/nothing.mp3", fallback: "", colors: ["#797aa0", "#d4ad9c"] }
  ]
};
let trackIndex = 0;
let currentTrack = null;
const renderTrack = () => {
  const playlist = desktop.classList.contains("night") ? playlists.night : playlists.day;
  trackIndex %= playlist.length;
  const track = playlist[trackIndex];
  currentTrack = track;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  playTrack.textContent = desktopAudio && !desktopAudio.paused && desktopAudio.src.includes(track.src || "__missing__") ? "Ⅱ" : "▶";
  playTrack.setAttribute("aria-label", `Play ${track.title}`);
  if (desktopAudio && track.src) {
    const nextSrc = new URL(track.src, window.location.href).href;
    if (desktopAudio.src !== nextSrc) {
      desktopAudio.pause();
      desktopAudio.src = nextSrc;
    }
  } else if (desktopAudio) {
    desktopAudio.removeAttribute("src");
    desktopAudio.load();
  }
  miniCover.style.background = `linear-gradient(145deg,${track.colors[0]},${track.colors[1]})`;
};
renderTrack();
const changeTrack = (direction) => {
  const playlist = desktop.classList.contains("night") ? playlists.night : playlists.day;
  trackIndex = (trackIndex + direction + playlist.length) % playlist.length;
  renderTrack();
  playTone("open");
};
document.querySelector("#previousTrack").addEventListener("click", () => changeTrack(-1));
document.querySelector("#nextTrack").addEventListener("click", () => changeTrack(1));
playTrack.addEventListener("click", async () => {
  playTone("open");
  if (!desktopAudio || !currentTrack?.src) {
    if (currentTrack?.fallback) window.open(currentTrack.fallback, "_blank", "noopener,noreferrer");
    return;
  }
  try {
    if (desktopAudio.paused) {
      await desktopAudio.play();
      playTrack.textContent = "Ⅱ";
      playTrack.setAttribute("aria-label", `Pause ${currentTrack.title}`);
      musicButton.classList.add("playing");
      musicButton.querySelector("span").textContent = "✦ playing something dreamy";
    } else {
      desktopAudio.pause();
      playTrack.textContent = "▶";
      playTrack.setAttribute("aria-label", `Play ${currentTrack.title}`);
    }
  } catch {
    if (currentTrack?.fallback) window.open(currentTrack.fallback, "_blank", "noopener,noreferrer");
  }
});
desktopAudio?.addEventListener("ended", () => {
  playTrack.textContent = "▶";
  playTrack.setAttribute("aria-label", currentTrack ? `Play ${currentTrack.title}` : "Play current track");
});

const clampMusicPanel = (left, top) => {
  const deskRect = desktop.getBoundingClientRect();
  const width = vinylPanel.offsetWidth || 310;
  const height = vinylPanel.offsetHeight || 64;
  return {
    left: Math.max(12, Math.min(left, deskRect.width - width - 12)),
    top: Math.max(76, Math.min(top, deskRect.height - height - 76))
  };
};
const placeMusicPanel = (left, top, save = false) => {
  const position = clampMusicPanel(left, top);
  vinylPanel.classList.add("user-positioned");
  vinylPanel.style.left = `${position.left}px`;
  vinylPanel.style.top = `${position.top}px`;
  vinylPanel.style.setProperty("--music-left", `${position.left}px`);
  vinylPanel.style.setProperty("--music-top", `${position.top}px`);
};

let musicDrag = null;
vinylPanel.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button,a,audio")) return;
  const rect = vinylPanel.getBoundingClientRect();
  const deskRect = desktop.getBoundingClientRect();
  musicDrag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  };
  placeMusicPanel(rect.left - deskRect.left, rect.top - deskRect.top);
  vinylPanel.classList.add("dragging");
  vinylPanel.setPointerCapture(event.pointerId);
});
vinylPanel.addEventListener("pointermove", (event) => {
  if (!musicDrag || musicDrag.pointerId !== event.pointerId) return;
  const deskRect = desktop.getBoundingClientRect();
  placeMusicPanel(
    event.clientX - deskRect.left - musicDrag.offsetX,
    event.clientY - deskRect.top - musicDrag.offsetY
  );
});
const finishMusicDrag = (event) => {
  if (!musicDrag || musicDrag.pointerId !== event.pointerId) return;
  vinylPanel.classList.remove("dragging");
  const left = Number.parseFloat(vinylPanel.style.left);
  const top = Number.parseFloat(vinylPanel.style.top);
  placeMusicPanel(left, top, true);
  musicDrag = null;
};
vinylPanel.addEventListener("pointerup", finishMusicDrag);
vinylPanel.addEventListener("pointercancel", finishMusicDrag);
window.addEventListener("pointerup", finishMusicDrag);
window.addEventListener("pointercancel", finishMusicDrag);
vinylPanel.addEventListener("lostpointercapture", () => {
  if (!musicDrag) return;
  vinylPanel.classList.remove("dragging");
  const left = Number.parseFloat(vinylPanel.style.left);
  const top = Number.parseFloat(vinylPanel.style.top);
  placeMusicPanel(left, top, true);
  musicDrag = null;
});
window.addEventListener("resize", () => {
  if (!vinylPanel.classList.contains("user-positioned")) return;
  placeMusicPanel(Number.parseFloat(vinylPanel.style.left), Number.parseFloat(vinylPanel.style.top));
});

closePreview.addEventListener("click", hidePreview);
previewWindow.addEventListener("keydown", (event) => {
  if (!previewWindow.classList.contains("show")) return;
  if (event.key === "Escape") {
    event.preventDefault();
    hidePreview();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = [...previewWindow.querySelectorAll("a, button, [tabindex]:not([tabindex='-1'])")]
    .filter((item) => !item.disabled && item.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
document.querySelector("#closeVinyl").addEventListener("click", () => {
  desktopAudio?.pause();
  if (playTrack) playTrack.textContent = "▶";
  vinylPanel.classList.remove("show");
  musicButton.classList.remove("playing");
  musicButton.querySelector("span").textContent = "✦ play something";
});
