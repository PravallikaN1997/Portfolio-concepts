const root = document.documentElement;
const problemBar = document.querySelector('.problem-bar');
const equitySection = document.querySelector('.equity-section');

if (problemBar && equitySection) problemBar.after(equitySection);

const updateReadingProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  root.style.setProperty('--reading-progress', `${Math.min(100, progress)}%`);
};

window.addEventListener('scroll', updateReadingProgress, { passive: true });
updateReadingProgress();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = [...document.querySelectorAll('.reveal')];

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('in-view'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const parkStage = document.querySelector('.park-stage');
const parkModeButtons = [...document.querySelectorAll('[data-park-mode]')];
const modeCopy = document.querySelector('.mode-copy');
const soundToggle = document.querySelector('.sound-toggle');
let soundEnabled = false;

const playParkSound = (mode) => {
  if (!soundEnabled) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const audio = new AudioContextClass();
  const notes = mode === 'night' ? [392, 523, 659] : [659, 784, 988];
  notes.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = mode === 'night' ? 'sine' : 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, audio.currentTime + index * .11);
    gain.gain.linearRampToValueAtTime(.035, audio.currentTime + index * .11 + .02);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + index * .11 + .28);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(audio.currentTime + index * .11);
    oscillator.stop(audio.currentTime + index * .11 + .3);
  });
};

soundToggle?.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.classList.toggle('active', soundEnabled);
  soundToggle.setAttribute('aria-pressed', String(soundEnabled));
  soundToggle.lastChild.textContent = soundEnabled ? ' SOUND ON' : ' SOUND OFF';
  playParkSound(parkStage.dataset.parkState);
});

parkModeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const mode = button.dataset.parkMode;
    parkStage.dataset.parkState = mode;
    modeCopy.textContent = mode === 'night' ? 'NIGHT · LIGHT, SAFETY, SOCIAL PLAY' : 'DAY · STORIES, PLAY, REST';
    playParkSound(mode);

    parkModeButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  });
});

const lensContent = {
  phone: {
    icon: 'NO APP',
    headline: 'Participation cannot begin with a download.',
    need: 'A phone, data plan, account, or QR code should never be the only entrance to the experience.',
    principle: 'PHYSICAL-FIRST ACCESS',
    response: 'Let movement, touch, signage, and staffed moments work independently; make digital layers optional.',
    tags: ['NO ACCOUNT', 'MULTIPLE FORMATS', 'VISIBLE INSTRUCTIONS']
  },
  mobility: {
    icon: 'MOVE DIFFERENTLY',
    headline: 'Play cannot require standing, speed, or a specific range of motion.',
    need: 'A responsive park should notice varied movement without turning mobility into a test or spectacle.',
    principle: 'EQUIVALENT PARTICIPATION',
    response: 'Support wheels, hands, seated pressure pads, gentle gestures, resting, and passive viewing as valid inputs.',
    tags: ['SEATED INPUT', 'LEVEL ROUTES', 'REST COUNTS']
  },
  sensory: {
    icon: 'CALMER ENTRY',
    headline: 'Delight becomes exclusion when every sense is activated at once.',
    need: 'Visitors need predictable intensity, quieter paths, and the ability to understand what will happen before joining.',
    principle: 'CHOICE BEFORE STIMULATION',
    response: 'Offer calm modes, low-sensory hours, gradual light, captions, transcripts, and routes around active zones.',
    tags: ['CALM MODE', 'PREVIEW FIRST', 'CONTROL INTENSITY']
  },
  night: {
    icon: 'AFTER DARK',
    headline: 'A playful night park still has to communicate safety.',
    need: 'People should be able to read faces, routes, exits, boundaries, and help points without losing the atmosphere.',
    principle: 'ENCHANTMENT WITH LEGIBILITY',
    response: 'Keep navigation lighting steady while responsive layers play above it; never make safety depend on participation.',
    tags: ['VISIBLE EXITS', 'STEADY PATH LIGHT', 'PASSIVE SAFETY']
  },
  care: {
    icon: 'MOVE TOGETHER',
    headline: 'Caregivers often participate while monitoring someone else.',
    need: 'The experience must work across different energy levels without separating people into incompatible zones.',
    principle: 'SHARED, NOT IDENTICAL',
    response: 'Place seating inside the social field, preserve sightlines, and let one group create effects another can enjoy.',
    tags: ['CLEAR SIGHTLINES', 'SOCIAL SEATING', 'MIXED ENERGY']
  }
};

