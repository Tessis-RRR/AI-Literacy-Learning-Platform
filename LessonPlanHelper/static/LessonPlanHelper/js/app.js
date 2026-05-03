/* ============================================================
   ESL Co-Pilot — App logic & rendering
   ============================================================ */

/* ── State ──────────────────────────────────────────────── */
const state = {
  view: 'dashboard',
  moduleId: null,
  stepIndex: 0,
  progress: {},
  quizAnswers: {},
  quizChecked: false,
  builderValues: {},
  reflectionValues: {},
  // Attempt counters (for score trajectory)
  fullPracticeAttempt: 0,
  reflectionRegenAttempt: 0,
  // Pre-test
  pretestPrompt: '',
  pretestEval: null,       // { scores, total, feedback, overall }
  introSkipped: false,
  // Shell dashboard state
  dashNav: 'dashboard',
  dashModuleId: null,
  dashSearch: '',
  dashFilter: 'all',
  // Faded example
  fadedValues: {},         // { goal, context, task, constraints, output } — completion text only
  fadedGenerated: '',
  fadedActiveField: 0,     // index of currently active field
  fadedFieldEvals: {},     // { goal: "feedback text", ... }
  fadedFieldScores: {},    // { goal: 2, ... }
  fadedFieldDone: {},      // { goal: true } — field has been evaluated at least once
  // Annotated
  annotatedMatches: {},
  annotatedOrder: {},
  // Full practice
  fullPracticeValues: {},  // { goal, context, task, constraints, output }
  fullPracticeEval: null,
  fullPracticeGenerated: '',
  fullPracticePrevGenerated: '',
  // Self-reflection
  reflectionAnswers: {},
  reflectionEditValues: null,
  reflectionGibberish: false,
  reflectionCurrentQ: 0,
  reflectionPrevGenerated: '',
  reflectionOutputChunks: [],
  reflectionSemanticHighlights: [],
  reflectionMeaningfulHighlightOn: false,
  reflectionPrevPromptValues: null,
  // Post-test
  posttestPrompt: '',
  posttestEval: null
};

/* ── Progress persistence ───────────────────────────────── */
function loadProgress() {
  try {
    const saved = localStorage.getItem('promptcraft_progress');
    if (saved) {
      const p = JSON.parse(saved);
      Object.keys(p).forEach(k => {
        p[k].stepsVisited = new Set(p[k].stepsVisited || []);
      });
      state.progress = p;
    }
  } catch (_) { }
}
function saveProgress() {
  try {
    const toSave = {};
    Object.keys(state.progress).forEach(k => {
      toSave[k] = {
        stepsVisited: [...state.progress[k].stepsVisited],
        completed: state.progress[k].completed
      };
    });
    localStorage.setItem('promptcraft_progress', JSON.stringify(toSave));
  } catch (_) { }
}
function markStepVisited(moduleId, stepIndex) {
  if (!state.progress[moduleId]) {
    state.progress[moduleId] = { stepsVisited: new Set(), completed: false };
  }
  state.progress[moduleId].stepsVisited.add(stepIndex);
  saveProgress();
}
function markModuleComplete(moduleId) {
  if (!state.progress[moduleId]) {
    state.progress[moduleId] = { stepsVisited: new Set(), completed: false };
  }
  state.progress[moduleId].completed = true;
  saveProgress();
  API.logEvent('module_complete', { moduleId });
}
function getModuleProgress(moduleId) {
  const mod = MODULES.find(m => m.id === moduleId);
  if (!mod) return 0;
  const p = state.progress[moduleId];
  if (!p) return 0;
  if (p.completed) return 100;
  return Math.round((p.stepsVisited.size / mod.steps) * 100);
}
function totalProgress() {
  const totalSteps = MODULES.reduce((s, m) => s + m.steps, 0);
  const visited = MODULES.reduce((s, m) => {
    const p = state.progress[m.id];
    if (!p) return s;
    if (p.completed) return s + m.steps;
    return s + p.stepsVisited.size;
  }, 0);
  return Math.round((visited / totalSteps) * 100);
}

/* ── Navigation ─────────────────────────────────────────── */
function navigateDashboard() {
  state.view = 'dashboard';
  state.dashNav = 'dashboard';
  state.moduleId = null;
  state.stepIndex = 0;
  render();
}
function navigateStep(moduleId, stepIndex) {
  Tracker.endStep();
  state.view = 'step';
  state.moduleId = moduleId;
  state.stepIndex = stepIndex;
  state.quizAnswers = {};
  state.quizChecked = false;
  markStepVisited(moduleId, stepIndex);
  const mod = MODULES.find(m => m.id === moduleId);
  const stepType = mod?.steps_data?.[stepIndex]?.type || 'unknown';
  Tracker.startStep(moduleId, stepIndex, stepType);
  API.logEvent('navigate_step', { moduleId, stepIndex, stepType });
  render();
}
function nextStep() {
  Tracker.click('next_step');
  const mod = MODULES.find(m => m.id === state.moduleId);
  if (!mod) return;

  // Branch: skip intro (step 1) if pre-test score was high
  if (state.stepIndex === 0 && state.introSkipped) {
    markStepVisited(state.moduleId, 1); // count intro as visited
    navigateStep(state.moduleId, 2);
    return;
  }

  if (state.stepIndex < mod.steps_data.length - 1) {
    navigateStep(state.moduleId, state.stepIndex + 1);
  } else {
    markModuleComplete(state.moduleId);
    state.view = 'complete';
    render();
  }
}
function prevStep() {
  Tracker.click('prev_step');
  if (state.stepIndex > 0) {
    navigateStep(state.moduleId, state.stepIndex - 1);
  }
}
function reviewIntro() {
  navigateStep(state.moduleId, 1);
}

