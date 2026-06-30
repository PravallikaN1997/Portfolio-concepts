(() => {
  const syncVisibility = () => document.documentElement.classList.toggle("page-paused", document.hidden);
  document.addEventListener("visibilitychange", syncVisibility);
  const page = ["ascent", "clara", "parks", "playground", "about"]
    .find((name) => document.body.classList.contains(`${name}-case`)) || "site";

  const messages = {
    ascent: [
      "this one gets intense. the short version: calm systems make better decisions.",
      "look for the moments where uncertainty becomes visible, not hidden."
    ],
    clara: [
      "clara is less about answers and more about helping people notice the right question.",
      "the quietest interaction here is doing the most work."
    ],
    parks: [
      "this project began with a very ordinary question: where can we go nearby?",
      "small maps can still hold large feelings."
    ],
    playground: [
      "nothing here has to be useful yet. that is the point.",
      "try the odd-looking things first. they usually remember something."
    ],
    about: [
      "the right column keeps the evidence; the left keeps the story.",
      "some of the smallest notes took the longest to learn."
    ],
    site: ["i travel lightly between pages. click me when you need company."]
  };

  let retainedLights = [];
  try {
    const stored = JSON.parse(localStorage.getItem("pravallika_space_light_v1") || "[]");
    if (Array.isArray(stored)) retainedLights = stored.filter((color) => /^#[0-9a-f]{6}$/i.test(color));
  } catch {
    retainedLights = [];
  }
  if (retainedLights.length) {
    messages[page].unshift(`${retainedLights.length} little light${retainedLights.length === 1 ? " came" : "s came"} with you from the landing.`);
  }

  const pageLabels = { ascent: "Ascent", clara: "Clara", parks: "Parks", playground: "Playground", about: "About" };
  const pageVisitsKey = "pravallika-space-case-visits-v1";
  let pageVisits = {};
  try { pageVisits = JSON.parse(localStorage.getItem(pageVisitsKey) || "{}"); } catch { pageVisits = {}; }
  const previousPageVisit = Number(pageVisits[page]);
  if (Number.isFinite(previousPageVisit) && previousPageVisit > 0) {
    const days = Math.floor((Date.now() - previousPageVisit) / 86400000);
    const when = days === 0 ? "earlier today" : days === 1 ? "yesterday" : `${days} days ago`;
    messages[page].unshift(`You last visited ${pageLabels[page] || "this page"} ${when}.`);
  }
  pageVisits[page] = Date.now();
  localStorage.setItem(pageVisitsKey, JSON.stringify(pageVisits));
  sessionStorage.setItem("pravallika-space-current-case", page);

  let messageIndex = 0;
  const root = document.createElement("div");
  root.className = "site-friend";
  root.setAttribute("role", "complementary");
  root.setAttribute("aria-label", "Internet friend");
  if (retainedLights.length) {
    root.classList.add("has-light");
    root.style.setProperty("--visitor-light", retainedLights.at(-1));
  }
  root.innerHTML = `
    <div class="site-friend__card" id="site-friend-note">
      <span class="site-friend__eyebrow">internet friend</span>
      <p class="site-friend__message" aria-live="polite"></p>
      <button class="site-friend__close" type="button" aria-label="Close note">×</button>
    </div>
    <button class="site-friend__button" type="button" aria-label="Open a note from your internet friend" aria-controls="site-friend-note" aria-expanded="false"><i></i><b></b><span></span></button>`;

  const card = root.querySelector(".site-friend__card");
  const message = root.querySelector(".site-friend__message");
  const button = root.querySelector(".site-friend__button");
  const close = root.querySelector(".site-friend__close");
  const pageMessages = messages[page];

  const setOpen = (open) => {
    root.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
  };

  let presenceTimer;
  let departureTimer;
  const scheduleAppearance = (delay = 5000 + Math.random() * 5000) => {
    window.clearTimeout(presenceTimer);
    presenceTimer = window.setTimeout(() => {
      root.classList.add("is-present", "notices-you");
      window.setTimeout(() => root.classList.remove("notices-you"), 1400);
      departureTimer = window.setTimeout(() => {
        if (root.classList.contains("is-open")) return;
        root.classList.remove("is-present");
        scheduleAppearance(100000 + Math.random() * 50000);
      }, 12000);
    }, delay);
  };

  const showNext = () => {
    message.textContent = pageMessages[messageIndex % pageMessages.length];
    messageIndex += 1;
    setOpen(true);
  };

  button.addEventListener("click", () => {
    window.clearTimeout(departureTimer);
    if (root.classList.contains("is-open")) {
      setOpen(false);
      departureTimer = window.setTimeout(() => {
        root.classList.remove("is-present");
        scheduleAppearance(100000 + Math.random() * 50000);
      }, 1800);
    } else showNext();
  });
  close.addEventListener("click", () => {
    setOpen(false);
    button.focus();
    departureTimer = window.setTimeout(() => {
      root.classList.remove("is-present");
      scheduleAppearance(100000 + Math.random() * 50000);
    }, 1800);
  });

  document.body.append(root);

  document.querySelectorAll('a[href*="constellation.html"]').forEach((link) => {
    link.addEventListener("click", () => {
      const key = "pravallika-space-friend-state-v2";
      let state = {};
      try { state = JSON.parse(localStorage.getItem(key) || "{}"); } catch { state = {}; }
      state.pendingReturn = page;
      state.returnStartedAt = Date.now();
      localStorage.setItem(key, JSON.stringify(state));
    });
  });

  scheduleAppearance();
})();
