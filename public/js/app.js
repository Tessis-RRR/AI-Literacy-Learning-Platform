/* ============================================================
   PromptCraft — App logic & rendering
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
  // Pre-test
  pretestPrompt: '',
  pretestEval: null,       // { scores, total, feedback, overall }
  introSkipped: false,
  // Faded example
  fadedValues: {},         // { goal, context, task, constraints, output } — completion text only
  fadedGenerated: '',
  // Annotated
  annotatedMatches: {},
  annotatedOrder: {},
  // Full practice
  fullPracticeValues: {},  // { goal, context, task, constraints, output }
  fullPracticeEval: null,
  fullPracticeGenerated: '',
  fullPracticePrevGenerated: '',
  // Self-reflection
  reflectionAnswers: {},   // { qi: { selected: [], other: '' } }
  reflectionEditValues: null, // copy of fullPracticeValues seeded on first visit; edits stay here only
  reflectionGibberish: false,
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
  state.moduleId = null;
  state.stepIndex = 0;
  render();
}
function navigateStep(moduleId, stepIndex) {
  state.view = 'step';
  state.moduleId = moduleId;
  state.stepIndex = stepIndex;
  state.quizAnswers = {};
  state.quizChecked = false;
  markStepVisited(moduleId, stepIndex);
  render();
}
function nextStep() {
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
  const pct = totalProgress();
  if (state.view === 'dashboard') {
    header.classList.remove('hidden');
    header.innerHTML = `
      <div class="header-inner">
        <a class="header-logo" href="#" onclick="navigateDashboard(); return false;">
          <div class="header-logo-icon">✦</div>
          <span class="header-logo-text">PromptCraft</span>
        </a>
        <div class="header-progress-wrap">
          <div class="header-progress-label">Overall Progress — ${pct}%</div>
          <div class="header-progress-bar-bg">
            <div class="header-progress-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
      </div>`;
  } else {
    const mod = MODULES.find(m => m.id === state.moduleId);
    const modPct = mod ? getModuleProgress(mod.id) : 0;
    header.classList.remove('hidden');
    header.innerHTML = `
      <div class="header-inner">
        <a class="header-logo" href="#" onclick="navigateDashboard(); return false;">
          <div class="header-logo-icon">✦</div>
          <span class="header-logo-text">PromptCraft</span>
        </a>
        <div class="header-progress-wrap">
          <div class="header-progress-label">${mod ? mod.title : ''} — ${modPct}%</div>
          <div class="header-progress-bar-bg">
            <div class="header-progress-bar-fill" style="width:${modPct}%"></div>
          </div>
        </div>
        <button class="header-back-btn" onclick="navigateDashboard()">← Modules</button>
      </div>`;
  }
}

/* ── Dashboard ──────────────────────────────────────────── */
function renderDashboard() {
  const allDone = MODULES.every(m => state.progress[m.id]?.completed);
  return `
    <div class="landing fade-in">
      <div class="landing-hero">
        <div class="landing-hero-badge">✦ AI Literacy for Multilingual Teachers</div>
        <h1>Welcome to <span>PromptCraft</span></h1>
        <p>Learn to write structured AI prompts that generate lesson plans and bilingual teaching materials — reliably and efficiently.</p>
        <div class="landing-stats">
          <div class="landing-stat">
            <span class="landing-stat-value">30</span>
            <span class="landing-stat-label">Minutes</span>
          </div>
          <div class="landing-stat">
            <span class="landing-stat-value">5</span>
            <span class="landing-stat-label">Framework Parts</span>
          </div>
          <div class="landing-stat">
            <span class="landing-stat-value">Live</span>
            <span class="landing-stat-label">AI Practice</span>
          </div>
          <div class="landing-stat">
            <span class="landing-stat-value">5</span>
            <span class="landing-stat-label">Rubric Dimensions</span>
          </div>
        </div>
        ${allDone
      ? `<div class="callout success" style="text-align:left;max-width:460px;margin:0 auto;"><div class="callout-icon">🎉</div><div class="callout-body"><strong>Module complete!</strong> You can revisit any section anytime.</div></div>`
      : `<button class="btn-start" onclick="startCourse()">${totalProgress() > 0 ? 'Continue Learning' : 'Start Learning →'}</button>`
    }
      </div>

      <div class="modules-section">
        <h2>Module Overview</h2>
        <div class="modules-grid">
          ${MODULES.map((mod, idx) => renderModuleCard(mod, idx)).join('')}
        </div>
      </div>
    </div>`;
}