/* ── Root render ────────────────────────────────────────── */
function render() {
  renderHeader();
  const main = document.getElementById('app-main');
  switch (state.view) {
    case 'dashboard': main.innerHTML = renderDashboard(); break;
    case 'step': main.innerHTML = renderStep(); attachStepListeners(); break;
    case 'complete': main.innerHTML = renderComplete(); break;
    default: main.innerHTML = renderDashboard();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Header ─────────────────────────────────────────────── */
function renderHeader() {
  const header = document.getElementById('app-header');
  if (state.view === 'dashboard') {
    header.classList.add('hidden');
    document.body.classList.add('dashboard-active');
    return;
  }
  document.body.classList.remove('dashboard-active');
  const pct = totalProgress();
  const username = getParticipantId();
  const mod = MODULES.find(m => m.id === state.moduleId);
  const modPct = mod ? getModuleProgress(mod.id) : 0;
  const userBadge = username
    ? `<div style="display:flex;align-items:center;gap:0.5rem;margin-left:auto">
         <span style="font-size:0.8rem;color:var(--text-secondary);font-weight:500">@${username}</span>
         <button onclick="logout()" style="font-size:0.75rem;padding:0.25rem 0.6rem;border:1px solid var(--border);border-radius:6px;background:transparent;cursor:pointer;color:var(--text-secondary)">Switch</button>
       </div>`
    : '';
  header.classList.remove('hidden');
  header.innerHTML = `
    <div class="header-inner">
      <a class="header-logo" href="#" onclick="navigateDashboard(); return false;">
        <div class="header-logo-icon">✦</div>
        <span class="header-logo-text">ESL Co-Pilot</span>
      </a>
      <div class="header-progress-wrap">
        <div class="header-progress-label">${mod ? mod.title : ''} — ${modPct}%</div>
        <div class="header-progress-bar-bg">
          <div class="header-progress-bar-fill" style="width:${modPct}%"></div>
        </div>
      </div>
      <button class="header-back-btn" onclick="navigateDashboard()">← Dashboard</button>
      ${userBadge}
    </div>`;
}

/* ── Dashboard helpers ──────────────────────────────────── */
const STEP_META = [
  { icon: '📝', bg: '#DBEAFE', color: '#1D4ED8', label: 'Pre-Test' },
  { icon: '💡', bg: '#EDE9FE', color: '#5B21B6', label: 'Framework' },
  { icon: '🔍', bg: '#D1FAE5', color: '#065F46', label: 'Worked Example' },
  { icon: '✏️', bg: '#FEF3C7', color: '#92400E', label: 'Faded Example' },
  { icon: '🚀', bg: '#FCE7F3', color: '#9D174D', label: 'Full Practice' },
  { icon: '🪞', bg: '#FEE2E2', color: '#991B1B', label: 'Self-Reflection' },
  { icon: '🏆', bg: '#FEF9C3', color: '#713F12', label: 'Post-Test' },
];

function iconSVG(name, size = 18, stroke = 2) {
  const paths = {
    search:    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell:      '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    mail:      '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    home:      '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
    book:      '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"/><path d="M4 5v15"/><path d="M9 7h6"/>',
    builder:   '<path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 14h6"/><path d="M9 18h6"/>',
    sheet:     '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
    grid:      '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    chart:     '<path d="M3 21h18"/><rect x="6" y="12" width="3" height="7" rx="0.5"/><rect x="11" y="7" width="3" height="12" rx="0.5"/><rect x="16" y="14" width="3" height="5" rx="0.5"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 11h6"/><path d="M9 15h4"/>',
    settings:  '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    arrowR:    '<path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>',
    arrowL:    '<path d="M19 12H5"/><path d="m11 19-7-7 7-7"/>',
    play:      '<path d="M6 4v16l14-8z"/>',
    check:     '<path d="m5 12 5 5 9-11"/>',
    plus:      '<path d="M12 5v14"/><path d="M5 12h14"/>',
    sparkle:   '<path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="m6 6 2.5 2.5"/><path d="m15.5 15.5 2.5 2.5"/><path d="m6 18 2.5-2.5"/><path d="m15.5 8.5 2.5-2.5"/>',
    clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    list:      '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
    file:      '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
    bookmark:  '<path d="m6 3 12 0v18l-6-4-6 4z"/>',
    moreH:     '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    users:     '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8"/><path d="M22 21a7 7 0 0 0-5-6.7"/>',
    target:    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
    flame:     '<path d="M12 2s4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 1-3s-1 4 1 5c1-3 2-4 2-7 1 1 4 4 4 8a6 6 0 1 1-12 0c0-5 4-7 4-11"/>',
    folder:    '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    send:      '<path d="m4 4 16 8-16 8 4-8z"/>',
    lock:      '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    bolt:      '<path d="M13 3 4 14h6l-1 7 9-11h-6z"/>',
  };
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + stroke + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || '') + '</svg>';
}

function illustrationSVG(name, accent, tint, size) {
  size = size || 132;
  const id = 'g' + name + accent.replace('#', '');
  if (name === 'spark') return '<svg viewBox="0 0 132 132" width="' + size + '" height="' + size + '"><defs><linearGradient id="' + id + '" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="' + accent + '" stop-opacity="0.95"/><stop offset="100%" stop-color="' + accent + '" stop-opacity="0.55"/></linearGradient></defs><rect width="132" height="132" fill="' + tint + '"/><path d="M66 28 L74 56 L102 64 L74 72 L66 100 L58 72 L30 64 L58 56 Z" fill="url(#' + id + ')" stroke="' + accent + '" stroke-width="1.5" stroke-linejoin="round"/><circle cx="106" cy="32" r="4" fill="' + accent + '" opacity="0.6"/><circle cx="26" cy="100" r="3" fill="' + accent + '" opacity="0.5"/><circle cx="20" cy="38" r="2" fill="' + accent + '" opacity="0.4"/></svg>';
  if (name === 'crane') return '<svg viewBox="0 0 132 132" width="' + size + '" height="' + size + '"><rect width="132" height="132" fill="' + tint + '"/><path d="M28 104 L28 32 L96 32" fill="none" stroke="' + accent + '" stroke-width="3" stroke-linecap="round"/><path d="M28 32 L62 22 L62 32 Z" fill="' + accent + '" opacity="0.7"/><path d="M70 32 L70 50" stroke="' + accent + '" stroke-width="3" stroke-linecap="round"/><rect x="60" y="50" width="20" height="14" rx="2" fill="' + accent + '"/><rect x="22" y="98" width="14" height="10" rx="1.5" fill="' + accent + '" opacity="0.8"/><path d="M44 104 L88 104 L96 90 L52 90 Z" fill="white" stroke="' + accent + '" stroke-width="2"/><rect x="58" y="94" width="8" height="6" fill="' + accent + '" opacity="0.4"/><rect x="72" y="94" width="8" height="6" fill="' + accent + '" opacity="0.4"/></svg>';
  if (name === 'pen') return '<svg viewBox="0 0 132 132" width="' + size + '" height="' + size + '"><rect width="132" height="132" fill="' + tint + '"/><rect x="28" y="32" width="60" height="76" rx="4" fill="white" stroke="' + accent + '" stroke-width="2"/><path d="M40 50 H76" stroke="' + accent + '" stroke-width="2" stroke-linecap="round" opacity="0.6"/><path d="M40 62 H76" stroke="' + accent + '" stroke-width="2" stroke-linecap="round" opacity="0.6"/><path d="M40 74 H66" stroke="' + accent + '" stroke-width="2" stroke-linecap="round" opacity="0.6"/><path d="M40 86 H72" stroke="' + accent + '" stroke-width="2" stroke-linecap="round" opacity="0.4"/><g transform="translate(72 22) rotate(35)"><rect x="0" y="0" width="10" height="50" rx="2" fill="' + accent + '"/><path d="M0 50 L5 60 L10 50 Z" fill="#1A1830"/><rect x="0" y="0" width="10" height="8" fill="' + accent + '" opacity="0.7"/></g></svg>';
  if (name === 'gear') {
    const teeth = [0,45,90,135,180,225,270,315].map(function(a) {
      return '<rect x="-6" y="-42" width="12" height="14" rx="2" fill="' + accent + '" transform="rotate(' + a + ')"/>';
    }).join('');
    return '<svg viewBox="0 0 132 132" width="' + size + '" height="' + size + '"><rect width="132" height="132" fill="' + tint + '"/><g transform="translate(66 66)">' + teeth + '<circle r="32" fill="white" stroke="' + accent + '" stroke-width="2.5"/><circle r="14" fill="' + accent + '" opacity="0.25"/><circle r="6" fill="' + accent + '"/></g><circle cx="32" cy="36" r="8" fill="' + accent + '" opacity="0.4"/><circle cx="100" cy="100" r="5" fill="' + accent + '" opacity="0.55"/></svg>';
  }
  if (name === 'chart') return '<svg viewBox="0 0 132 132" width="' + size + '" height="' + size + '"><rect width="132" height="132" fill="' + tint + '"/><path d="M22 104 H110" stroke="' + accent + '" stroke-width="2" stroke-linecap="round" opacity="0.4"/><rect x="32" y="74" width="14" height="30" rx="3" fill="' + accent + '" opacity="0.45"/><rect x="54" y="50" width="14" height="54" rx="3" fill="' + accent + '" opacity="0.7"/><rect x="76" y="32" width="14" height="72" rx="3" fill="' + accent + '"/><path d="M22 28 Q40 38 56 30 T100 22" fill="none" stroke="#1A1830" stroke-width="2" stroke-linecap="round" opacity="0.5"/><circle cx="56" cy="30" r="3" fill="#1A1830"/><circle cx="100" cy="22" r="3" fill="#1A1830"/></svg>';
  if (name === 'clipboard') return '<svg viewBox="0 0 132 132" width="' + size + '" height="' + size + '"><rect width="132" height="132" fill="' + tint + '"/><rect x="32" y="28" width="56" height="80" rx="6" fill="white" stroke="' + accent + '" stroke-width="2"/><rect x="48" y="20" width="24" height="14" rx="3" fill="' + accent + '"/><circle cx="60" cy="27" r="2.5" fill="white"/><path d="M44 50 H68" stroke="' + accent + '" stroke-width="2" stroke-linecap="round" opacity="0.55"/><path d="M44 62 H76" stroke="' + accent + '" stroke-width="2" stroke-linecap="round" opacity="0.55"/><path d="M44 74 H72" stroke="' + accent + '" stroke-width="2" stroke-linecap="round" opacity="0.4"/><circle cx="92" cy="86" r="14" fill="' + accent + '"/><path d="m86 86 4 4 8-8" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return '<svg viewBox="0 0 132 132" width="' + size + '" height="' + size + '"><rect width="132" height="132" fill="' + tint + '"/></svg>';
}

function heroOrnamentSVG() {
  return '<svg class="sh-hero-ornament" viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden="true"><defs><radialGradient id="herorad" cx="100%" cy="0%" r="70%"><stop offset="0%" stop-color="rgba(255,255,255,0.35)"/><stop offset="60%" stop-color="rgba(255,255,255,0)"/></radialGradient></defs><rect width="800" height="300" fill="url(#herorad)"/><g fill="white" opacity="0.55"><path d="M620 60 l8 28 28 8 -28 8 -8 28 -8 -28 -28 -8 28 -8 z"/><path d="M720 180 l5 18 18 5 -18 5 -5 18 -5 -18 -18 -5 18 -5 z"/><path d="M530 220 l4 14 14 4 -14 4 -4 14 -4 -14 -14 -4 14 -4 z"/><path d="M460 80 l3 11 11 3 -11 3 -3 11 -3 -11 -11 -3 11 -3 z" opacity="0.7"/></g></svg>';
}

/* ── Shell navigation ────────────────────────────────────── */
function shellNav(nav, moduleId) {
  state.dashNav = nav;
  state.dashModuleId = moduleId || null;
  if (nav !== 'modules' && nav !== 'detail') state.dashSearch = '';
  render();
}

function shellOpenModule(id) {
  const mod = MODULES.find(m => m.id === id);
  if (mod && mod.steps_data && mod.steps_data.length > 0) {
    // Module has real content — go directly to its steps
    const visited = state.progress[mod.id]?.stepsVisited;
    const next = visited ? Math.min(visited.size, mod.steps_data.length - 1) : 0;
    navigateStep(mod.id, next);
  } else {
    // No steps yet — show the detail/info page
    shellNav('detail', id);
  }
}

function shellStartModule(id) {
  const mod = MODULES.find(m => m.id === id);
  if (!mod || !mod.steps_data || mod.steps_data.length === 0) return;
  const visited = state.progress[mod.id]?.stepsVisited;
  const next = visited ? Math.min(visited.size, mod.steps_data.length - 1) : 0;
  navigateStep(mod.id, next);
}

function shellContinueLearning() {
  for (const mod of MODULES) {
    if (mod.steps_data && mod.steps_data.length > 0 && !state.progress[mod.id]?.completed) {
      const visited = state.progress[mod.id]?.stepsVisited;
      const next = visited ? Math.min(visited.size, mod.steps_data.length - 1) : 0;
      navigateStep(mod.id, next);
      return;
    }
  }
  navigateStep(1, 0);
}

/* ── Shell rendering ─────────────────────────────────────── */
function renderDashboard() {
  return renderShell();
}

function renderShell() {
  const nav = state.dashNav || 'dashboard';
  let mainContent;
  if (nav === 'dashboard')    mainContent = renderShellDashboardContent();
  else if (nav === 'modules') mainContent = renderShellModulesContent();
  else if (nav === 'detail')  mainContent = renderShellDetailContent();
  else                        mainContent = renderShellSimpleContent(nav);
  return (
    '<div class="app-shell">' +
    renderShellSidebar(nav) +
    '<main class="sh-main">' +
    renderShellTopBar() +
    '<div class="sh-scroll">' +
    mainContent +
    '</div></main>' +
    '<aside class="sh-rail">' +
    renderShellRail() +
    '</aside></div>'
  );
}

function renderShellSidebar(activeNav) {
  const items = [
    { id: 'dashboard', label: 'Dashboard',      icon: 'home' },
    { id: 'modules',   label: 'Modules',         icon: 'book',    badge: '6' },
    { id: 'builder',   label: 'Lesson Builder',  icon: 'builder' },
    { id: 'library',   label: 'My Library',      icon: 'folder' },
    { id: 'students',  label: 'Students',        icon: 'users' },
  ];
  const settings = [{ id: 'settings', label: 'Settings', icon: 'settings' }];
  const sidebarActive = activeNav === 'detail' ? 'modules' : activeNav;
  const navItems = items.map(function(it) {
    const cls = sidebarActive === it.id ? ' active' : '';
    const badge = it.badge ? '<span class="sb-badge">' + it.badge + '</span>' : '';
    return '<button class="sb-nav-item' + cls + '" onclick="shellNav(\'' + it.id + '\')">' + iconSVG(it.icon, 18) + '<span>' + escHtml(it.label) + '</span>' + badge + '</button>';
  }).join('');
  const settingsItems = settings.map(function(it) {
    const cls = sidebarActive === it.id ? ' active' : '';
    return '<button class="sb-nav-item' + cls + '" onclick="shellNav(\'' + it.id + '\')">' + iconSVG(it.icon, 18) + '<span>' + escHtml(it.label) + '</span></button>';
  }).join('');
  return (
    '<aside class="sh-sidebar">' +
    '<div class="sb-brand"><div class="sb-brand-mark">' + iconSVG('sparkle', 18, 2.5) + '</div><div class="sb-brand-name">ESL <span>Co-Pilot</span></div></div>' +
    '<div><div class="sb-section-label">Workspace</div><nav class="sb-nav">' + navItems + '</nav></div>' +
    '<div class="sb-helper"><h4>Need a hand?</h4><p>Ask the AI co-designer about anything in your current lesson draft.</p><button>Open AI ' + iconSVG('arrowR', 13) + '</button></div>' +
    '<div class="sb-spacer"></div>' +
    '<div><div class="sb-section-label">Account</div><nav class="sb-nav">' + settingsItems + '</nav>' +
    '<div class="sb-user"><div class="sb-avatar">SY</div><div><div class="sb-uname">@shiyu</div><div class="sb-umeta">Middle-school ESL</div></div></div></div>' +
    '</aside>'
  );
}

function renderShellTopBar() {
  const pct = totalProgress();
  const searchVal = (state.dashSearch || '').replace(/"/g, '&quot;');
  return (
    '<div class="sh-topbar">' +
    '<div class="sh-search">' + iconSVG('search', 18) +
    '<input type="text" placeholder="Search modules, lessons, worksheets…" value="' + searchVal + '" oninput="state.dashSearch=this.value;render()"/>' +
    '<kbd>⌘K</kbd></div>' +
    '<div class="sh-tb-progress"><span class="sh-tb-plabel">Progress</span>' +
    '<div class="sh-tb-pbar"><div style="width:' + pct + '%"></div></div>' +
    '<span class="sh-tb-ppct">' + pct + '%</span></div>' +
    '<div style="flex:1"></div>' +
    '<button class="sh-icon-btn" title="Messages">' + iconSVG('mail', 18) + '</button>' +
    '<button class="sh-icon-btn" title="Notifications">' + iconSVG('bell', 18) + '<span class="sh-dot"></span></button>' +
    '</div>'
  );
}

function renderShellRail() {
  const resources = SAVED_RESOURCES.slice(0, 5).map(function(r) {
    const iconName = r.kind === 'rubric' ? 'grid' : 'sheet';
    return (
      '<div class="sh-resource">' +
      '<div class="sh-ric" style="background:' + r.tint + ';color:' + r.accent + '">' + iconSVG(iconName, 18) + '</div>' +
      '<div style="flex:1;min-width:0"><div class="sh-rtitle">' + escHtml(r.title) + '</div>' +
      '<div class="sh-rmeta"><span>' + escHtml(r.meta) + '</span><span>·</span><span>' + escHtml(r.updated) + '</span></div></div>' +
      '<div class="sh-raction">' + iconSVG('arrowR', 14) + '</div></div>'
    );
  }).join('');

  const days = WEEK_PROGRESS.map(function(d) {
    const cls = d.state === 'done' ? ' done' : d.state === 'today' ? ' today' : '';
    const check = d.state === 'done' ? '✓' : '';
    return '<div class="sh-streak-day' + cls + '"><span class="sh-dlbl">' + d.lbl + '</span><div class="sh-ddot">' + check + '</div></div>';
  }).join('');

  return (
    '<div class="sh-rail-card">' +
    '<div class="sh-rail-head"><h3>Saved resources</h3></div>' +
    resources +
    '<button class="sh-see-all" onclick="shellNav(\'library\')">See all in library ' + iconSVG('arrowR', 13) + '</button>' +
    '</div>' +

    '<div class="sh-rail-card">' +
    '<div class="sh-rail-head"><h3>This week</h3></div>' +
    '<div class="sh-streak">' + days + '</div>' +
    '<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-500)">' +
    '<span style="color:var(--peach-500)">' + iconSVG('flame', 16) + '</span>' +
    '<span><strong style="color:var(--ink-900)">6-day streak.</strong> Don\'t break it today.</span>' +
    '</div></div>' +

    '<div class="sh-ai-card">' +
    '<span class="sh-ai-badge">' + iconSVG('sparkle', 11) + ' AI Co-Designer</span>' +
    '<h3>Need a 5-minute warm-up for tomorrow?</h3>' +
    '<p>Tell me the grade, level, and what you covered today. I\'ll draft three options.</p>' +
    '<div class="sh-ai-prompt"><input placeholder="e.g. 7th gr., A2, present perfect…"/>' +
    '<button class="sh-ai-send">' + iconSVG('send', 13) + '</button></div>' +
    '</div>'
  );
}

function renderShellDashboardContent() {
  const search = (state.dashSearch || '').toLowerCase();
  const current = MODULES.find(function(m) { return m.status === 'progress'; }) || MODULES[0];
  const allMods = search
    ? MODULES.filter(function(m) { return m.title.toLowerCase().includes(search) || m.description.toLowerCase().includes(search); })
    : MODULES;
  const top = allMods.slice(0, 4);
  const pct = Math.round((current.progress || 0) * 100);

  const statsData = [
    { icon: 'bolt',  num: '6',    label: 'Day streak',       tint: '#FCE8DA', accent: '#B95D2A' },
    { icon: 'check', num: '1/6',  label: 'Modules complete', tint: '#E5F0E0', accent: '#3E6B30' },
    { icon: 'file',  num: '12',   label: 'Saved resources',  tint: '#DCEBF7', accent: '#3F6FA1' },
    { icon: 'clock', num: '42m',  label: 'This week',        tint: '#E8E4FB', accent: '#4338CA' },
  ];
  const statsHtml = statsData.map(function(s) {
    return (
      '<div class="sh-stat-pill">' +
      '<div class="sh-sic" style="background:' + s.tint + ';color:' + s.accent + '">' + iconSVG(s.icon, 20, 2) + '</div>' +
      '<div><div class="sh-snum">' + s.num + '</div><div class="sh-slbl">' + s.label + '</div></div>' +
      '</div>'
    );
  }).join('');

  const cardsHtml = top.map(function(m, i) { return renderModuleCard(m, i); }).join('');
  const emptyHtml = top.length === 0
    ? '<div class="sh-placeholder"><h2>No matches for &ldquo;' + escHtml(state.dashSearch || '') + '&rdquo;</h2><p>Try searching by topic or clear the search to see everything.</p></div>'
    : '';

  return (
    '<section class="sh-hero sh-fade-up">' +
    heroOrnamentSVG() +
    '<div class="sh-hero-body">' +
    '<span class="sh-hero-eyebrow">' + iconSVG('sparkle', 11) + ' Welcome back, Shiyu</span>' +
    '<h1>Pick up where you <em>left off</em> — your next lesson is one step away.</h1>' +
    '<p>Your AI co-designer remembers every framework you’ve practiced. Continue refining today’s plan or start something new.</p>' +
    '<div class="sh-hero-cta-row">' +
    '<button class="sh-hero-cta" onclick="shellContinueLearning()">Continue learning<span class="sh-hero-cta-arrow">' + iconSVG('arrowR', 14, 2.5) + '</span></button>' +
    '<button class="sh-hero-cta-ghost" onclick="shellNav(\'modules\')">' + iconSVG('plus', 15) + ' New lesson</button>' +
    '</div></div>' +
    '<div class="sh-hero-current">' +
    '<span class="shc-label">In Progress</span>' +
    '<div class="shc-title">' + escHtml(current.title) + '</div>' +
    '<div class="shc-step">Step 1 of ' + current.steps + ' · Get started</div>' +
    '<div class="shc-bar"><div style="width:' + pct + '%"></div></div>' +
    '<div class="shc-meta"><span>' + pct + '% complete</span><span>~30 min left</span></div>' +
    '</div></section>' +

    '<div class="sh-stats sh-fade-up">' + statsHtml + '</div>' +

    '<div>' +
    '<div class="sh-section-head" style="margin-bottom:14px">' +
    '<div><h2>Module <span class="sh-accent">overview</span></h2><div class="sh-sub">Six modules pair learning with usable tools. Start anywhere.</div></div>' +
    '<button class="sh-see-all" onclick="shellNav(\'modules\')">View all ' + iconSVG('arrowR', 13) + '</button>' +
    '</div>' +
    '<div class="sh-mod-grid">' + cardsHtml + '</div>' +
    emptyHtml + '</div>'
  );
}

function renderShellModulesContent() {
  const filter = state.dashFilter || 'all';
  const search = (state.dashSearch || '').toLowerCase();
  let list = MODULES;
  if (filter === 'learning') list = list.filter(function(m) { return m.kind === 'Learning Module'; });
  if (filter === 'tools')    list = list.filter(function(m) { return m.kind === 'Co-Design Tool'; });
  if (filter === 'progress') list = list.filter(function(m) { return m.status !== 'notstarted'; });
  if (search) list = list.filter(function(m) { return m.title.toLowerCase().includes(search) || m.description.toLowerCase().includes(search); });

  const filterDefs = [
    { id: 'all', label: 'All' },
    { id: 'learning', label: 'Learning' },
    { id: 'tools', label: 'Tools' },
    { id: 'progress', label: 'In progress' },
  ];
  const filterHtml = filterDefs.map(function(f) {
    const cls = filter === f.id ? ' class="active"' : '';
    return '<button' + cls + ' onclick="state.dashFilter=\'' + f.id + '\';render()">' + f.label + '</button>';
  }).join('');

  const cardsHtml = list.map(function(m, i) { return renderModuleCard(m, i); }).join('');
  const emptyHtml = list.length === 0 ? '<div class="sh-placeholder"><h2>Nothing matches</h2><p>Try a different filter or clear the search.</p></div>' : '';

  return (
    '<div class="sh-section-head">' +
    '<div><h2>All <span class="sh-accent">modules</span></h2><div class="sh-sub">' + list.length + ' of ' + MODULES.length + ' shown</div></div>' +
    '<div class="sh-tab-row">' + filterHtml + '</div>' +
    '</div>' +
    '<div class="sh-mod-grid">' + cardsHtml + '</div>' +
    emptyHtml
  );
}

function renderShellDetailContent() {
  const m = MODULES.find(function(mod) { return mod.id === state.dashModuleId; });
  if (!m) return renderShellModulesContent();
  const pct = Math.round((m.progress || 0) * 100);

  const visitedSize = state.progress[m.id] ? state.progress[m.id].stepsVisited.size : 0;
  const stepsHtml = (m.detailSteps || []).map(function(s, i) {
    const isDone = state.progress[m.id] ? state.progress[m.id].stepsVisited.has(i) : false;
    const isCurrent = !isDone && i === visitedSize;
    const cls = isDone ? ' done' : isCurrent ? ' current' : '';
    const numInner = isDone ? iconSVG('check', 14, 2.8) : (i + 1);
    return (
      '<div class="sh-step-item' + cls + '">' +
      '<div class="sh-step-num">' + numInner + '</div>' +
      '<div class="sh-step-text"><div class="sh-st">' + escHtml(s.t) + '</div><div class="sh-sd">' + escHtml(s.d) + '</div></div>' +
      '<div class="sh-step-time">' + escHtml(s.time) + '</div>' +
      '</div>'
    );
  }).join('');

  const lockedMsg = !stepsHtml
    ? '<div style="padding:24px 0;color:var(--ink-500);font-size:14px">' + iconSVG('lock', 14) + ' This module is being authored.</div>'
    : '';

  const outcomesHtml = (m.outcomes || []).map(function(o) { return '<li>' + escHtml(o) + '</li>'; }).join('');
  const outcomesBlock = outcomesHtml
    ? '<div class="sh-outcomes" style="margin-bottom:16px"><h3>You\'ll be able to</h3><ul>' + outcomesHtml + '</ul></div>'
    : '';

  const btnLabel = m.status === 'complete' ? 'Review module' : m.status === 'progress' ? 'Continue' : 'Start module';

  return (
    '<div class="sh-detail">' +
    '<button class="sh-detail-back" onclick="shellNav(\'modules\')">' + iconSVG('arrowL', 14) + ' Back</button>' +

    '<div class="sh-detail-hero">' +
    '<div class="sh-dicon" style="background:' + m.tint + '">' + illustrationSVG(m.illustration, m.accent, m.tint, 108) + '</div>' +
    '<div>' +
    '<div class="sh-mod-meta" style="margin-bottom:6px"><span>Module ' + m.number + '</span><span class="sh-mdot"></span><span class="sh-mtype">' + escHtml(m.kind) + '</span></div>' +
    '<h1>' + escHtml(m.title) + '</h1>' +
    '<p class="sh-dlede">' + escHtml(m.description) + '</p>' +
    '<div class="sh-dmeta">' +
    '<span>' + iconSVG('clock', 14) + ' ' + escHtml(m.duration) + '</span>' +
    '<span>' + iconSVG('list', 14) + ' ' + m.steps + ' steps</span>' +
    '<span>' + iconSVG('target', 14) + ' ' + pct + '% complete</span>' +
    '</div></div>' +
    '<div class="sh-detail-cta">' +
    '<button class="sh-btn-primary" onclick="shellStartModule(' + m.id + ')">' + btnLabel + ' ' + iconSVG('arrowR', 14, 2.5) + '</button>' +
    '<button class="sh-btn-secondary">' + iconSVG('bookmark', 14) + ' Save for later</button>' +
    '</div></div>' +

    '<div class="sh-detail-grid">' +
    '<div class="sh-steps-card"><h3>Steps in this module</h3>' + (stepsHtml || lockedMsg) + '</div>' +
    '<div>' +
    outcomesBlock +
    '<div class="sh-rail-card">' +
    '<div class="sh-rail-head"><h3>Pairs well with</h3></div>' +
    '<div class="sh-resource"><div class="sh-ric" style="background:#FCE8DA;color:#B95D2A">' + iconSVG('builder', 18) + '</div><div style="flex:1;min-width:0"><div class="sh-rtitle">Lesson Builder</div><div class="sh-rmeta"><span>Apply the framework live</span></div></div><div class="sh-raction">' + iconSVG('arrowR', 14) + '</div></div>' +
    '<div class="sh-resource"><div class="sh-ric" style="background:#E5F0E0;color:#3E6B30">' + iconSVG('grid', 18) + '</div><div style="flex:1;min-width:0"><div class="sh-rtitle">Resource Generator</div><div class="sh-rmeta"><span>Build worksheets to match</span></div></div><div class="sh-raction">' + iconSVG('arrowR', 14) + '</div></div>' +
    '</div></div></div></div>'
  );
}

function renderShellSimpleContent(nav) {
  const configs = {
    builder:  { icon: 'builder',  title: 'Lesson Builder',  body: 'Open the Lesson Builder module to launch the AI co-designer for tomorrow’s lesson.' },
    library:  { icon: 'folder',   title: 'My Library',      body: 'Every worksheet and rubric you save lives here. Use the Resource Generator inside any module to add more.' },
    students: { icon: 'users',    title: 'Students',        body: 'Add a roster to start using the Student Evaluator. We’ll keep it private to your account.' },
    settings: { icon: 'settings', title: 'Settings',        body: 'Profile, notifications, and AI preferences will live here.' },
  };
  const c = configs[nav] || { icon: 'home', title: 'Dashboard', body: '' };
  return (
    '<div class="sh-placeholder" style="margin-top:40px">' +
    '<div style="width:56px;height:56px;border-radius:18px;background:var(--indigo-50);color:var(--indigo-600);display:grid;place-items:center;margin:0 auto 16px">' + iconSVG(c.icon, 28) + '</div>' +
    '<h2>' + escHtml(c.title) + '</h2>' +
    '<p>' + escHtml(c.body) + '</p>' +
    '</div>'
  );
}

function renderModuleCard(m, index) {
  const lockedCls = m.status === 'notstarted' ? ' sh-locked' : '';
  const delay = (index || 0) * 60;
  let statusBadge;
  if (m.status === 'complete')     statusBadge = '<div class="sh-mod-status complete">'    + iconSVG('check', 11, 2.5) + ' Complete</div>';
  else if (m.status === 'progress') statusBadge = '<div class="sh-mod-status progress">'   + iconSVG('play',  10)      + ' In progress</div>';
  else                              statusBadge = '<div class="sh-mod-status notstarted">' + iconSVG('lock',  11)      + ' Coming soon</div>';

  let pillHtml;
  if (m.status === 'complete')     pillHtml = '<span class="sh-mod-pill complete">'    + iconSVG('check', 11, 2.5) + ' Complete</span>';
  else if (m.status === 'progress') pillHtml = '<span class="sh-mod-pill progress">'   + iconSVG('play',  10)      + ' In progress</span>';
  else                              pillHtml = '<span class="sh-mod-pill notstarted">Not started</span>';

  const onclickAttr = m.status !== 'notstarted' ? ' onclick="shellOpenModule(' + m.id + ')"' : '';

  return (
    '<div class="sh-mod-card' + lockedCls + ' sh-fade-up" style="animation-delay:' + delay + 'ms"' + onclickAttr + '>' +
    '<div class="sh-mod-thumb" style="background:' + m.tint + '">' +
    '<div class="sh-mod-thumb-art">' + illustrationSVG(m.illustration, m.accent, m.tint, 132) + '</div>' +
    statusBadge + '</div>' +
    '<div class="sh-mod-meta"><span>Module ' + m.number + '</span><span class="sh-mdot"></span><span class="sh-mtype">' + escHtml(m.kind) + '</span></div>' +
    '<h3>' + escHtml(m.title) + '</h3>' +
    '<p class="sh-mod-desc">' + escHtml(m.description) + '</p>' +
    '<div class="sh-mod-foot"><div class="sh-mfl"><span>' + iconSVG('clock', 13) + ' ' + escHtml(m.duration) + '</span><span>' + iconSVG('list', 13) + ' ' + m.steps + ' steps</span></div>' +
    pillHtml + '</div></div>'
  );
}

function startCourse() {
  for (const mod of MODULES) {
    if (!state.progress[mod.id]?.completed) {
      const visited = state.progress[mod.id]?.stepsVisited;
      const next = visited ? visited.size : 0;
      navigateStep(mod.id, Math.min(next, mod.steps_data.length - 1));
      return;
    }
  }
  navigateStep(1, 0);
}

/* ── Step view ──────────────────────────────────────────── */
function renderStep() {
  const mod = MODULES.find(m => m.id === state.moduleId);
  if (!mod) return '';
  const step = mod.steps_data[state.stepIndex];
  const isFirst = state.stepIndex === 0;
  const isLast = state.stepIndex === mod.steps_data.length - 1;

  const dots = mod.steps_data.map((s, i) => {
    const cls = i === state.stepIndex ? 'active'
      : (state.progress[mod.id]?.stepsVisited?.has(i) ? 'done' : '');
    const label = s.type === 'pretest' ? 'Pre-Test'
      : s.type === 'posttest' ? 'Post-Test'
        : s.title;
    return `<div class="step-dot ${cls}" title="${label}"></div>`;
  }).join('');

  let content = '';
  switch (step.type) {
    case 'pretest': content = renderPretest(step); break;
    case 'info': content = renderInfo(step); break;
    case 'comparison': content = renderComparison(step); break;
    case 'annotated': content = renderAnnotated(step); break;
    case 'quiz': content = renderQuiz(step); break;
    case 'builder': content = renderBuilder(step); break;
    case 'playground': content = renderPlayground(step); break;
    case 'reflection': content = renderReflection(step); break;
    case 'transfer': content = renderTransfer(step); break;
    case 'faded': content = renderFaded(step); break;
    case 'fullpractice': content = renderFullPractice(step); break;
    case 'selfreflection': content = renderSelfReflection(step); break;
    case 'posttest': content = renderPosttest(step); break;
    default: content = `<div class="content-card"><p>Step type not found.</p></div>`;
  }

  // Determine if Next button should be disabled for steps that require submission
  const requiresSubmit = ['pretest', 'posttest'].includes(step.type);
  const pretestDone = step.type === 'pretest' && state.pretestEval;
  const posttestDone = step.type === 'posttest' && state.posttestEval;
  const isAnnotatedComplete = step.type === 'annotated' ? (state.annotatedMatches[`${state.moduleId}_${state.stepIndex}`]?.length === step.components.length) : true;
  const nextDisabled = (requiresSubmit && !(pretestDone || posttestDone)) || (step.type === 'annotated' && !isAnnotatedComplete) ? 'disabled' : '';

  // Skip notice for intro step
  let skipBanner = '';
  if (step.type === 'info' && step.skippable && state.introSkipped) {
    skipBanner = `
      <div class="callout warning skip-banner">
        <div class="callout-icon">⚡</div>
        <div class="callout-body">
          You scored well on the pre-test and skipped this section automatically. You are reviewing it now.
        </div>
      </div>`;
  }

  const isWide = step.type === 'selfreflection';

  return `
    <div class="step-view fade-in${isWide ? ' wide' : ''}">
      <div class="step-header">
        <div class="step-breadcrumb">
          <span>Module ${mod.id}</span> › <span>${mod.title}</span>
        </div>
        <div class="step-title">${step.title}</div>
        <div class="step-dots">${dots}</div>
      </div>

      ${skipBanner}
      ${content}

      <div class="step-nav">
        <button class="btn-nav" onclick="prevStep()" ${isFirst ? 'disabled' : ''}>← Previous</button>
        <span class="step-counter">Step ${state.stepIndex + 1} of ${mod.steps_data.length}</span>
        <button class="btn-nav primary" onclick="nextStep()" ${nextDisabled}>${isLast ? 'Complete Module →' : 'Next →'}</button>
      </div>
    </div>`;
}

/* ── Scenario renderer ──────────────────────────────────── */
function renderScenario(scenario) {
  if (typeof scenario === 'string') return `<p>${escHtml(scenario)}</p>`;
  const s = scenario;
  const vocab = s.vocabulary;
  return `
    <div class="scenario-structured">
      <div class="scenario-row"><strong>Topic:</strong> ${escHtml(s.topic)}</div>
      <div class="scenario-row"><strong>Learners:</strong> ${escHtml(s.learners)}</div>
      <div class="scenario-row"><strong>Foundational Literacy:</strong> ${escHtml(s.foundational_literacy)}</div>
      <div class="scenario-row"><strong>Grammar and Syntax:</strong> ${escHtml(s.grammar_and_syntax)}</div>
      <div class="scenario-row">
        <strong>Vocabulary Acquisition:</strong>
        <div class="vocab-tiers">
          <div><strong>Tier 1:</strong> ${escHtml(vocab.tier_1.join(', '))}</div>
          <div><strong>Tier 2:</strong> ${escHtml(vocab.tier_2.join(', '))}</div>
          <div><strong>Tier 3:</strong> ${escHtml(vocab.tier_3.join(', '))}</div>
        </div>
      </div>
      <div class="scenario-row"><strong>Social Language:</strong> ${escHtml(s.social_language)}</div>
    </div>`;
}

/* ── PRE-TEST ───────────────────────────────────────────── */
function renderPretest(step) {
  const evalResult = state.pretestEval;

  let evalHtml = '';
  if (evalResult) {
    evalHtml = renderEvalResult(evalResult);
    if (state.introSkipped) {
      evalHtml += `
        <div class="callout success" style="margin-top:1rem">
          <div class="callout-icon">⚡</div>
          <div class="callout-body">
            <strong>Great work!</strong> Your prompt already shows strong structure (${evalResult.total_score}/15).
            You can skip the framework intro and go straight to the worked example.
            <br><a href="#" onclick="reviewIntro(); return false;" style="color:var(--primary);font-weight:600">Review the 5-Part Framework anyway →</a>
          </div>
        </div>`;
    } else {
      evalHtml += `
        <div class="callout info" style="margin-top:1rem">
          <div class="callout-icon">📖</div>
          <div class="callout-body">
            Next, you'll go through the <strong>5-Part Prompt Framework</strong> before seeing a worked example. Click <strong>Next →</strong> when you are ready.
          </div>
        </div>`;
    }
  }

  return `
    <div class="content-card">
      <div class="test-badge pretest-badge">Pre-Test · 2–5 min</div>
      <p style="margin-bottom:1rem">${escHtml(step.instruction)}</p>
      <div class="scenario-box">
        <div class="scenario-box-label">Scenario</div>
        ${renderScenario(step.scenario)}
      </div>
      <div style="margin-top:1.5rem">
        <div class="playground-section-label">✏️ Your Prompt</div>
        <textarea class="prompt-textarea" id="pretest-input"
          placeholder="${escAttr(step.placeholder)}"
          ${evalResult ? 'readonly' : ''}>${escHtml(state.pretestPrompt)}</textarea>
      </div>
      ${!evalResult ? `
        <button class="btn-generate" id="pretest-btn" style="margin-top:1rem" onclick="submitPretest()">
          Submit for Evaluation →
        </button>` : ''}
      ${evalHtml}
      ${state.pretestGenerated ? `
        <div style="margin-top:1.5rem">
          <div class="playground-section-label">📄 AI Output — based on your prompt</div>
          <div class="response-body">${escHtml(state.pretestGenerated)}</div>
        </div>` : ''}
    </div>`;
}

async function submitPretest() {
  Tracker.click('submit_pretest');
  const input = document.getElementById('pretest-input');
  const btn = document.getElementById('pretest-btn');
  if (!input) return;
  const prompt = input.value.trim();
  if (!prompt) return;

  state.pretestPrompt = prompt;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `Evaluating… <span class="loading-dots"><span></span><span></span><span></span></span>`;
  }

  try {
    const result = await API.evaluate(prompt);
    state.pretestEval = result;
    if (result.total_score >= 10) state.introSkipped = true;
    API.logEvent('submit_pretest', { prompt, evalResult: result });
    if (!result.gibberish) {
      state.pretestGenerated = await API.generate(prompt);
    }
  } catch (err) {
    state.pretestEval = {
      error: true, total_score: 0,
      scores: { desired_results: { score: 0 }, learner_context: { score: 0 }, evidence_of_learning: { score: 0 }, instructional_plan: { score: 0 }, output_requirements: { score: 0 } },
      overall_judgment: 'Beginning',
      revision_feedback: { next_best_revision: 'Could not evaluate. Please check your connection and try again.' }
    };
  }
  document.getElementById('app-main').innerHTML = renderStep();
}

/* ── RUBRIC EVAL RESULT ─────────────────────────────────── */
function renderEvalResult(evalResult) {
  if (evalResult.gibberish) {
    return `
      <div class="eval-result">
        <div class="callout" style="border-left-color:var(--danger);background:#fff5f5">
          <div class="callout-icon">⚠️</div>
          <div class="callout-body">
            <strong>Input not recognised.</strong> Your input appears to be gibberish or random text — it has been given a score of 0/15.
            Please write a real prompt that addresses the scenario before submitting.
          </div>
        </div>
      </div>`;
  }

  const dimLabels = {
    desired_results: 'Desired Results',
    learner_context: 'Learner & Context',
    evidence_of_learning: 'Evidence of Learning',
    instructional_plan: 'Instructional Plan',
    output_requirements: 'Output Requirements'
  };
  const barColor = s => {
    if (s === 0) return '#dc2626';
    if (s === 1) return '#f97316';
    if (s === 2) return '#84cc16';
    return '#16a34a';
  };

  const dims = ['desired_results', 'learner_context', 'evidence_of_learning', 'instructional_plan', 'output_requirements'];
  const barCols = dims.map(key => {
    const d = evalResult.scores[key] || {};
    const s = typeof d === 'object' ? (d.score ?? 0) : d;
    const pct = (s / 3) * 100;
    return `
      <div class="score-bar-col">
        <div class="score-bar-track">
          <div class="score-bar-fill" style="height:${pct}%;background:${barColor(s)}"></div>
        </div>
        <div class="score-bar-num">${s}</div>
        <div class="score-bar-label">${dimLabels[key]}</div>
      </div>`;
  }).join('');

  const total = evalResult.total_score ?? 0;
  const totalColor = total >= 10 ? 'eval-total-high' : total >= 6 ? 'eval-total-mid' : 'eval-total-low';

  // Per-dimension reasons
  const reasonsHtml = dims.map(key => {
    const d = evalResult.scores[key] || {};
    const reason = typeof d === 'object' ? d.reason : '';
    if (!reason) return '';
    const s = typeof d === 'object' ? (d.score ?? 0) : d;
    return `<div style="margin-bottom:0.5rem"><strong style="color:${barColor(s)}">${dimLabels[key]}:</strong> ${reason}</div>`;
  }).filter(Boolean).join('');

  // Strengths
  const strengthsHtml = (evalResult.strengths || []).length
    ? `<div style="margin-top:1rem"><strong>✓ Strengths:</strong><ul style="margin:0.25rem 0 0 1.2rem;padding:0">${(evalResult.strengths || []).slice(0, 3).map(s => `<li>${s}</li>`).join('')}</ul></div>`
    : '';

  // Priority improvements
  const improvementsHtml = (evalResult.priority_improvements || []).length
    ? `<div style="margin-top:1rem"><strong>↑ Priority Improvements:</strong>${(evalResult.priority_improvements || []).slice(0, 3).map(p =>
      `<div style="margin-top:0.5rem;padding:0.5rem 0.75rem;background:#fff8f0;border-left:3px solid #f97316;border-radius:4px">
          <strong>${dimLabels[p.dimension] || p.dimension}:</strong> ${p.how_to_improve}
        </div>`).join('')}</div>`
    : '';

  return `
    <div class="eval-result">
      <div class="eval-header">
        <div class="eval-total ${totalColor}">
          <span class="eval-total-num">${total}</span><span class="eval-total-denom"> / 15</span>
          <span style="font-size:0.8rem;font-weight:500;margin-left:0.5rem;opacity:0.7">${evalResult.overall_judgment || ''}</span>
        </div>
      </div>
      <div class="score-bar-chart">
        <div class="score-bar-y">
          <span>3</span><span>2</span><span>1</span><span>0</span>
        </div>
        <div class="score-bar-cols">${barCols}</div>
      </div>
      ${reasonsHtml ? `<div style="margin-top:1rem;font-size:0.88rem;color:var(--text-secondary)">${reasonsHtml}</div>` : ''}
      ${strengthsHtml}
      ${improvementsHtml}
    </div>`;
}

/* ── INFO ───────────────────────────────────────────────── */
function renderInfo(step) {
  return `<div class="content-card">${step.content}</div>`;
}

/* ── COMPARISON ─────────────────────────────────────────── */
function renderComparison(step) {
  const rows = step.analysis.map(r => `
    <div class="analysis-row">
      <div class="ar-icon">${r.icon}</div>
      <div class="ar-text"><strong>${r.label}:</strong> ${r.desc}</div>
    </div>`).join('');

  return `
    <div class="content-card">
      <p>Read both prompts carefully. Both ask for the same thing — a lesson plan. But the quality of the AI output will be very different. Can you spot why?</p>
      <div class="comparison-grid">
        <div class="comparison-panel weak">
          <div class="comparison-label">⚠ Weak Prompt</div>
          <div class="comparison-prompt">${escHtml(step.weakPrompt)}</div>
        </div>
        <div class="comparison-panel strong">
          <div class="comparison-label">✓ Strong Prompt</div>
          <div class="comparison-prompt">${escHtml(step.strongPrompt)}</div>
        </div>
      </div>
      <div class="comparison-analysis">
        <h3>What makes the weak prompt weak?</h3>
        ${rows}
      </div>
    </div>`;
}

/* ── ANNOTATED ──────────────────────────────────────────── */
function renderAnnotated(step) {
  const stepKey = `${state.moduleId}_${state.stepIndex}`;
  if (!state.annotatedMatches[stepKey]) state.annotatedMatches[stepKey] = [];
  if (!state.annotatedOrder[stepKey]) {
    const indices = step.components.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    state.annotatedOrder[stepKey] = indices;
  }
  const matches = state.annotatedMatches[stepKey];
  const order = state.annotatedOrder[stepKey];

  const types = ['desired_results', 'learner_context', 'evidence_of_learning', 'instructional_plan', 'output_requirements'];
  const labels = {
    desired_results: 'Desired Results',
    learner_context: 'Learner & Context',
    evidence_of_learning: 'Evidence of Learning',
    instructional_plan: 'Instructional Plan',
    output_requirements: 'Output Requirements'
  };

  const legendPills = types.map(type => {
    if (matches.includes(type)) return '';
    return `<div class="legend-pill ${type}" draggable="true" ondragstart="dragAnnotation(event, '${type}')" style="cursor: grab;">${labels[type]}</div>`;
  }).join('');

  const legend = legendPills ? `
    <div class="framework-legend" id="annotated-legend">
      ${legendPills}
    </div>` : `<div class="callout success"><div class="callout-icon">🎉</div><div class="callout-body">Perfect! You have matched all components correctly.</div></div>`;

  const orderedComponents = order.map(i => step.components[i]);
  const blocks = orderedComponents.map(c => {
    const isMatched = matches.includes(c.type);
    if (isMatched) {
      return `
        <div class="annotation-block ${c.type} fade-in">
          <div class="annotation-header">${componentIcon(c.type)} ${c.label}</div>
          <div class="annotation-text">${escHtml(c.text)}</div>
          <div class="annotation-explain">
            <div class="ae-icon">💬</div>
            <div class="ae-text">${c.explanation}</div>
          </div>
        </div>`;
    } else {
      return `
        <div class="annotation-block unmatched">
          <div class="annotation-drop-zone" ondrop="dropAnnotation(event, '${c.type}')" ondragover="allowDrop(event)" ondragleave="dragLeaveAnnotation(event)">
            Drop category target here…
          </div>
          <div class="annotation-text">${escHtml(c.text)}</div>
        </div>`;
    }
  }).join('');

  return `
    <div class="content-card">
      <div class="scenario-box">
        <div class="scenario-box-label">Scenario</div>
        ${renderScenario(step.scenario)}
      </div>
      ${step.sourceText ? `
      <div class="scenario-box" style="margin-top:0.75rem;border-left-color:var(--accent-secondary,#7c3aed)">
        <div class="scenario-box-label">Source Text</div>
        <p style="font-style:italic">${escHtml(step.sourceText)}</p>
      </div>` : ''}
      <p style="margin-top:1rem">Read the prompt segments below. Drag the correct framework component from the pool into its matching block. Match all to continue.</p>
      <div class="annotated-layout">
        <div class="annotated-sidebar">
          ${legend}
        </div>
        <div class="annotated-prompt">${blocks}</div>
      </div>
    </div>`;
}

function componentIcon(type) {
  return {
    desired_results: '🎯',
    learner_context: '👥',
    evidence_of_learning: '🔒',
    instructional_plan: '📋',
    output_requirements: '📄'
  }[type] || '•';
}

function dragAnnotation(ev, type) {
  ev.dataTransfer.setData("type", type);
}
function allowDrop(ev) {
  ev.preventDefault();
  ev.currentTarget.classList.add('drag-over');
}
function dragLeaveAnnotation(ev) {
  ev.currentTarget.classList.remove('drag-over');
}
function dropAnnotation(ev, expectedType) {
  ev.preventDefault();
  ev.currentTarget.classList.remove('drag-over');
  const draggedType = ev.dataTransfer.getData("type");
  if (draggedType === expectedType) {
    const key = `${state.moduleId}_${state.stepIndex}`;
    if (!state.annotatedMatches[key]) state.annotatedMatches[key] = [];
    state.annotatedMatches[key].push(draggedType);
    API.logEvent('annotated_dropped', { expectedType, draggedType, correct: true });

    // Update the matched block in place without re-rendering the whole page
    const block = ev.currentTarget.closest('.annotation-block');
    const stepData = getCurrentStepData();
    const component = stepData && stepData.components
      ? stepData.components.find(c => c.type === draggedType)
      : null;
    if (block && component) {
      block.className = `annotation-block ${draggedType} fade-in`;
      block.innerHTML = `
        <div class="annotation-header">${componentIcon(draggedType)} ${component.label}</div>
        <div class="annotation-text">${escHtml(component.text)}</div>
        <div class="annotation-explain">
          <div class="ae-icon">💬</div>
          <div class="ae-text">${component.explanation}</div>
        </div>`;
    }

    // Remove the pill from the legend
    const pill = document.querySelector(`.legend-pill.${draggedType}`);
    if (pill) pill.remove();

    // Check if all matched — replace legend with success callout and enable Next
    const legend = document.getElementById('annotated-legend');
    if (legend && legend.querySelectorAll('.legend-pill').length === 0) {
      legend.outerHTML = `<div class="callout success"><div class="callout-icon">🎉</div><div class="callout-body">Perfect! You have matched all components correctly.</div></div>`;
      const nextBtn = document.querySelector('.btn-nav.primary');
      if (nextBtn) nextBtn.disabled = false;
    }
  } else {
    const block = ev.currentTarget.closest('.annotation-block');
    block.classList.add('shake');
    setTimeout(() => block.classList.remove('shake'), 400);
    API.logEvent('annotated_dropped', { expectedType, draggedType, correct: false });
  }
}

function getCurrentStepData() {
  const mod = MODULES.find(m => m.id === state.moduleId);
  if (!mod) return null;
  return mod.steps_data ? mod.steps_data[state.stepIndex] : null;
}


/* ── QUIZ ───────────────────────────────────────────────── */
function renderQuiz(step) {
  const qs = step.questions.map((q, qi) => {
    const opts = q.options.map((opt, oi) => {
      let cls = '';
      if (state.quizChecked) {
        if (oi === q.answer) cls = 'correct';
        else if (state.quizAnswers[qi] === oi && oi !== q.answer) cls = 'wrong';
      } else if (state.quizAnswers[qi] === oi) {
        cls = 'selected';
      }
      return `<button class="quiz-option ${cls}" onclick="selectQuizAnswer(${qi}, ${oi})" ${state.quizChecked ? 'disabled' : ''}>
        <span>${String.fromCharCode(65 + oi)}.</span> ${escHtml(opt)}
      </button>`;
    }).join('');

    let feedback = '';
    if (state.quizChecked) {
      const correct = state.quizAnswers[qi] === q.answer;
      feedback = `<div class="quiz-feedback ${correct ? 'correct' : 'wrong'}">
        ${correct ? '✓ Correct!' : `✗ The correct answer is: ${escHtml(q.options[q.answer])}`}
      </div>`;
    }

    return `
      <div class="quiz-q">
        <div class="quiz-q-label">Q${qi + 1}. ${escHtml(q.question)}</div>
        <div class="quiz-options">${opts}</div>
        ${feedback}
      </div>`;
  }).join('');

  const allAnswered = step.questions.every((_, qi) => state.quizAnswers[qi] !== undefined);

  return `
    <div class="content-card">
      <p>${step.intro}</p>
      <div class="quiz-prompt-display">${escHtml(step.prompt)}</div>
      <div class="quiz-questions">${qs}</div>
      ${!state.quizChecked
      ? `<button class="btn-check-answers" onclick="checkAnswers()" ${!allAnswered ? 'disabled' : ''}>
            ${allAnswered ? 'Check Answers' : 'Answer all questions to continue'}
           </button>`
      : `<div class="callout success" style="margin-top:1rem">
             <div class="callout-icon">✅</div>
             <div class="callout-body">You have reviewed all answers. Move on when ready.</div>
           </div>`}
    </div>`;
}

/* ── BUILDER ────────────────────────────────────────────── */
function renderBuilder(step) {
  const fields = step.fields.map(f => `
    <div class="builder-field">
      <label class="builder-label">
        <span class="bl-badge legend-pill ${f.type}">${f.label}</span>
      </label>
      <textarea class="builder-textarea" id="builder-${f.key}" placeholder="${f.placeholder}"
        oninput="updateBuilder('${f.key}', this.value)">${state.builderValues[f.key] || ''}</textarea>
    </div>`).join('');

  const preview = buildPromptPreview();

  return `
    <div class="content-card">
      <p>${step.intro}</p>
      <div class="framework-legend">
        <div class="legend-pill goal">Goal</div>
        <div class="legend-pill context">Context</div>
        <div class="legend-pill task">Task</div>
        <div class="legend-pill constraint">Constraints</div>
        <div class="legend-pill output">Output Format</div>
      </div>
      <div class="builder-form">${fields}</div>
    </div>
    <div class="content-card">
      <div class="builder-preview-label">📋 Your prompt preview</div>
      <div class="builder-preview ${preview ? '' : 'empty'}" id="builder-preview">
        ${preview || 'Fill in the fields above to see your prompt take shape…'}
      </div>
      ${preview
      ? `<button class="btn-generate" style="margin-top:1rem" onclick="sendBuilderPrompt()">✦ Send to AI</button>
           <div class="response-area" id="builder-response-area" style="margin-top:1rem;display:none">
             <div class="response-header">🤖 AI Response</div>
             <div class="response-body" id="builder-response-body"></div>
           </div>`
      : ''}
    </div>`;
}

function buildPromptPreview() {
  const v = state.builderValues;
  const parts = [];
  if (v.desired_results) parts.push(v.desired_results.trim());
  if (v.learner_context) parts.push(v.learner_context.trim());
  if (v.evidence_of_learning) parts.push(v.evidence_of_learning.trim());
  if (v.instructional_plan) parts.push(v.instructional_plan.trim());
  if (v.output_requirements) parts.push(v.output_requirements.trim());
  return parts.filter(Boolean).join('\n\n');
}

/* ── PLAYGROUND ─────────────────────────────────────────── */
function renderPlayground(step) {
  const s = step.scenario;
  const savedResponse = state[`playground_response_${state.moduleId}_${state.stepIndex}`] || '';
  const savedPrompt = state[`playground_prompt_${state.moduleId}_${state.stepIndex}`] || '';

  return `
    <div class="playground-scenario">
      <div class="scenario-tag">${s.tag}</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
    </div>
    <div class="content-card">
      <div class="playground-area">
        <div>
          <div class="playground-section-label">✏️ Your Prompt</div>
          <textarea class="prompt-textarea" id="playground-input" placeholder="${escAttr(step.placeholder)}">${escHtml(savedPrompt)}</textarea>
          <div class="prompt-hint">💡 ${step.hint}</div>
        </div>
        <button class="btn-generate" id="playground-btn" onclick="sendPlaygroundPrompt()">✦ Generate Response</button>
        <div class="response-area" id="playground-response-area" ${savedResponse ? '' : 'style="display:none"'}>
          <div class="response-header">🤖 AI Response</div>
          <div class="response-body" id="playground-response-body">${savedResponse}</div>
        </div>
      </div>
    </div>`;
}

/* ── REFLECTION ─────────────────────────────────────────── */
function renderReflection(step) {
  const qs = step.questions.map((q, qi) => {
    const key = `${state.moduleId}_${state.stepIndex}_${qi}`;
    const saved = state.reflectionValues[key] || '';
    return `
      <div class="reflection-q">
        <div class="reflection-q-num">${q.num}</div>
        <div class="reflection-q-text">${escHtml(q.question)}</div>
        <textarea class="reflection-textarea" placeholder="Write your thoughts here…"
          oninput="saveReflection('${key}', this.value)">${escHtml(saved)}</textarea>
      </div>`;
  }).join('');

  return `
    <div class="content-card">
      <p>${step.intro}</p>
      <div class="callout info">
        <div class="callout-icon">📝</div>
        <div class="callout-body">Your answers are saved locally as you type. There are no right or wrong answers.</div>
      </div>
    </div>
    <div class="reflection-questions">${qs}</div>`;
}

/* ── TRANSFER ───────────────────────────────────────────── */
function renderTransfer(step) {
  const scenarioCards = step.challenge.scenarios.map(s => `
    <div class="callout info" style="margin-bottom:0.5rem">
      <div class="callout-icon">${s.icon}</div>
      <div class="callout-body"><strong>${s.label}:</strong> ${s.desc}</div>
    </div>`).join('');

  const refKey = `transfer_reflection`;
  const savedRef = state.reflectionValues[refKey] || '';

  return `
    <div class="content-card"><p>${step.intro}</p></div>
    <div class="transfer-challenge">
      <div class="transfer-badge">⚡ Transfer Challenge</div>
      <h3>${step.challenge.title}</h3>
      <p>${step.challenge.description}</p>
      ${scenarioCards}
    </div>
    <div class="content-card">
      <div class="playground-area">
        <div>
          <div class="playground-section-label">✏️ Your Transfer Prompt</div>
          <textarea class="prompt-textarea" id="transfer-input" placeholder="${escAttr(step.placeholder)}">${escHtml(state.transferPrompt)}</textarea>
          <div class="prompt-hint">💡 ${step.hint}</div>
        </div>
        <button class="btn-generate" id="transfer-btn" onclick="sendTransferPrompt()">✦ Send to AI</button>
        <div class="response-area" id="transfer-response-area" ${state.transferResponse ? '' : 'style="display:none"'}>
          <div class="response-header">🤖 AI Response</div>
          <div class="response-body" id="transfer-response-body">${escHtml(state.transferResponse)}</div>
        </div>
      </div>
    </div>
    ${state.transferResponse ? `
    <div class="content-card">
      <div class="reflection-q">
        <div class="reflection-q-num">${step.reflection.num}</div>
        <div class="reflection-q-text">${escHtml(step.reflection.question)}</div>
        <textarea class="reflection-textarea" placeholder="Write your thoughts here…"
          oninput="saveReflection('${refKey}', this.value)">${escHtml(savedRef)}</textarea>
      </div>
    </div>` : ''}`;
}

/* ── FADED EXAMPLE ──────────────────────────────────────── */
function renderFaded(step) {
  const activeIdx = state.fadedActiveField;

  const fields = step.fields.map((f, idx) => {
    const completion = state.fadedValues[f.key] || '';
    const feedback = state.fadedFieldEvals[f.key] || '';
    const done = !!state.fadedFieldDone[f.key];
    const isPast = idx < activeIdx;
    const isFuture = idx > activeIdx;

    const pillHtml = `<span class="legend-pill ${f.type}">${componentIcon(f.type)} ${f.label}</span>`;

    if (isFuture) {
      return `
        <div class="faded-field faded-field--locked">
          <div class="faded-field-label">${pillHtml}</div>
          <div class="faded-locked-placeholder">${escHtml(f.placeholder)}</div>
        </div>`;
    }

    if (isPast) {
      const fullText = f.prefix ? `${f.prefix} ${completion}` : completion;
      return `
        <div class="faded-field faded-field--done">
          <div class="faded-field-label">${pillHtml}</div>
          <div class="faded-done-text">${escHtml(fullText)}</div>
        </div>`;
    }

    // Active field
    const evalBtn = `
      <button class="btn-eval-part" id="faded-eval-btn-${f.key}"
        onclick="evaluateFadedPart('${f.key}', ${idx})"
        ${completion.trim() ? '' : 'disabled'}>
        Evaluate →
      </button>`;

    const score = state.fadedFieldScores[f.key];
    const scoreHtml = feedback ? (() => {
      const s = score ?? 0;
      const color = s >= 3 ? '#16a34a' : s === 2 ? '#84cc16' : s === 1 ? '#f97316' : '#dc2626';
      const label = s >= 3 ? 'Proficient' : s === 2 ? 'Developing' : s === 1 ? 'Beginning' : 'Not met';
      return `<span class="faded-score-badge" style="background:${color}">${s}/3 · ${label}</span>`;
    })() : '';

    const feedbackHtml = feedback ? `
      <div class="faded-part-feedback">${scoreHtml} ${highlightBut(feedback)}</div>` : '';

    const nextBtn = done ? `
      <button class="btn-next-part" onclick="nextFadedPart(${idx}, ${step.fields.length})">
        ${idx === step.fields.length - 1 ? 'See Full Prompt →' : 'Next Part →'}
      </button>` : '';

    return `
      <div class="faded-field faded-field--active">
        <div class="faded-field-label">${pillHtml}</div>
        ${f.prefix ? `<div class="faded-prefix">${escHtml(f.prefix)}</div>` : ''}
        <textarea class="faded-completion" id="faded-${f.key}"
          placeholder="${escAttr(f.placeholder)}"
          oninput="updateFadedPart('${f.key}', this.value)">${escHtml(completion)}</textarea>
        <div class="faded-tip">💡 ${f.tip}</div>
        <div class="faded-part-actions">
          ${evalBtn}
          ${nextBtn}
        </div>
        ${feedbackHtml}
      </div>`;
  }).join('');

  const allDone = activeIdx >= step.fields.length;
  const assembledPrompt = assembleFadedPrompt(step);

  const fullPromptBlock = allDone && assembledPrompt ? `
    <div class="content-card" style="margin-top:1rem">
      <div class="builder-preview-label">📋 Your full prompt</div>
      <div class="full-prompt-preview">${escHtml(assembledPrompt)}</div>
    </div>` : '';

  return `
    <div class="content-card">
      <div class="scenario-box">
        <div class="scenario-box-label">Your Scenario</div>
        ${renderScenario(step.scenario)}
      </div>
      <div class="callout info" style="margin-top:1rem">
        <div class="callout-icon">✏️</div>
        <div class="callout-body">Complete each part one at a time. Write your response, click <strong>Evaluate</strong> for feedback, revise as many times as you like, then move to the next part.</div>
      </div>
      <div class="faded-form">${fields}</div>
    </div>
    ${fullPromptBlock}`;
}

function updateFadedPart(key, value) {
  state.fadedValues[key] = value;
  if (value.trim()) Tracker.fieldEdit('faded_' + key);
  const btn = document.getElementById(`faded-eval-btn-${key}`);
  if (btn) btn.disabled = !value.trim();
}

async function evaluateFadedPart(key, idx) {
  Tracker.click('faded_evaluate_' + key);
  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  if (!step) return;

  const field = step.fields[idx];
  const fieldText = (state.fadedValues[key] || '').trim();
  if (!fieldText) return;

  // Client-side gibberish check on user-typed text only (not prefix)
  const isGibberish = (
    fieldText.length <= 2 ||
    /^\d+$/.test(fieldText) ||
    /^(.)\1+$/i.test(fieldText) ||
    /^[^a-zA-Z]*$/.test(fieldText) ||
    (/^[a-zA-Z0-9]+$/.test(fieldText) && fieldText.split(/\s+/).length < 3 && fieldText.length < 15) ||
    /^(asdf|qwerty|zxcv|test|hello|hi|yes|no|idk|lol|abc|aaa|bbb|pizza|ok)\b/i.test(fieldText)
  );

  if (isGibberish) {
    state.fadedFieldEvals[key] = 'Please write a real teaching prompt for this part.';
    state.fadedFieldScores[key] = 0;
    state.fadedFieldDone[key] = true;
    document.getElementById('app-main').innerHTML = renderStep();
    return;
  }

  const btn = document.getElementById(`faded-eval-btn-${key}`);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `Evaluating… <span class="loading-dots"><span></span><span></span><span></span></span>`;
  }

  try {
    const result = await API.evaluatePart(key, fieldText, field.prefix || '');
    state.fadedFieldEvals[key] = result.feedback;
    state.fadedFieldScores[key] = result.score;
    state.fadedFieldDone[key] = true;
  } catch (err) {
    state.fadedFieldEvals[key] = 'Could not evaluate. Please check your connection.';
    state.fadedFieldScores[key] = 0;
    state.fadedFieldDone[key] = true;
  }

  document.getElementById('app-main').innerHTML = renderStep();
}

