(() => {
  const deck = document.querySelector("#photo-deck");
  const cards = [...document.querySelectorAll(".photo-card")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activePhoto = 0;
  let photoTimer;

  const showPhoto = (index) => {
    activePhoto = index % cards.length;
    cards.forEach((card, cardIndex) => card.classList.toggle("is-active", cardIndex === activePhoto));
  };

  const schedulePhotos = () => {
    clearInterval(photoTimer);
    if (!reducedMotion && cards.length > 1) photoTimer = setInterval(() => showPhoto(activePhoto + 1), 4800);
  };
  if (cards.length) showPhoto(Math.floor(Math.random() * cards.length));

  deck?.addEventListener("click", () => {
    showPhoto(activePhoto + 1);
    schedulePhotos();
  });
  if (!reducedMotion && deck) {
    const deckObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) schedulePhotos();
      else clearInterval(photoTimer);
    }, { threshold: 0.35 });
    deckObserver.observe(deck);
  }

  const currentItems = [...document.querySelectorAll(".currently-board li")];
  let activeCurrent = 0;
  let currentTimer;
  const showCurrentItem = (index) => {
    if (!currentItems.length) return;
    activeCurrent = index % currentItems.length;
    currentItems.forEach((item, itemIndex) => item.classList.toggle("is-current", itemIndex === activeCurrent));
  };
  if (currentItems.length) showCurrentItem(0);
  if (!reducedMotion && currentItems.length > 1) {
    const currentObserver = new IntersectionObserver(([entry]) => {
      clearInterval(currentTimer);
      if (entry.isIntersecting) currentTimer = setInterval(() => showCurrentItem(activeCurrent + 1), 3400);
    }, { threshold: 0.3 });
    currentObserver.observe(document.querySelector(".currently-board"));
  }

  const signalObjects = [...document.querySelectorAll(".signal-object")];
  const signalDisplay = document.querySelector(".desk-frequency");
  const deskFrequency = document.querySelector(".desk-frequency");
  const signalLabel = document.querySelector("#signal-label");
  const signalTitle = document.querySelector("#signal-title");
  const signalKicker = document.querySelector("#signal-kicker");
  const signalNote = document.querySelector("#signal-note");
  let tvAudioContext;
  const playTvClick = () => {
    const soundSetting = localStorage.getItem("pravallika-space-sound") || localStorage.getItem("life-exe-sound") || "on";
    if (soundSetting !== "on") return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    tvAudioContext ||= new AudioContextClass();
    if (tvAudioContext.state === "suspended") tvAudioContext.resume();
    const now = tvAudioContext.currentTime;
    const oscillator = tvAudioContext.createOscillator();
    const gain = tvAudioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(125, now);
    oscillator.frequency.exponentialRampToValueAtTime(72, now + .045);
    gain.gain.setValueAtTime(.035, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + .055);
    oscillator.connect(gain).connect(tvAudioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + .06);

    const noiseLength = Math.floor(tvAudioContext.sampleRate * .075);
    const noiseBuffer = tvAudioContext.createBuffer(1, noiseLength, tvAudioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let index = 0; index < noiseLength; index += 1) {
      noiseData[index] = (Math.random() * 2 - 1) * (1 - index / noiseLength);
    }
    const noise = tvAudioContext.createBufferSource();
    const noiseFilter = tvAudioContext.createBiquadFilter();
    const noiseGain = tvAudioContext.createGain();
    noise.buffer = noiseBuffer;
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1450;
    noiseFilter.Q.value = .7;
    noiseGain.gain.setValueAtTime(.012, now);
    noiseGain.gain.exponentialRampToValueAtTime(.001, now + .075);
    noise.connect(noiseFilter).connect(noiseGain).connect(tvAudioContext.destination);
    noise.start(now);
  };
  let activeSignal = 0;
  let signalTimer;
  let tuningTimer;
  const activateSignal = (button, index) => {
    if (!button) return;
    activeSignal = index;
    signalObjects.forEach((item, itemIndex) => {
      const selected = itemIndex === index;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    if (deskFrequency) {
      deskFrequency.dataset.mode = button.dataset.mode;
      deskFrequency.classList.remove("is-tuning");
      void deskFrequency.offsetWidth;
      deskFrequency.classList.add("is-tuning");
    }
    clearTimeout(tuningTimer);
    signalDisplay?.classList.remove("is-changing", "is-tuning");
    void signalDisplay?.offsetWidth;
    signalDisplay?.classList.add("is-changing", "is-tuning");
    tuningTimer = window.setTimeout(() => {
      signalDisplay?.classList.remove("is-tuning");
      deskFrequency?.classList.remove("is-tuning");
    }, reducedMotion ? 0 : 520);
    if (signalLabel) signalLabel.textContent = `FREQUENCY ${String(index + 1).padStart(2, "0")} / ${button.dataset.label}`;
    if (signalTitle) signalTitle.textContent = button.dataset.title;
    if (signalKicker) signalKicker.textContent = button.dataset.kicker;
    if (signalNote) signalNote.textContent = button.dataset.note;
  };
  const scheduleSignals = () => {
    clearInterval(signalTimer);
    if (!reducedMotion && signalObjects.length > 1) {
      signalTimer = setInterval(() => activateSignal(signalObjects[(activeSignal + 1) % signalObjects.length], (activeSignal + 1) % signalObjects.length), 9000);
    }
  };
  signalObjects.forEach((object) => object.addEventListener("click", () => {
    const index = Number(object.dataset.signalIndex);
    playTvClick();
    activateSignal(object, index);
    scheduleSignals();
  }));
  if (!reducedMotion && deskFrequency) {
    const signalObserver = new IntersectionObserver(([entry]) => entry.isIntersecting ? scheduleSignals() : clearInterval(signalTimer), { threshold: 0.4 });
    signalObserver.observe(deskFrequency);
  }

  document.querySelectorAll(".observation").forEach((note) => {
    const toggleNote = () => note.classList.toggle("is-open");
    note.addEventListener("click", toggleNote);
    note.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleNote();
    });
  });

  const mediaReels = [...document.querySelectorAll(".media-reel")];
  const reelTimers = new Map();
  const startReel = (reel, reelIndex) => {
    const images = [...reel.querySelectorAll("img")];
    if (reducedMotion || images.length < 2 || reelTimers.has(reel)) return;
    let active = Math.max(0, images.findIndex((image) => image.classList.contains("is-active")));
    const interval = Number(reel.dataset.interval) || 4400;
    reelTimers.set(reel, setInterval(() => {
      active = (active + 1) % images.length;
      images.forEach((image, index) => image.classList.toggle("is-active", index === active));
    }, interval + reelIndex * 130));
  };
  const stopReel = (reel) => {
    clearInterval(reelTimers.get(reel));
    reelTimers.delete(reel);
  };
  if (!reducedMotion && mediaReels.length) {
    const reelsObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      const reelIndex = mediaReels.indexOf(entry.target);
      if (entry.isIntersecting) startReel(entry.target, reelIndex);
      else stopReel(entry.target);
    }), { threshold: 0.25 });
    mediaReels.forEach((reel) => reelsObserver.observe(reel));
  }

  const journey = document.querySelector(".journey-timeline");
  const journeyStops = [...document.querySelectorAll(".journey-timeline li")];
  const journeyScrubber = document.querySelector("#journey-scrubber");
  const timelineYear = document.querySelector("#timeline-year");
  const timelineThought = document.querySelector("#timeline-thought");
  const showJourneyStop = (index, interactive = true) => {
    const stop = journeyStops[index];
    if (!stop) return;
    journey?.classList.toggle("is-scrubbing", interactive);
    journeyStops.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === index));
    if (journeyScrubber) journeyScrubber.value = String(index);
    if (timelineYear) timelineYear.textContent = stop.dataset.year;
    if (timelineThought) timelineThought.textContent = stop.dataset.thought;
  };
  journeyScrubber?.addEventListener("input", () => showJourneyStop(Number(journeyScrubber.value)));
  journeyStops.forEach((stop, index) => {
    stop.addEventListener("click", () => showJourneyStop(index));
    stop.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      showJourneyStop(index);
    });
  });

  const assumptionCards = [...document.querySelectorAll(".assumption-card")];
  const researchPanel = document.querySelector(".research-focus");
  let assumptionIndex = 0;
  let assumptionTimer;
  const scheduleAssumptions = () => {
    clearInterval(assumptionTimer);
    if (reducedMotion || assumptionCards.length < 2) return;
    assumptionTimer = setInterval(() => {
      assumptionCards.forEach((card, index) => card.classList.toggle("is-pulsing", index === assumptionIndex));
      assumptionIndex = (assumptionIndex + 1) % assumptionCards.length;
    }, 2400);
  };
  assumptionCards.forEach((card) => card.addEventListener("click", () => {
    card.classList.remove("is-pulsing");
    card.classList.toggle("is-broken");
  }));
  if (!reducedMotion && researchPanel) {
    const assumptionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) scheduleAssumptions();
      else clearInterval(assumptionTimer);
    }, { threshold: 0.45 });
    assumptionObserver.observe(researchPanel);
    researchPanel.addEventListener("pointerenter", () => {
      clearInterval(assumptionTimer);
      assumptionCards.forEach((card) => card.classList.remove("is-pulsing"));
    });
    researchPanel.addEventListener("pointerleave", scheduleAssumptions);
  }

  const drawer = document.querySelector("#field-notes-drawer");
  const drawerToggle = document.querySelector("#field-notes-toggle");
  const drawerClose = document.querySelector("#field-notes-close");
  const setDrawer = (open) => {
    drawer?.classList.toggle("open", open);
    drawer?.setAttribute("aria-hidden", String(!open));
    if (drawer) drawer.inert = !open;
    drawerToggle?.setAttribute("aria-expanded", String(open));
  };
  drawerToggle?.addEventListener("click", () => setDrawer(!drawer?.classList.contains("open")));
  drawerClose?.addEventListener("click", () => {
    setDrawer(false);
    drawerToggle?.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !drawer?.classList.contains("open")) return;
    setDrawer(false);
    drawerToggle?.focus();
  });

  if (!reducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("has-motion");
    const revealTargets = [...document.querySelectorAll(".journey-timeline li, .education-journey footer p, .research-focus, .observation, .wondering-note, .margin-thought, .after-hours")];
    revealTargets.forEach((item, index) => {
      item.classList.add("reveal-item");
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
    });
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18 });
    revealTargets.forEach((item) => revealObserver.observe(item));
  }
})();