function renderModuleCard(mod, idx) {
  const pct = getModuleProgress(mod.id);
  const completed = state.progress[mod.id]?.completed;
  const visited = (state.progress[mod.id]?.stepsVisited?.size || 0) > 0;

  let statusLabel, statusClass;
  if (completed) { statusLabel = '✓ Complete'; statusClass = 'status-completed'; }
  else if (visited) { statusLabel = '→ In Progress'; statusClass = 'status-in-progress'; }
  else { statusLabel = 'Not Started'; statusClass = 'status-not-started'; }

  return `
    <div class="module-card ${completed ? 'completed' : ''} fade-in fade-in-delay-${idx}" onclick="navigateStep(${mod.id}, 0)">
      <div class="module-card-header">
        <div class="module-card-header-icon">${mod.icon}</div>
        <div class="module-card-header-info">
          <div class="module-card-num">Module ${mod.id}</div>
          <div class="module-card-title">${mod.title}</div>
        </div>
      </div>
      <div class="module-card-desc">${mod.description}</div>
      ${pct > 0 ? `
        <div class="module-progress-bar">
          <div class="module-progress-fill" style="width:${pct}%"></div>
        </div>` : ''}
      <div class="module-card-footer">
        <div class="module-card-meta">
          <span>⏱ ${mod.duration}</span>
          <span>📄 ${mod.steps} steps</span>
        </div>
        <span class="module-card-status ${statusClass}">${statusLabel}</span>
      </div>
    </div>`;
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
            <strong>Great work!</strong> Your prompt already shows strong structure (${evalResult.total}/15).
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
        <p>${escHtml(step.scenario)}</p>
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
    </div>`;
}

async function submitPretest() {
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
    if (result.total >= 10) state.introSkipped = true;
  } catch (err) {
    state.pretestEval = {
      error: true, total: 0,
      scores: { goal: 0, context: 0, task: 0, constraints: 0, output: 0 },
      feedback: { goal: err.message, context: '', task: '', constraints: '', output: '' },
      overall: 'Could not evaluate. Please check your connection and try again.'
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
    goal: 'Goal',
    context: 'Context',
    task: 'Task',
    constraints: 'Constraints',
    output: 'Output Format'
  };
  const barColor = s => {
    if (s === 0) return '#dc2626';
    if (s === 1) return '#f97316';
    if (s === 2) return '#84cc16';
    return '#16a34a';
  };

  const dims = ['goal', 'context', 'task', 'constraints', 'output'];
  const barCols = dims.map(key => {
    const s = evalResult.scores[key];
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

  const totalColor = evalResult.total >= 10 ? 'eval-total-high' : evalResult.total >= 6 ? 'eval-total-mid' : 'eval-total-low';

  return `
    <div class="eval-result">
      <div class="eval-header">
        <div class="eval-total ${totalColor}">
          <span class="eval-total-num">${evalResult.total}</span><span class="eval-total-denom"> / 15</span>
        </div>
      </div>
      <div class="score-bar-chart">
        <div class="score-bar-y">
          <span>3</span><span>2</span><span>1</span><span>0</span>
        </div>
        <div class="score-bar-cols">${barCols}</div>
      </div>
      <div class="eval-overall-feedback">${highlightBut(evalResult.overall || '')}</div>
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

  const types = ['goal', 'context', 'task', 'constraint', 'output'];
  const labels = { goal: 'Goal', context: 'Context', task: 'Task', constraint: 'Constraints', output: 'Output Format' };

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
        <p>${escHtml(step.scenario)}</p>
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
  return { goal: '🎯', context: '👥', task: '📋', constraint: '🔒', output: '📄' }[type] || '•';
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
  if (v.context) parts.push(v.context.trim());
  if (v.goal) parts.push(v.goal.trim());
  if (v.task) parts.push(v.task.trim());
  if (v.constraint) parts.push(v.constraint.trim());
  if (v.output) parts.push(v.output.trim());
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
  const evalResult = state.fadedEval;

  const fields = step.fields.map(f => {
    const completion = state.fadedValues[f.key] || '';
    const hasPrefix = !!f.prefix;

    return `
      <div class="faded-field">
        <div class="faded-field-label">
          <span class="legend-pill ${f.type}">${componentIcon(f.type)} ${f.label}</span>
        </div>
        ${hasPrefix ? `
          <div class="faded-prefix">${escHtml(f.prefix)}</div>
          <textarea class="faded-completion" id="faded-${f.key}"
            placeholder="${escAttr(f.placeholder)}"
            oninput="updateFaded('${f.key}', this.value)">${escHtml(completion)}</textarea>
        ` : `
          <textarea class="faded-full" id="faded-${f.key}"
            placeholder="${escAttr(f.placeholder)}"
            oninput="updateFaded('${f.key}', this.value)">${escHtml(completion)}</textarea>
        `}
        <div class="faded-tip">💡 ${f.tip}</div>
      </div>`;
  }).join('');

  const assembledPrompt = assembleFadedPrompt(step);

  return `
    <div class="content-card">
      <div class="scenario-box">
        <div class="scenario-box-label">Your Scenario</div>
        <p>${escHtml(step.scenario)}</p>
      </div>
      <div class="callout info" style="margin-top:1rem">
        <div class="callout-icon">✏️</div>
        <div class="callout-body">Complete the fields below using the scenario above. Pre-filled parts are already written for you — just add what's missing.</div>
      </div>
      <div class="faded-form">${fields}</div>

      <div style="margin-top:1.5rem">
        <div class="builder-preview-label">📋 Your assembled prompt</div>
        <div class="full-prompt-preview ${assembledPrompt ? '' : 'empty'}" id="faded-preview">
          ${assembledPrompt ? escHtml(assembledPrompt) : 'Fill in the fields above to see your prompt take shape…'}
        </div>
      </div>
      <button class="btn-generate" id="faded-btn" style="margin-top:1rem"
        onclick="submitFaded()" ${assembledPrompt ? '' : 'disabled'}>
        Submit for Feedback →
      </button>
    </div>

    ${evalResult ? `
      <div class="content-card">
        ${renderEvalResult(evalResult)}
        ${!evalResult.gibberish && state.fadedGenerated ? `
          <div style="margin-top:1.5rem">
            <div class="practice-panels-header">📄 AI-Generated Lesson Plan</div>
            <div class="response-body" style="margin-top:0">${escHtml(state.fadedGenerated)}</div>
          </div>` : ''}
        <div class="regen-notice" style="margin-top:1.5rem">
          🔄 <strong>Want to improve your score?</strong> Edit any field above and click "Resubmit for Feedback" to see how changes affect the evaluation.
        </div>
        <button class="btn-generate" style="margin-top:1rem;background:var(--text-secondary)" onclick="submitFaded()">
          Resubmit for Feedback →
        </button>
      </div>` : ''}`;
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

function updateFaded(key, value) {
  state.fadedValues[key] = value;
  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  const assembled = assembleFadedPrompt(step);

  const previewEl = document.getElementById('faded-preview');
  if (previewEl) {
    previewEl.textContent = assembled || 'Fill in the fields above to see your prompt take shape…';
    previewEl.className = `full-prompt-preview ${assembled ? '' : 'empty'}`;
  }

  const btn = document.getElementById('faded-btn');
  if (btn) btn.disabled = !assembled;
}

async function submitFaded() {
  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  if (!step) return;

  const prompt = assembleFadedPrompt(step);
  if (!prompt.trim()) return;

  // Extract only user-typed completions (not pre-filled prefixes) for gibberish check
  const typedValues = step.fields
    .map(f => (state.fadedValues[f.key] || '').trim())
    .filter(Boolean);
  const userTypedParts = typedValues.join('\n');

  // Client-side pre-check: catch obviously trivial inputs instantly
  const isObviouslyTrivial = typedValues.some(v => {
    if (v.length <= 2) return true;                         // single char or 2-char
    if (/^\d+$/.test(v)) return true;                      // only digits
    if (/^(.)\1+$/.test(v)) return true;                   // repeated single char e.g. "aaa"
    if (v.split(/\s+/).length < 3 && /^[a-zA-Z0-9]+$/.test(v)) return true; // 1-2 plain words
    return false;
  });

  if (isObviouslyTrivial) {
    state.fadedEval = {
      gibberish: true, total: 0,
      scores: { procedural: 0, conceptual: 0, iteration: 0, literacy: 0 },
      feedback: { procedural: '', conceptual: '', iteration: '', literacy: '' },
      overall: 'Your input does not look like a teaching prompt. Please write a real prompt for the given scenario.'
    };
    state.fadedGenerated = '';
    document.getElementById('app-main').innerHTML = renderStep();
    return;
  }

  const btn = document.getElementById('faded-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `Evaluating… <span class="loading-dots"><span></span><span></span><span></span></span>`;
  }

  try {
    state.fadedEval = await API.evaluate(prompt, userTypedParts || null);
  } catch (err) {
    state.fadedEval = {
      error: true, total: 0,
      scores: { goal: 0, context: 0, task: 0, constraints: 0, output: 0 },
      feedback: { goal: err.message, context: '', task: '', constraints: '', output: '' },
      overall: 'Could not evaluate. Please check your connection.'
    };
  }

  // Only generate AI output if not gibberish
  if (!state.fadedEval.gibberish) {
    if (btn) {
      btn.innerHTML = `Generating… <span class="loading-dots"><span></span><span></span><span></span></span>`;
    }
    try {
      state.fadedGenerated = await API.generate(prompt, step.systemPrompt);
    } catch (err) {
      state.fadedGenerated = `Error generating output: ${err.message}`;
    }
  } else {
    state.fadedGenerated = '';
  }

  document.getElementById('app-main').innerHTML = renderStep();
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

  return `
    <div class="content-card">
      <div class="scenario-box">
        <div class="scenario-box-label">Your Scenario</div>
        <p>${escHtml(step.scenario)}</p>
      </div>
      <div class="callout info" style="margin-top:1rem">
        <div class="callout-icon">✏️</div>
        <div class="callout-body">Write a complete prompt using all 5 parts of the framework. Tip prompts are provided but the fields are blank — this is your prompt to write.</div>
      </div>
      <div class="practice-form">${fields}</div>
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
  // Toggle the submit button — never re-render on input (avoids focus loss)
  const btn = document.getElementById('fp-btn');
  if (btn) {
    btn.disabled = !Object.values(state.fullPracticeValues).some(v => v.trim());
  }
}

async function submitFullPractice() {
  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  if (!step) return;

  const v = state.fullPracticeValues;
  const promptParts = [v.goal, v.context, v.task, v.constraints, v.output].filter(p => p?.trim());
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
    if (evalResult.gibberish) {
      state.fullPracticeGenerated = '';
    } else {
      state.fullPracticeGenerated = await API.generate(prompt, step.systemPrompt);
    }
  } catch (err) {
    state.fullPracticeEval = {
      error: true, total: 0,
      scores: { goal: 0, context: 0, task: 0, constraints: 0, output: 0 },
      feedback: { goal: err.message, context: '', task: '', constraints: '', output: '' },
      overall: 'Could not evaluate. Please check your connection.'
    };
    state.fullPracticeGenerated = 'Could not generate. Please check your connection.';
  }
  document.getElementById('app-main').innerHTML = renderStep();
}

/* ── SELF-REFLECTION ────────────────────────────────────── */
function renderSelfReflection(step) {
  if (!state.reflectionAnswers) state.reflectionAnswers = {};

  const questions = step.questions.map((q, qi) => {
    const ans = state.reflectionAnswers[qi] || { selected: [], other: '' };
    const options = q.options.map((opt, oi) => {
      const isSelected = ans.selected.includes(oi);
      return `<button class="multiselect-option ${isSelected ? 'selected' : ''}"
        onclick="toggleReflectionOption(${qi}, ${oi})">${escHtml(opt)}</button>`;
    }).join('');

    return `
      <div class="reflection-multiselect-q">
        <div class="reflection-q-num">${q.num}</div>
        <div class="reflection-q-text">${escHtml(q.question)}</div>
        <div class="multiselect-options">${options}</div>
        <div class="other-input-wrap">
          <label class="other-label">Other:</label>
          <textarea class="other-textarea" placeholder="Write your own reflection here…"
            oninput="saveReflectionOther(${qi}, this.value)">${escHtml(ans.other || '')}</textarea>
        </div>
      </div>`;
  }).join('');

  // Seed reflection edit values from full practice on first visit — never writes back
  if (!state.reflectionEditValues) {
    state.reflectionEditValues = { ...state.fullPracticeValues };
  }

  // Right panel: editable prompt + regenerate + output
  const v = state.reflectionEditValues;
  const rightFields = [
    { key: 'goal', label: 'Goal', type: 'goal' },
    { key: 'context', label: 'Context', type: 'context' },
    { key: 'task', label: 'Task', type: 'task' },
    { key: 'constraints', label: 'Constraints', type: 'constraint' },
    { key: 'output', label: 'Output Format', type: 'output' }
  ].map(f => `
    <div class="right-field">
      <div class="right-field-label">
        <span class="legend-pill ${f.type}" style="font-size:0.75rem;padding:0.2rem 0.5rem">${f.label}</span>
      </div>
      <textarea class="compact-textarea" rows="2"
        oninput="updateReflectionField('${f.key}', this.value)">${escHtml(v[f.key] || '')}</textarea>
    </div>`).join('');

  const generated = state.fullPracticeGenerated;

  return `
    <p class="reflection-intro">${step.intro}</p>
    <div class="reflection-split">
      <div class="reflection-left">
        <div class="reflection-panel-header">💭 Reflect</div>
        <div class="callout info" style="margin-bottom:1rem">
          <div class="callout-icon">☑</div>
          <div class="callout-body">Select all that apply — you can choose multiple options for each question.</div>
        </div>
        ${questions}
      </div>

      <div class="reflection-right">
        <div class="reflection-panel-header">🔄 Refine Your Prompt</div>
        <div class="callout warning" style="margin-bottom:1rem">
          <div class="callout-icon">💡</div>
          <div class="callout-body"><strong>Try it!</strong> Edit any part of your prompt below and click Regenerate to see how the output changes.</div>
        </div>
        ${rightFields}
        <button class="btn-generate" id="reflect-regen-btn" style="margin-top:1rem;width:100%" onclick="regenReflection()">
          🔄 Regenerate Output
        </button>
        ${state.reflectionGibberish ? `
          <div class="eval-result" style="margin-top:1.25rem">
            <div class="callout" style="border-left-color:var(--danger);background:#fff5f5">
              <div class="callout-icon">⚠️</div>
              <div class="callout-body">
                <strong>Input not recognised as a teaching prompt.</strong> Your prompt appears to be gibberish or too short — it has been given a score of 0/15.
                Please revise your prompt above and click Regenerate Output again.
              </div>
            </div>
          </div>` : generated ? `
          <div class="response-area" style="margin-top:1.25rem;display:block">
            <div class="response-header">📄 AI-Generated Lesson Plan</div>
            <div class="response-body" id="reflect-output">${escHtml(generated)}</div>
          </div>` : `
          <div class="callout info" style="margin-top:1.25rem">
            <div class="callout-icon">📄</div>
            <div class="callout-body">Complete the Full Prompt Practice step first to see your generated lesson plan here.</div>
          </div>`}
      </div>
    </div>`;
}

function toggleReflectionOption(qi, oi) {
  if (!state.reflectionAnswers[qi]) {
    state.reflectionAnswers[qi] = { selected: [], other: '' };
  }
  const sel = state.reflectionAnswers[qi].selected;
  const idx = sel.indexOf(oi);
  if (idx === -1) sel.push(oi);
  else sel.splice(idx, 1);
  document.getElementById('app-main').innerHTML = renderStep();
}

function updateReflectionField(key, value) {
  if (!state.reflectionEditValues) state.reflectionEditValues = {};
  state.reflectionEditValues[key] = value;
  // No re-render — just save to state (avoids focus loss)
}

function saveReflectionOther(qi, value) {
  if (!state.reflectionAnswers[qi]) {
    state.reflectionAnswers[qi] = { selected: [], other: '' };
  }
  state.reflectionAnswers[qi].other = value;
}

async function regenReflection() {
  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  if (!step) return;

  const v = state.reflectionEditValues || state.fullPracticeValues;
  const typedValues = [v.goal, v.context, v.task, v.constraints, v.output].map(s => (s || '').trim()).filter(Boolean);
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
  if (btn) { btn.disabled = true; btn.innerHTML = `Checking… <span class="loading-dots"><span></span><span></span><span></span></span>`; }

  let evalResult;
  try {
    evalResult = await API.evaluate(prompt);
    state.fullPracticeEval = evalResult;
  } catch (_) {
    if (btn) { btn.disabled = false; btn.textContent = '🔄 Regenerate Output'; }
    return;
  }

  if (evalResult.gibberish) {
    state.reflectionGibberish = true;
    document.getElementById('app-main').innerHTML = renderStep();
    return;
  }

  // Clear any previous gibberish warning and regenerate
  state.reflectionGibberish = false;
  if (btn) { btn.innerHTML = `Regenerating… <span class="loading-dots"><span></span><span></span><span></span></span>`; }

  try {
    state.fullPracticeGenerated = await API.generate(prompt, step.systemPrompt);
  } catch (err) {
    state.fullPracticeGenerated = `Error generating output: ${err.message}`;
  }
  document.getElementById('app-main').innerHTML = renderStep();
}

/* ── POST-TEST ──────────────────────────────────────────── */
function renderPosttest(step) {
  const evalResult = state.posttestEval;
  const preEval = state.pretestEval;

  let evalHtml = '';
  if (evalResult) {
    evalHtml = renderEvalResult(evalResult);

    // Score comparison
    if (preEval) {
      const preScore = preEval.total || 0;
      const postScore = evalResult.total || 0;
      const diff = postScore - preScore;
      const diffText = diff > 0 ? `+${diff}` : `${diff}`;
      const diffColor = diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--danger)' : 'var(--text-secondary)';

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
            <div class="score-compare-item">
              <div class="score-compare-label">Post-Test</div>
              <div class="score-compare-bar-wrap">
                <div class="score-compare-bar post" style="width:${(postScore / 15) * 100}%"></div>
              </div>
              <div class="score-compare-num">${postScore}/15</div>
            </div>
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
          <strong>Module complete!</strong> You now have the skills to write structured prompts that generate classroom-ready, culturally appropriate lesson materials. Click <strong>Complete Module →</strong> to finish.
        </div>
      </div>`;
  }

  return `
    <div class="content-card">
      <div class="test-badge posttest-badge">Post-Test · 5 min</div>
      <p style="margin-bottom:1rem">${escHtml(step.instruction)}</p>
      <div class="scenario-box">
        <div class="scenario-box-label">Scenario</div>
        <p>${escHtml(step.scenario)}</p>
      </div>
      <div class="scenario-box" style="margin-top:0.75rem;border-left-color:var(--warning)">
        <div class="scenario-box-label" style="color:var(--warning)">Source Text</div>
        <p style="font-style:italic">${escHtml(step.sourceText)}</p>
      </div>
      <div style="margin-top:1.5rem">
        <div class="playground-section-label">✏️ Your Prompt</div>
        <textarea class="prompt-textarea" id="posttest-input"
          placeholder="${escAttr(step.placeholder)}"
          ${evalResult ? 'readonly' : ''}>${escHtml(state.posttestPrompt)}</textarea>
      </div>
      ${!evalResult ? `
        <button class="btn-generate" id="posttest-btn" style="margin-top:1rem" onclick="submitPosttest()">
          Submit for Evaluation →
        </button>` : ''}
      ${evalHtml}
    </div>`;
}