function nextFadedPart(idx, total) {
  Tracker.click('faded_next_part');
  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  if (!step) return;

  const cards = document.querySelectorAll('.faded-field');

  // Convert current active card to "done" state in place
  const currentField = step.fields[idx];
  const currentCard = cards[idx];
  if (currentCard && currentField) {
    const completion = (state.fadedValues[currentField.key] || '').trim();
    const fullText = currentField.prefix ? `${currentField.prefix} ${completion}` : completion;
    currentCard.className = 'faded-field faded-field--done';
    currentCard.innerHTML = `
      <div class="faded-field-label">
        <span class="legend-pill ${currentField.type}">${componentIcon(currentField.type)} ${currentField.label}</span>
      </div>
      <div class="faded-done-text">${escHtml(fullText)}</div>`;
  }

  state.fadedActiveField = idx + 1;

  if (idx < total - 1) {
    // Unlock next card in place
    const nextField = step.fields[idx + 1];
    const nextCard = cards[idx + 1];
    if (nextCard && nextField) {
      const completion = state.fadedValues[nextField.key] || '';
      const feedback = state.fadedFieldEvals[nextField.key] || '';
      const done = !!state.fadedFieldDone[nextField.key];
      const score = state.fadedFieldScores[nextField.key];

      const scoreHtml = feedback ? (() => {
        const s = score ?? 0;
        const color = s >= 3 ? '#16a34a' : s === 2 ? '#84cc16' : s === 1 ? '#f97316' : '#dc2626';
        const label = s >= 3 ? 'Proficient' : s === 2 ? 'Developing' : s === 1 ? 'Beginning' : 'Not met';
        return `<span class="faded-score-badge" style="background:${color}">${s}/3 · ${label}</span>`;
      })() : '';

      nextCard.className = 'faded-field faded-field--active';
      nextCard.innerHTML = `
        <div class="faded-field-label">
          <span class="legend-pill ${nextField.type}">${componentIcon(nextField.type)} ${nextField.label}</span>
        </div>
        ${nextField.prefix ? `<div class="faded-prefix">${escHtml(nextField.prefix)}</div>` : ''}
        <textarea class="faded-completion" id="faded-${nextField.key}"
          placeholder="${escAttr(nextField.placeholder)}"
          oninput="updateFadedPart('${nextField.key}', this.value)">${escHtml(completion)}</textarea>
        <div class="faded-tip">💡 ${escHtml(nextField.tip)}</div>
        <div class="faded-part-actions">
          <button class="btn-eval-part" id="faded-eval-btn-${nextField.key}"
            onclick="evaluateFadedPart('${nextField.key}', ${idx + 1})"
            ${completion.trim() ? '' : 'disabled'}>
            ${done ? 'Try Again' : 'Evaluate →'}
          </button>
          ${done ? `<button class="btn-next-part" onclick="nextFadedPart(${idx + 1}, ${total})">
            ${idx + 1 === total - 1 ? 'See Full Prompt →' : 'Next Part →'}
          </button>` : ''}
        </div>
        ${feedback ? `<div class="faded-part-feedback">${scoreHtml} ${highlightBut(feedback)}</div>` : ''}`;

      nextCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    // Last part — convert final card to done and append full prompt block
    const lastField = step.fields[idx];
    const lastCard = cards[idx];
    if (lastCard && lastField) {
      const completion = (state.fadedValues[lastField.key] || '').trim();
      const fullText = lastField.prefix ? `${lastField.prefix} ${completion}` : completion;
      lastCard.className = 'faded-field faded-field--done';
      lastCard.innerHTML = `
        <div class="faded-field-label">
          <span class="legend-pill ${lastField.type}">${componentIcon(lastField.type)} ${lastField.label}</span>
        </div>
        <div class="faded-done-text">${escHtml(fullText)}</div>`;
    }

    const assembledPrompt = assembleFadedPrompt(step);
    const fullBlock = document.createElement('div');
    fullBlock.className = 'content-card';
    fullBlock.style.marginTop = '1rem';
    fullBlock.innerHTML = `
      <div class="builder-preview-label">📋 Your full prompt</div>
      <div class="full-prompt-preview">${escHtml(assembledPrompt)}</div>`;
    document.querySelector('.faded-form').after(fullBlock);
    fullBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function assembleFadedPrompt(step) {
  const parts = step.fields.map(f => {
    const completion = (state.fadedValues[f.key] || '').trim();
    if (!completion) return '';
    if (f.prefix) return `${f.prefix} ${completion}`;
    return completion;
  }).filter(Boolean);
  return parts.join('\n\n');
}

/* ── FULL PRACTICE ──────────────────────────────────────── */
function renderFullPractice(step) {
  const evalResult = state.fullPracticeEval;
  const generated = state.fullPracticeGenerated;
  const prevGenerated = state.fullPracticePrevGenerated;

  const fields = step.fields.map(f => `
    <div class="practice-field">
      <div class="practice-field-label">
        <span class="legend-pill ${f.type}">${componentIcon(f.type)} ${f.label}</span>
      </div>
      <textarea class="builder-textarea" id="fp-${f.key}"
        placeholder="${escAttr(f.tip)}"
        oninput="updateFullPractice('${f.key}', this.value)">${escHtml(state.fullPracticeValues[f.key] || '')}</textarea>
      <div class="faded-tip">💡 ${f.tip}</div>
    </div>`).join('');

  const hasContent = Object.values(state.fullPracticeValues).some(v => v.trim());
  const assembledFP = step.fields.map(f => (state.fullPracticeValues[f.key] || '').trim()).filter(Boolean).join('\n\n');

  return `
    <div class="content-card">
      <div class="scenario-box">
        <div class="scenario-box-label">Your Scenario</div>
        ${renderScenario(step.scenario)}
      </div>
      <div class="callout info" style="margin-top:1rem">
        <div class="callout-icon">✏️</div>
        <div class="callout-body">Write a complete prompt using all 5 parts of the framework. Tip prompts are provided but the fields are blank — this is your prompt to write.</div>
      </div>
      <div class="practice-form">${fields}</div>
      <div style="margin-top:1.25rem">
        <div class="builder-preview-label">📋 Your assembled prompt</div>
        <div class="full-prompt-preview ${assembledFP ? '' : 'empty'}" id="fp-preview">
          ${assembledFP ? escHtml(assembledFP) : 'Your prompt will appear here as you type…'}
        </div>
      </div>
      <button class="btn-generate" id="fp-btn" style="margin-top:1.5rem" onclick="submitFullPractice()"
        ${hasContent ? '' : 'disabled'}>
        ${evalResult ? '🔄 Regenerate' : '✦ Submit — Get Feedback & See Output'}
      </button>
      ${evalResult ? `<div class="regen-notice" style="margin-top:0.75rem">🔄 <strong>Edit any field above and click Regenerate</strong> to see how your changes affect both the AI score and the generated lesson plan.</div>` : ''}
    </div>

    ${evalResult ? `
      <div class="content-card">
        <div class="practice-panels-header">📊 Your Prompt Score & Feedback</div>
        ${renderEvalResult(evalResult)}
      </div>

      <div class="content-card">
        <div class="practice-panels-header">📄 AI-Generated Lesson Plan</div>
        <div class="callout info" style="margin-bottom:1rem">
          <div class="callout-icon">🔄</div>
          <div class="callout-body"><strong>This is what your prompt produced.</strong> Edit your prompt above and click Regenerate to see how changes affect this output.</div>
        </div>
        <div class="response-body" style="margin-top:0">${escHtml(generated)}</div>
        ${prevGenerated ? `
          <details style="margin-top:1rem">
            <summary style="cursor:pointer;color:var(--text-secondary);font-size:0.9rem">Show previous version</summary>
            <div class="response-body" style="margin-top:0.75rem;opacity:0.7">${escHtml(prevGenerated)}</div>
          </details>` : ''}
      </div>` : ''}`;
}

function updateFullPractice(key, value) {
  state.fullPracticeValues[key] = value;
  if (value.trim()) Tracker.fieldEdit(key);

  const btn = document.getElementById('fp-btn');
  const hasContent = Object.values(state.fullPracticeValues).some(v => v.trim());
  if (btn) btn.disabled = !hasContent;

  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  const assembled = step
    ? step.fields.map(f => (state.fullPracticeValues[f.key] || '').trim()).filter(Boolean).join('\n\n')
    : '';

  const preview = document.getElementById('fp-preview');
  if (preview) {
    preview.textContent = assembled || 'Your prompt will appear here as you type…';
    preview.className = `full-prompt-preview ${assembled ? '' : 'empty'}`;
  }
}

async function submitFullPractice() {
  Tracker.click('submit_fullpractice');
  state.fullPracticeAttempt = (state.fullPracticeAttempt || 0) + 1;
  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  if (!step) return;

  const v = state.fullPracticeValues;
  const promptParts = [v.desired_results, v.learner_context, v.evidence_of_learning, v.instructional_plan, v.output_requirements].filter(p => p?.trim());
  const prompt = promptParts.join('\n\n');
  if (!prompt.trim()) return;

  const btn = document.getElementById('fp-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `Generating… <span class="loading-dots"><span></span><span></span><span></span></span>`;
  }

  // Save previous generated content
  if (state.fullPracticeGenerated) {
    state.fullPracticePrevGenerated = state.fullPracticeGenerated;
  }

  try {
    const evalResult = await API.evaluate(prompt);
    state.fullPracticeEval = evalResult;
    // Log score trajectory for each attempt
    API.logEvent('fullpractice_attempt', {
      attempt: state.fullPracticeAttempt,
      scores: evalResult.scores,
      total_score: evalResult.total_score,
      overall_judgment: evalResult.overall_judgment,
      strengths: evalResult.strengths,
      priority_improvements: evalResult.priority_improvements,
      revision_feedback: evalResult.revision_feedback,
      editedFields: Tracker.getEditedFields()
    });
    if (evalResult.gibberish) {
      state.fullPracticeGenerated = '';
    } else {
      state.fullPracticeGenerated = await API.generate(prompt);
    }
  } catch (err) {
    state.fullPracticeEval = {
      error: true, total_score: 0,
      scores: { desired_results: { score: 0 }, learner_context: { score: 0 }, evidence_of_learning: { score: 0 }, instructional_plan: { score: 0 }, output_requirements: { score: 0 } },
      overall_judgment: 'Beginning',
      revision_feedback: { next_best_revision: 'Could not evaluate. Please check your connection.' }
    };
    state.fullPracticeGenerated = 'Could not generate. Please check your connection.';
  }
  document.getElementById('app-main').innerHTML = renderStep();
}

/* ── Word diff ──────────────────────────────────────────── */
function computeWordDiff(oldText, newText) {
  const tokenize = s => {
    const tokens = [];
    s.split(/(\n)/).forEach(chunk => {
      if (chunk === '\n') { tokens.push('\n'); return; }
      chunk.split(/\s+/).forEach(w => { if (w) tokens.push(w); });
    });
    return tokens;
  };
  const a = tokenize(oldText), b = tokenize(newText);
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const ops = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) { ops.unshift({ t: '=', v: b[j - 1] }); i--; j--; }
    else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) { ops.unshift({ t: '+', v: b[j - 1] }); j--; }
    else { ops.unshift({ t: '-', v: a[i - 1] }); i--; }
  }
  let html = '', newline = true;
  for (const op of ops) {
    if (op.v === '\n') { html += '\n'; newline = true; continue; }
    const sp = newline ? '' : ' ';
    const s = escHtml(op.v);
    if (op.t === '=') html += sp + s;
    else if (op.t === '+') html += `${sp}<mark class="diff-add">${s}</mark>`;
    else html += `${sp}<del class="diff-del">${s}</del>`;
    newline = false;
  }
  return html;
}