const lensButtons = [...document.querySelectorAll('[data-lens]')];
const equityStage = document.querySelector('.equity-stage');

lensButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const content = lensContent[button.dataset.lens];
    equityStage.querySelector('.lens-icon').textContent = content.icon;
    equityStage.querySelector('.lens-headline').textContent = content.headline;
    equityStage.querySelector('.lens-need').textContent = content.need;
    equityStage.querySelector('.lens-principle').textContent = content.principle;
    equityStage.querySelector('.lens-response').textContent = content.response;
    equityStage.querySelector('.response-card>div').innerHTML = content.tags.map((tag) => `<span>${tag}</span>`).join('');
    equityStage.setAttribute('aria-labelledby', button.id);

    lensButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
  });
});

const routeButtons = [...document.querySelectorAll('[data-route]')];
const routePanels = [...document.querySelectorAll('.route-panel')];

routeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = `${button.dataset.route}-route`;

    routeButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
    });

    routePanels.forEach((panel) => {
      const selected = panel.id === target;
      panel.classList.toggle('active', selected);
      panel.hidden = !selected;
    });
  });
});

const memoryFormats = {
  voice: { icon: ')))', title: 'A voice from this summer', meta: 'Audio · transcript available' },
  text: { icon: 'Aa', title: 'A story in your own words', meta: 'Text · translation available' },
  drawing: { icon: '///', title: 'A drawing of this moment', meta: 'Image · description available' }
};

const formatButtons = [...document.querySelectorAll('[data-memory-format]')];
const memoryArtifact = document.querySelector('.memory-artifact');

formatButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const format = button.dataset.memoryFormat;
    const content = memoryFormats[format];
    memoryArtifact.dataset.format = format;
    memoryArtifact.querySelector('.artifact-icon').textContent = content.icon;
    memoryArtifact.querySelector('.artifact-title').textContent = content.title;
    memoryArtifact.querySelector('.artifact-meta').textContent = content.meta;

    formatButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  });
});

const memoryPrototype = document.querySelector('.memory-prototype');
const plantMemory = document.querySelector('.plant-memory');
const resetMemory = document.querySelector('.reset-memory');

plantMemory?.addEventListener('click', () => {
  const planted = memoryPrototype.classList.toggle('planted');
  plantMemory.setAttribute('aria-pressed', String(planted));
});

resetMemory?.addEventListener('click', () => {
  memoryPrototype.classList.remove('planted');
  plantMemory.setAttribute('aria-pressed', 'false');
  plantMemory.focus();
});

const lightPrototype = document.querySelector('.light-prototype');
const lightTiles = [...document.querySelectorAll('.light-grid i')];
const energyButtons = [...document.querySelectorAll('[data-energy-mode]')];

energyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    lightPrototype.dataset.energy = button.dataset.energyMode;
    energyButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  });
});

const lightFromPoint = (clientX, clientY) => {
  const bounds = lightPrototype.getBoundingClientRect();
  const column = Math.max(0, Math.min(5, Math.floor(((clientX - bounds.left) / bounds.width) * 6)));
  const row = Math.max(0, Math.min(4, Math.floor(((clientY - bounds.top) / bounds.height) * 5)));
  const activeIndex = row * 6 + column;
  const radius = lightPrototype.dataset.energy === 'active' ? 2 : 1;

  lightTiles.forEach((tile, index) => {
    const columnDistance = Math.abs((index % 6) - column);
    const rowDistance = Math.abs(Math.floor(index / 6) - row);
    tile.classList.toggle('lit', columnDistance <= radius && rowDistance <= radius);
  });
};

lightPrototype?.addEventListener('pointermove', (event) => lightFromPoint(event.clientX, event.clientY));
lightPrototype?.addEventListener('pointerleave', () => lightTiles.forEach((tile) => tile.classList.remove('lit')));