async function submitPosttest() {
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
    state.posttestEval = await API.evaluate(prompt);
  } catch (err) {
    state.posttestEval = {
      error: true, total: 0,
      scores: { goal: 0, context: 0, task: 0, constraints: 0, output: 0 },
      feedback: { goal: err.message, context: '', task: '', constraints: '', output: '' },
      overall: 'Could not evaluate. Please check your connection.'
    };
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
        <p>${isLastMod
      ? 'Congratulations — you have completed PromptCraft. You now have the skills to write structured prompts that generate high-quality, culturally appropriate lesson materials for your multilingual classroom.'
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
  state.quizChecked = true;
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
  const prompt = buildPromptPreview();
  if (!prompt.trim()) return;
  const responseArea = document.getElementById('builder-response-area');
  const responseBody = document.getElementById('builder-response-body');
  if (!responseArea || !responseBody) return;
  responseArea.style.display = '';
  responseBody.className = 'response-body loading';
  responseBody.innerHTML = `Generating… <span class="loading-dots"><span></span><span></span><span></span></span>`;
  try {
    const result = await API.generate(prompt, 'You are an expert EFL/ESL curriculum designer. Create detailed, practical, classroom-ready teaching materials. Follow the format and requirements specified in the prompt.');
    responseBody.className = 'response-body';
    responseBody.textContent = result;
  } catch (err) {
    responseBody.className = 'response-body error';
    responseBody.textContent = `Error: ${err.message}`;
  }
}

/* ── Playground handlers ────────────────────────────────── */
async function sendPlaygroundPrompt() {
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
    const result = await API.generate(prompt, step?.systemPrompt || '');
    state[`playground_response_${state.moduleId}_${state.stepIndex}`] = result;
    responseBody.className = 'response-body';
    responseBody.textContent = result;
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
    const result = await API.generate(prompt, step?.systemPrompt || '');
    state.transferResponse = result;
    responseBody.className = 'response-body';
    responseBody.textContent = result;
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
document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  render();
});