function buildReflectionPromptText(values) {
  if (!values) return '';
  const order = ['desired_results', 'learner_context', 'evidence_of_learning', 'instructional_plan', 'output_requirements'];
  const parts = order.map(k => (values[k] || '').trim()).filter(Boolean);
  return parts.join('\n\n');
}

function inferChunkType(text) {
  const head = (text.split('\n')[0] || '').toLowerCase();
  if (/^(learning\s+objective|objective|students will|goal)/.test(head)) return 'objective';
  if (/\b(assessment|exit ticket|evidence of learning|check for understanding)\b/.test(head)) return 'assessment';
  if (/\b(materials|resources|handout)\b/.test(head)) return 'materials';
  if (/\b(warm-up|warm up|opening|hook)\b/.test(head)) return 'warmup';
  if (/\b(main activity|guided practice|independent practice|lesson sequence|procedure)\b/.test(head)) return 'activity';
  if (/\b(scaffold|differentiation|support|grouping|language support)\b/.test(head)) return 'scaffold';
  return 'section';
}

function splitLongTextBlock(text) {
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i += 12) {
    const chunk = lines.slice(i, i + 12).join('\n').trim();
    if (chunk) out.push(chunk);
  }
  return out.length ? out : [text];
}

function chunkLessonOutput(text) {
  if (!text || !String(text).trim()) return [];
  const normalized = String(text).replace(/\r\n/g, '\n').trim();
  let blocks = normalized.split(/\n\s*\n+/).map(b => b.trim()).filter(Boolean);
  if (blocks.length === 1 && blocks[0].length > 2500) {
    blocks = splitLongTextBlock(blocks[0]);
  }
  return blocks.map((t, i) => ({
    id: `c${i}`,
    type: inferChunkType(t),
    text: t
  }));
}

function renderReflectionChunksHtml(chunks, hlMap, showSemantic) {
  if (!chunks || chunks.length === 0) return '';
  return chunks.map(ch => {
    const h = showSemantic ? hlMap[ch.id] : null;
    const body = escHtml(ch.text);
    if (!h) {
      return `<div class="reflection-chunk" id="reflect-chunk-${escAttr(ch.id)}">${body}</div>`;
    }
    const rationale = escAttr(h.rationale || '');
    const before = h.beforeSummary ? escHtml(h.beforeSummary) : '';
    const after = h.afterSummary ? escHtml(h.afterSummary) : '';
    return `
      <div class="reflection-chunk reflection-chunk--meaningful" id="reflect-chunk-${escAttr(ch.id)}"
           tabindex="0" title="${rationale}">
        <span class="reflection-chunk-badge">${escHtml(h.label || 'Meaningful change')}</span>
        <div class="reflection-chunk-body">${body}</div>
        <div class="reflection-chunk-popover" role="tooltip">
          <p class="reflection-chunk-rationale">${escHtml(h.rationale || '')}</p>
          ${before ? `<p class="reflection-chunk-before"><strong>Before:</strong> ${before}</p>` : ''}
          ${after ? `<p class="reflection-chunk-before"><strong>After:</strong> ${after}</p>` : ''}
        </div>
      </div>`;
  }).join('');
}

function renderReflectionOutputPanel() {
  const generated = state.fullPracticeGenerated;
  let chunks = state.reflectionOutputChunks && state.reflectionOutputChunks.length
    ? state.reflectionOutputChunks
    : chunkLessonOutput(generated || '');
  const highlights = state.reflectionSemanticHighlights || [];
  const hlMap = Object.fromEntries(highlights.map(h => [h.chunkId, h]));
  const showSemantic = state.reflectionMeaningfulHighlightOn && highlights.length > 0;
  const canToggle = state.reflectionPrevGenerated && generated &&
    !String(generated).startsWith('Error generating');
  const toggleBtn = canToggle && highlights.length > 0
    ? `<button type="button" class="btn-diff-toggle" onclick="toggleMeaningfulHighlights()">
         ${showSemantic ? 'Hide highlights' : 'Highlight meaningful changes'}
       </button>`
    : '';

  let banner = '';
  if (showSemantic) {
    banner = `<div class="highlight-banner semantic-highlight-banner">
      Showing the ${highlights.length} parts of this lesson that shifted most in meaning after your prompt edits (not a word-by-word diff).
    </div>`;
  }

  let content;
  if (!generated) {
    content = `<div class="callout info" style="margin-top:0.5rem">
      <div class="callout-icon">📄</div>
      <div class="callout-body">Complete the Full Prompt Practice step first to see your generated lesson plan here.</div>
    </div>`;
  } else if (chunks.length > 0) {
    const inner = renderReflectionChunksHtml(chunks, hlMap, showSemantic);
    content = `${banner}<div class="reflection-output-chunks response-body" id="reflect-output">${inner}</div>`;
  } else {
    content = `<div class="response-body" id="reflect-output" style="margin-top:0.5rem">${escHtml(generated)}</div>`;
  }

  return `
    <div class="reflection-panel-header" style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap">
      <span>📄 AI-Generated Output</span>
      ${toggleBtn}
    </div>
    ${content}`;
}

function toggleMeaningfulHighlights() {
  state.reflectionMeaningfulHighlightOn = !state.reflectionMeaningfulHighlightOn;
  const panel = document.querySelector('.sr-output-panel');
  if (panel) panel.innerHTML = renderReflectionOutputPanel();
}

/* ── SELF-REFLECTION ────────────────────────────────────── */
function renderSelfReflection(step) {
  if (!state.reflectionAnswers) state.reflectionAnswers = {};
  if (state.reflectionCurrentQ === undefined) state.reflectionCurrentQ = 0;
  const hasEdits = state.reflectionEditValues &&
    Object.values(state.reflectionEditValues).some(v => v?.trim());
  if (!hasEdits) {
    state.reflectionEditValues = { ...state.fullPracticeValues };
  }

  const totalQ = step.questions.length;
  const qi = Math.min(state.reflectionCurrentQ, totalQ);

  const questionAreaHtml = qi >= totalQ
    ? `<div class="callout success"><div class="callout-icon">✅</div><div class="callout-body"><strong>All questions answered!</strong> Edit your prompt below and regenerate to see how changes affect the output.</div></div>`
    : renderReflectionQuestion(step.questions[qi], qi, totalQ);

  const v = state.reflectionEditValues;
  const promptFields = [
    { key: 'desired_results', label: 'Desired Results', type: 'desired_results' },
    { key: 'learner_context', label: 'Learner & Context', type: 'learner_context' },
    { key: 'evidence_of_learning', label: 'Evidence of Learning', type: 'evidence_of_learning' },
    { key: 'instructional_plan', label: 'Instructional Plan', type: 'instructional_plan' },
    { key: 'output_requirements', label: 'Output Requirements', type: 'output_requirements' }
  ].map(f => `
    <div class="right-field">
      <div class="right-field-label">
        <span class="legend-pill ${f.type}" style="font-size:0.75rem;padding:0.2rem 0.5rem">${f.label}</span>
      </div>
      <textarea class="compact-textarea" rows="2"
        oninput="updateReflectionField('${f.key}', this.value)">${escHtml(v[f.key] || '')}</textarea>
    </div>`).join('');

  return `
    <p class="reflection-intro">${step.intro}</p>

    <div class="sr-question-card content-card" id="reflection-q-area">
      ${questionAreaHtml}
    </div>

    <div class="sr-bottom-row">
      <div class="sr-prompt-panel content-card">
        <div class="reflection-panel-header">🔄 Refine Your Prompt</div>
        <div class="callout warning" style="margin-bottom:1rem">
          <div class="callout-icon">💡</div>
          <div class="callout-body"><strong>Try it!</strong> Edit any part of your prompt and click Regenerate to see how the output changes.</div>
        </div>
        ${promptFields}
        <button class="btn-generate" id="reflect-regen-btn" style="margin-top:1rem;width:100%" onclick="regenReflection()">
          🔄 Regenerate Output
        </button>
        ${state.reflectionGibberish ? `
          <div style="margin-top:1rem">
            <div class="callout" style="border-left-color:var(--danger);background:#fff5f5">
              <div class="callout-icon">⚠️</div>
              <div class="callout-body"><strong>Input not recognised.</strong> Please revise your prompt and try again.</div>
            </div>
          </div>` : ''}
      </div>

      <div class="sr-output-panel content-card">
        ${renderReflectionOutputPanel()}
      </div>
    </div>`;
}

function renderReflectionQuestion(q, qi, totalQ) {
  const saved = state.reflectionAnswers[qi] || '';
  const hasAnswer = saved.trim().length > 0;
  const isLast = qi === totalQ - 1;

  const dots = Array.from({ length: totalQ }, (_, i) =>
    `<div class="sr-q-dot ${i < qi ? 'done' : i === qi ? 'active' : ''}"></div>`
  ).join('');

  return `
    <div class="sr-q-header">
      <span class="sr-q-counter">Question ${qi + 1} of ${totalQ}</span>
      <div class="sr-q-dots">${dots}</div>
    </div>
    <div class="sr-q-num">${q.num}</div>
    <div class="sr-q-text">${escHtml(q.question)}</div>
    ${q.hint ? `<div class="faded-tip" style="margin-bottom:0.75rem">💡 ${escHtml(q.hint)}</div>` : ''}
    ${q.starter ? `
      <div class="callout info" style="margin-bottom:0.75rem">
        <div class="callout-icon">✏️</div>
        <div class="callout-body">
          <strong>Complete the sentence:</strong><br>
          <em>${escHtml(q.starter)}</em>
        </div>
      </div>` : ''}
    ${q.type === 'multiple_choice' ? `
      <div class="sr-q-mc-options" style="margin-top: 0.5rem">
        ${q.options.map((opt, optIndex) => `
          <label class="sr-mc-label" style="display: flex; align-items: center; margin-bottom: 0.75rem; cursor: pointer; padding: 0.75rem 1rem; border: 1px solid var(--border, #e5e7eb); border-radius: 8px; background: #fff; transition: all 0.2s ease;"
                 onmouseover="this.style.borderColor='var(--primary, #6366f1)'; this.style.backgroundColor='#f8fafc';"
                 onmouseout="this.style.borderColor='var(--border, #e5e7eb)'; this.style.backgroundColor='#fff';">
            <input type="radio" name="sr_q_${qi}" value="${escAttr(opt)}"
              onchange="saveReflectionAnswer(${qi}, this.value)"
              ${saved === opt ? 'checked' : ''}
              style="margin-right: 0.75rem; width: 1.1rem; height: 1.1rem; accent-color: var(--primary, #6366f1); cursor: pointer;">
            <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-main, #1f2937);">${escHtml(opt)}</span>
          </label>
        `).join('')}
      </div>
    ` : `
      <textarea class="prompt-textarea" id="sr-q-textarea"
        placeholder="${q.starter ? escAttr(q.starter) : 'Write your response here…'}"
        oninput="saveReflectionAnswer(${qi}, this.value)"
        style="margin-top:0;min-height:100px">${escHtml(saved)}</textarea>
    `}
    <div class="sr-q-nav">
      <button id="reflection-next-btn" class="btn-nav primary"
        onclick="advanceReflectionQuestion()"
        ${hasAnswer ? '' : 'disabled'}>
        ${isLast ? 'Done ✓' : 'Next Question →'}
      </button>
    </div>`;
}

function advanceReflectionQuestion() {
  Tracker.click('reflection_next_question');
  state.reflectionCurrentQ = (state.reflectionCurrentQ || 0) + 1;
  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  if (!step) return;
  const totalQ = step.questions.length;
  const qi = state.reflectionCurrentQ;
  const area = document.getElementById('reflection-q-area');
  if (!area) return;
  area.innerHTML = qi >= totalQ
    ? `<div class="callout success"><div class="callout-icon">✅</div><div class="callout-body"><strong>All questions answered!</strong> Edit your prompt below and regenerate to see how changes affect the output.</div></div>`
    : renderReflectionQuestion(step.questions[qi], qi, totalQ);
}

function saveReflectionAnswer(qi, value) {
  state.reflectionAnswers[qi] = value;
  const nextBtn = document.getElementById('reflection-next-btn');
  if (nextBtn) nextBtn.disabled = !value.trim();
}

function updateReflectionField(key, value) {
  if (!state.reflectionEditValues) state.reflectionEditValues = {};
  state.reflectionEditValues[key] = value;
  // No re-render — just save to state (avoids focus loss)
}


async function regenReflection() {
  Tracker.click('reflect_regenerate');
  state.reflectionRegenAttempt = (state.reflectionRegenAttempt || 0) + 1;
  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  if (!step) return;

  const v = state.reflectionEditValues || state.fullPracticeValues;
  const typedValues = [v.desired_results, v.learner_context, v.evidence_of_learning, v.instructional_plan, v.output_requirements].map(s => (s || '').trim()).filter(Boolean);
  const prompt = typedValues.join('\n\n');
  if (!prompt.trim()) return;

  // Instant pre-check for obviously trivial inputs
  const isObviouslyTrivial = typedValues.some(val => {
    if (val.length <= 2) return true;
    if (/^\d+$/.test(val)) return true;
    if (/^(.)\1+$/.test(val)) return true;
    if (val.split(/\s+/).length < 3 && /^[a-zA-Z0-9]+$/.test(val)) return true;
    return false;
  });
  if (isObviouslyTrivial) {
    state.reflectionGibberish = true;
    document.getElementById('app-main').innerHTML = renderStep();
    return;
  }

  const btn = document.getElementById('reflect-regen-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = `Regenerating… <span class="loading-dots"><span></span><span></span><span></span></span>`; }

  state.reflectionGibberish = false;

  // Prompt that produced the lesson currently on screen: use last post-regen snapshot when
  // iterating; before any reflection regen, use fullPracticeValues (that generated FP output).
  const prevPromptSnapshot = {
    ...(state.reflectionPrevPromptValues != null
      ? state.reflectionPrevPromptValues
      : state.fullPracticeValues || {})
  };
  const curValues = state.reflectionEditValues || state.fullPracticeValues || {};
  const fieldLabels = {
    desired_results: 'Desired Results',
    learner_context: 'Learner & Context',
    evidence_of_learning: 'Evidence of Learning',
    instructional_plan: 'Instructional Plan',
    output_requirements: 'Output Requirements'
  };
  const changedFields = Object.keys(fieldLabels)
    .filter(k => (curValues[k] || '').trim() !== (prevPromptSnapshot[k] || '').trim())
    .map(k => ({ name: fieldLabels[k], oldVal: (prevPromptSnapshot[k] || '').trim(), newVal: (curValues[k] || '').trim() }));

  // Always compare the new generation to the output shown *before* this click (iterative:
  // regen N compares to regen N−1, not the original full-practice lesson).
  if (state.fullPracticeGenerated) {
    state.reflectionPrevGenerated = state.fullPracticeGenerated;
  }
  state.reflectionPrevPromptValues = { ...curValues };

  try {
    state.fullPracticeGenerated = await API.generate(prompt);
  } catch (err) {
    state.fullPracticeGenerated = `Error generating output: ${err.message}`;
  }

  state.reflectionOutputChunks = chunkLessonOutput(state.fullPracticeGenerated || '');
  state.reflectionSemanticHighlights = [];
  state.reflectionMeaningfulHighlightOn = false;

  const previousOutput = state.reflectionPrevGenerated || '';
  const revisedOutput = state.fullPracticeGenerated || '';
  const genFailed = String(revisedOutput).startsWith('Error generating');
  const previousPrompt = buildReflectionPromptText(prevPromptSnapshot);
  const revisedPrompt = buildReflectionPromptText(curValues);

  if (previousOutput && !genFailed && changedFields.length > 0) {
    try {
      const prevChunks = chunkLessonOutput(previousOutput);
      const hlResult = await API.semanticHighlights({
        previousPrompt,
        revisedPrompt,
        previousOutput,
        revisedOutput,
        previousChunks: prevChunks,
        revisedChunks: state.reflectionOutputChunks
      });
      state.reflectionSemanticHighlights = hlResult.highlights || [];
    } catch (err) {
      console.error('[semantic-highlights] API call failed:', err);
    }
  }

  const outputPanel = document.querySelector('.sr-output-panel');
  if (outputPanel) {
    outputPanel.innerHTML = renderReflectionOutputPanel();
    if (btn) { btn.disabled = false; btn.textContent = '🔄 Regenerate Output'; }
  } else {
    document.getElementById('app-main').innerHTML = renderStep();
  }
}

/* ── POST-TEST ──────────────────────────────────────────── */
function renderPosttest(step) {
  state.posttestEvals = state.posttestEvals || [];
  const evalsCount = state.posttestEvals.length;
  const evalResult = evalsCount > 0 ? state.posttestEvals[evalsCount - 1] : null;
  const preEval = state.pretestEval;

  let evalHtml = '';
  if (evalResult) {
    evalHtml = renderEvalResult(evalResult);

    // Score comparison
    if (preEval) {
      const preScore = preEval.total_score || preEval.total || 0;
      const finalScore = evalResult.total_score || 0;
      const diff = finalScore - preScore;
      const diffText = diff > 0 ? `+${diff}` : `${diff}`;
      const diffColor = diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--danger)' : 'var(--text-secondary)';

      const attemptsHtml = state.posttestEvals.map((ev, idx) => {
        const s = ev.total_score || 0;
        return `
            <div class="score-compare-item">
              <div class="score-compare-label">Attempt ${idx + 1}</div>
              <div class="score-compare-bar-wrap">
                <div class="score-compare-bar post" style="width:${(s / 15) * 100}%"></div>
              </div>
              <div class="score-compare-num">${s}/15</div>
            </div>`;
      }).join('');

      evalHtml = `
        <div class="score-compare">
          <div class="score-compare-title">Your Progress</div>
          <div class="score-compare-row">
            <div class="score-compare-item">
              <div class="score-compare-label">Pre-Test</div>
              <div class="score-compare-bar-wrap">
                <div class="score-compare-bar" style="width:${(preScore / 15) * 100}%"></div>
              </div>
              <div class="score-compare-num">${preScore}/15</div>
            </div>
            ${attemptsHtml}
          </div>
          <div class="score-compare-diff" style="color:${diffColor}">
            ${diff === 0 ? 'Same score as pre-test' : `${diffText} points from pre-test`}
          </div>
        </div>
        ${renderEvalResult(evalResult)}`;
    }

    evalHtml += `
      <div class="callout success" style="margin-top:1rem">
        <div class="callout-icon">🎉</div>
        <div class="callout-body">
          <strong>Congratulations!</strong> You have successfully completed the first step of your design journey. You now have the framework to craft evidence-based lesson plans that move beyond generic AI output and focus on true active learning. ${evalsCount < 3 ? 'You can revise your prompt and re-evaluate below, or c' : 'C'}lick <strong>Complete Module →</strong> to finish.
        </div>
      </div>`;
  }

  return `
    <div class="content-card">
      <div class="test-badge posttest-badge">Post-Test · 5 min</div>
      <p style="margin-bottom:1rem">${escHtml(step.instruction)}</p>
      <div class="scenario-box">
        <div class="scenario-box-label">Scenario</div>
        ${renderScenario(step.scenario)}
      </div>

      <div style="margin-top:1.5rem">
        <div class="playground-section-label">✏️ Your Prompt</div>
        <textarea class="prompt-textarea" id="posttest-input"
          placeholder="${escAttr(step.placeholder)}"
          ${evalsCount >= 3 ? 'readonly' : ''}>${escHtml(state.posttestPrompt)}</textarea>
      </div>
      ${evalsCount === 0 ? `
        <button class="btn-generate" id="posttest-btn" style="margin-top:1rem" onclick="submitPosttest()">
          Submit for Evaluation →
        </button>` : evalsCount < 3 ? `
        <button class="btn-generate" id="posttest-btn" style="margin-top:1rem" onclick="submitPosttest()">
          Regenerate & Re-evaluate (Attempt ${evalsCount + 1} of 3) →
        </button>` : ''}
      ${evalHtml}
      ${state.posttestGenerated ? `
        <div style="margin-top:1.5rem">
          <div class="playground-section-label">📄 AI Output — based on your prompt</div>
          <div class="response-body">${escHtml(state.posttestGenerated)}</div>
        </div>` : ''}
    </div>`;
}

async function submitPosttest() {
  Tracker.click('submit_posttest');
  const input = document.getElementById('posttest-input');
  const btn = document.getElementById('posttest-btn');
  if (!input) return;
  const prompt = input.value.trim();
  if (!prompt) return;

  state.posttestPrompt = prompt;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `Evaluating… <span class="loading-dots"><span></span><span></span><span></span></span>`;
  }

  try {
    const result = await API.evaluate(prompt);
    state.posttestEvals = state.posttestEvals || [];
    state.posttestEvals.push(result);
    state.posttestEval = result;
    API.logEvent('submit_posttest', { prompt, evalResult: result, attempt: state.posttestEvals.length });
    if (!result.gibberish) {
      state.posttestGenerated = await API.generate(prompt);
    }
  } catch (err) {
    const errResult = {
      error: true, total_score: 0,
      scores: { desired_results: { score: 0 }, learner_context: { score: 0 }, evidence_of_learning: { score: 0 }, instructional_plan: { score: 0 }, output_requirements: { score: 0 } },
      overall_judgment: 'Beginning',
      revision_feedback: { next_best_revision: 'Could not evaluate. Please check your connection.' }
    };
    state.posttestEvals = state.posttestEvals || [];
    state.posttestEvals.push(errResult);
    state.posttestEval = errResult;
  }
  document.getElementById('app-main').innerHTML = renderStep();
}

/* ── Module complete ────────────────────────────────────── */
function renderComplete() {
  const mod = MODULES.find(m => m.id === state.moduleId);
  const nextMod = MODULES.find(m => m.id === state.moduleId + 1);
  const isLastMod = !nextMod;

  return `
    <div class="step-view fade-in">
      <div class="module-complete">
        <div class="complete-icon">${isLastMod ? '🏆' : '🎉'}</div>
        <h2>${isLastMod ? 'Module Complete!' : `Module ${state.moduleId} Complete!`}</h2>
        <p>${state.moduleId === 1
      ? 'Congratulations! You have successfully completed the first step of your design journey. You now have the framework to craft evidence-based lesson plans that move beyond generic AI output and focus on true active learning.'
      : isLastMod
        ? 'Congratulations — you have completed ESL Co-Pilot.'
        : `Great work! You have finished "${mod?.title}". You are ready for the next module.`
    }</p>
        ${isLastMod
      ? `<button class="btn-back-dashboard" onclick="navigateDashboard()">← Back to Dashboard</button>`
      : `<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
               <button class="btn-back-dashboard" onclick="navigateDashboard()">← Back to Dashboard</button>
               <button class="btn-start" onclick="navigateStep(${nextMod.id}, 0)">Start Next Module →</button>
             </div>`
    }
      </div>
    </div>`;
}

/* ── Event listeners ────────────────────────────────────── */
function attachStepListeners() { }

/* ── Quiz handlers ──────────────────────────────────────── */
function selectQuizAnswer(qi, oi) {
  if (state.quizChecked) return;
  state.quizAnswers[qi] = oi;
  document.getElementById('app-main').innerHTML = renderStep();
}

function checkAnswers() {
  Tracker.click('quiz_check_answers');
  state.quizChecked = true;
  API.logEvent('quiz_checked', { answers: state.quizAnswers });
  document.getElementById('app-main').innerHTML = renderStep();
}

/* ── Builder handlers ───────────────────────────────────── */
function updateBuilder(key, value) {
  state.builderValues[key] = value;
  const preview = document.getElementById('builder-preview');
  const text = buildPromptPreview();
  if (preview) {
    preview.textContent = text || 'Fill in the fields above to see your prompt take shape…';
    preview.className = `builder-preview ${text ? '' : 'empty'}`;
  }
  document.getElementById('app-main').innerHTML = renderStep();
  const el = document.getElementById(`builder-${key}`);
  if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
}

async function sendBuilderPrompt() {
  Tracker.click('builder_send');
  const prompt = buildPromptPreview();
  if (!prompt.trim()) return;
  const responseArea = document.getElementById('builder-response-area');
  const responseBody = document.getElementById('builder-response-body');
  if (!responseArea || !responseBody) return;
  responseArea.style.display = '';
  responseBody.className = 'response-body loading';
  responseBody.innerHTML = `Generating… <span class="loading-dots"><span></span><span></span><span></span></span>`;
  try {
    const result = await API.generate(prompt);
    responseBody.className = 'response-body';
    responseBody.textContent = result;
    API.logEvent('generate_prompt', { type: 'builder', prompt, result });
  } catch (err) {
    responseBody.className = 'response-body error';
    responseBody.textContent = `Error: ${err.message}`;
  }
}

/* ── Playground handlers ────────────────────────────────── */
async function sendPlaygroundPrompt() {
  Tracker.click('playground_send');
  const input = document.getElementById('playground-input');
  const btn = document.getElementById('playground-btn');
  const responseArea = document.getElementById('playground-response-area');
  const responseBody = document.getElementById('playground-response-body');
  if (!input || !responseArea || !responseBody) return;
  const prompt = input.value.trim();
  if (!prompt) return;
  state[`playground_prompt_${state.moduleId}_${state.stepIndex}`] = prompt;
  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  btn.disabled = true;
  btn.textContent = 'Generating…';
  responseArea.style.display = '';
  responseBody.className = 'response-body loading';
  responseBody.innerHTML = `Generating… <span class="loading-dots"><span></span><span></span><span></span></span>`;
  try {
    const result = await API.generate(prompt);
    state[`playground_response_${state.moduleId}_${state.stepIndex}`] = result;
    responseBody.className = 'response-body';
    responseBody.textContent = result;
    API.logEvent('generate_prompt', { type: 'playground', prompt, result });
  } catch (err) {
    responseBody.className = 'response-body error';
    responseBody.textContent = `Error: ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.textContent = '✦ Generate Response';
  }
}

/* ── Transfer handlers ──────────────────────────────────── */
async function sendTransferPrompt() {
  Tracker.click('transfer_send');
  const input = document.getElementById('transfer-input');
  const btn = document.getElementById('transfer-btn');
  const responseArea = document.getElementById('transfer-response-area');
  const responseBody = document.getElementById('transfer-response-body');
  if (!input) return;
  const prompt = input.value.trim();
  if (!prompt) return;
  state.transferPrompt = prompt;
  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  btn.disabled = true;
  btn.textContent = 'Generating…';
  responseArea.style.display = '';
  responseBody.className = 'response-body loading';
  responseBody.innerHTML = `Generating… <span class="loading-dots"><span></span><span></span><span></span></span>`;
  try {
    const result = await API.generate(prompt);
    state.transferResponse = result;
    responseBody.className = 'response-body';
    responseBody.textContent = result;
    API.logEvent('generate_prompt', { type: 'transfer', prompt, result });
    document.getElementById('app-main').innerHTML = renderStep();
  } catch (err) {
    responseBody.className = 'response-body error';
    responseBody.textContent = `Error: ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.textContent = '✦ Send to AI';
  }
}

/* ── Reflection save ────────────────────────────────────── */
function saveReflection(key, value) {
  state.reflectionValues[key] = value;
}

/* ── Utility ────────────────────────────────────────────── */
function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightBut(str) {
  if (!str) return '';
  const escaped = escHtml(str);
  return escaped.replace(/(\bBUT\b.*)/i, '<span class="feedback-but">$1</span>');
}
function escAttr(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/\n/g, '&#10;');
}

/* ── Init ───────────────────────────────────────────────── */
/* ── Name entry gate ────────────────────────────────────── */
function renderNameEntry() {
  document.getElementById('app-header').classList.add('hidden');
  document.getElementById('app-main').innerHTML = `
    <div class="landing fade-in" style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg)">
      <div class="content-card" style="max-width:400px;width:100%;text-align:center;padding:2.5rem">
        <div style="font-size:2.2rem;margin-bottom:1rem">✦</div>
        <h2 style="margin-bottom:0.4rem;font-size:1.5rem">ESL Co-Pilot</h2>
        <p style="color:var(--text-secondary);margin-bottom:2rem;font-size:0.95rem">
          Enter a username to begin.<br>
          Your progress and responses will be saved under this name.
        </p>
        <div style="text-align:left;margin-bottom:0.4rem">
          <label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em">Username</label>
        </div>
        <input
          id="name-input"
          type="text"
          placeholder="e.g. Sarah or P01"
          autocomplete="off"
          style="width:100%;padding:0.75rem 1rem;font-size:1rem;border:1.5px solid var(--border);border-radius:8px;outline:none;margin-bottom:1.25rem;box-sizing:border-box;transition:border-color 0.2s"
          oninput="document.getElementById('name-btn').disabled = !this.value.trim()"
          onfocus="this.style.borderColor='var(--accent)'"
          onblur="this.style.borderColor='var(--border)'"
          onkeydown="if(event.key==='Enter') confirmName()"
        />
        <button
          id="name-btn"
          class="btn-start"
          style="width:100%;padding:0.8rem"
          disabled
          onclick="confirmName()">
          Continue →
        </button>
        <p style="margin-top:1.25rem;font-size:0.8rem;color:var(--text-secondary)">
          Use the same username each time to keep your data together.
        </p>
      </div>
    </div>`;
  setTimeout(() => document.getElementById('name-input')?.focus(), 50);
}

function confirmName() {
  const input = document.getElementById('name-input');
  const name = input?.value.trim();
  if (!name) return;
  localStorage.setItem('promptcraft_participant_id', name);
  API.logEvent('session_start', {
    participantId: name,
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    screenW: screen.width,
    screenH: screen.height
  });
  render();
}

function logout() {
  if (!confirm('Switch user? Your progress is saved and will be restored when you log back in with the same username.')) return;
  localStorage.removeItem('promptcraft_participant_id');
  localStorage.removeItem('promptcraft_session_id');
  renderNameEntry();
}

/* ── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  const hasName = !!localStorage.getItem('promptcraft_participant_id');
  if (!hasName) {
    renderNameEntry();
  } else {
    API.logEvent('session_start', {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      screenW: screen.width,
      screenH: screen.height
    });
    render();
  }
});
