/* ============================================================
   PromptCraft — App logic & rendering
   ============================================================ */

/* ── State ──────────────────────────────────────────────── */
const state = {
  view: 'dashboard',   // 'dashboard' | 'step'
  moduleId: null,
  stepIndex: 0,
  progress: {},        // { moduleId: { stepsVisited: Set, completed: bool } }
  quizAnswers: {},     // { questionIndex: selectedOption }
  quizChecked: false,
  builderValues: {},   // { fieldKey: value }
  reflectionValues: {},// { stepIndex_qIndex: text }
  transferPrompt: '',
  transferResponse: '',
  transferReflection: ''
};

/* ── Progress persistence ───────────────────────────────── */
function loadProgress() {
  try {
    const saved = localStorage.getItem('promptcraft_progress');
    if (saved) {
      const p = JSON.parse(saved);
      // Re-hydrate Sets
      Object.keys(p).forEach(k => {
        p[k].stepsVisited = new Set(p[k].stepsVisited || []);
      });
      state.progress = p;
    }
  } catch (_) {}
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
  } catch (_) {}
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
  if (state.stepIndex < mod.steps_data.length - 1) {
    navigateStep(state.moduleId, state.stepIndex + 1);
  } else {
    // Last step — mark complete and show completion screen
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

/* ── Root render ────────────────────────────────────────── */
function render() {
  renderHeader();
  const main = document.getElementById('app-main');
  switch (state.view) {
    case 'dashboard': main.innerHTML = renderDashboard(); break;
    case 'step':      main.innerHTML = renderStep();      attachStepListeners(); break;
    case 'complete':  main.innerHTML = renderComplete();  break;
    default:          main.innerHTML = renderDashboard();
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
        <div class="landing-hero-badge">✦ AI Literacy for Teachers</div>
        <h1>Welcome to <span>PromptCraft</span></h1>
        <p>Learn to write structured AI prompts that generate lesson plans, speaking activities, and reading materials — reliably and efficiently.</p>
        <div class="landing-stats">
          <div class="landing-stat">
            <span class="landing-stat-value">4</span>
            <span class="landing-stat-label">Modules</span>
          </div>
          <div class="landing-stat">
            <span class="landing-stat-value">60–80</span>
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
        </div>
        ${allDone
          ? `<div class="callout success" style="text-align:left;max-width:460px;margin:0 auto;"><div class="callout-icon">🎉</div><div class="callout-body"><strong>Course complete!</strong> You have finished all four modules. Go back and revisit any module anytime.</div></div>`
          : `<button class="btn-start" onclick="startCourse()">${totalProgress() > 0 ? 'Continue Learning' : 'Start Learning →'}</button>`
        }
      </div>

      <div class="modules-section">
        <h2>Course Modules</h2>
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
  const prevCompleted = idx === 0 || state.progress[MODULES[idx - 1].id]?.completed;
  const locked = !prevCompleted;

  let statusLabel, statusClass;
  if (completed)     { statusLabel = '✓ Complete';    statusClass = 'status-completed';   }
  else if (visited)  { statusLabel = '→ In Progress'; statusClass = 'status-in-progress'; }
  else               { statusLabel = locked ? '🔒 Locked' : 'Not Started'; statusClass = 'status-not-started'; }

  const clickHandler = locked ? '' : `onclick="navigateStep(${mod.id}, 0)"`;

  return `
    <div class="module-card ${completed ? 'completed' : ''} ${locked ? 'locked' : ''} fade-in fade-in-delay-${idx}" ${clickHandler}>
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
  // Find first incomplete module
  for (const mod of MODULES) {
    if (!state.progress[mod.id]?.completed) {
      const visited = state.progress[mod.id]?.stepsVisited;
      const nextStep = visited ? visited.size : 0;
      navigateStep(mod.id, Math.min(nextStep, mod.steps_data.length - 1));
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
  const isLast  = state.stepIndex === mod.steps_data.length - 1;

  const dots = mod.steps_data.map((_, i) => {
    const cls = i === state.stepIndex ? 'active'
              : (state.progress[mod.id]?.stepsVisited?.has(i) ? 'done' : '');
    return `<div class="step-dot ${cls}"></div>`;
  }).join('');

  let content = '';
  switch (step.type) {
    case 'info':        content = renderInfo(step);       break;
    case 'comparison':  content = renderComparison(step); break;
    case 'annotated':   content = renderAnnotated(step);  break;
    case 'quiz':        content = renderQuiz(step);       break;
    case 'builder':     content = renderBuilder(step);    break;
    case 'playground':  content = renderPlayground(step); break;
    case 'reflection':  content = renderReflection(step); break;
    case 'transfer':    content = renderTransfer(step);   break;
    default:            content = `<div class="content-card"><p>Step type not found.</p></div>`;
  }

  return `
    <div class="step-view fade-in">
      <div class="step-header">
        <div class="step-breadcrumb">
          <span>Module ${mod.id}</span> › <span>${mod.title}</span>
        </div>
        <div class="step-title">${step.title}</div>
        <div class="step-dots">${dots}</div>
      </div>

      ${content}

      <div class="step-nav">
        <button class="btn-nav" onclick="prevStep()" ${isFirst ? 'disabled' : ''}>← Previous</button>
        <span class="step-counter">Step ${state.stepIndex + 1} of ${mod.steps_data.length}</span>
        <button class="btn-nav primary" onclick="nextStep()">${isLast ? 'Complete Module →' : 'Next →'}</button>
      </div>
    </div>`;
}

/* ── Step renderers ─────────────────────────────────────── */

function renderInfo(step) {
  return `<div class="content-card">${step.content}</div>`;
}

function renderComparison(step) {
  const rows = step.analysis.map(r => `
    <div class="analysis-row">
      <div class="ar-icon">${r.icon}</div>
      <div class="ar-text"><strong>${r.label}:</strong> ${r.desc}</div>
    </div>`).join('');

  return `
    <div class="content-card">
      <p>Read both prompts carefully. Both are asking for the same thing — a lesson plan. But the quality of the AI output will be very different. Can you spot why?</p>
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

function renderAnnotated(step) {
  const legend = `
    <div class="framework-legend">
      <div class="legend-pill goal">Goal</div>
      <div class="legend-pill context">Context</div>
      <div class="legend-pill task">Task</div>
      <div class="legend-pill constraint">Constraints</div>
      <div class="legend-pill output">Output Format</div>
    </div>`;

  const blocks = step.components.map(c => `
    <div class="annotation-block ${c.type}">
      <div class="annotation-header">${componentIcon(c.type)} ${c.label}</div>
      <div class="annotation-text">${escHtml(c.text)}</div>
      <div class="annotation-explain">
        <div class="ae-icon">💬</div>
        <div class="ae-text">${c.explanation}</div>
      </div>
    </div>`).join('');

  const fullText = step.components.map(c => c.text).join('\n\n');

  return `
    <div class="content-card">
      <p><strong>Scenario:</strong> ${step.scenario}</p>
      <p>Each coloured block below shows one part of the 5-part framework. Read the text, then the explanation of <em>why</em> it was written that way.</p>
      ${legend}
      <div class="annotated-prompt">${blocks}</div>
      <div style="margin-top:1.5rem">
        <div class="builder-preview-label">📋 Full prompt (as sent to AI)</div>
        <div class="full-prompt-preview">${escHtml(fullText)}</div>
      </div>
    </div>`;
}

function componentIcon(type) {
  return { goal: '🎯', context: '👥', task: '📋', constraint: '🔒', output: '📄' }[type] || '•';
}

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
             <div class="callout-body">You have reviewed all answers. Move on to the next step when ready.</div>
           </div>`}
    </div>`;
}

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
        ? `<button class="btn-generate" style="margin-top:1rem" onclick="sendBuilderPrompt()">
             ✦ Send to AI
           </button>
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
  if (v.context)    parts.push(v.context.trim());
  if (v.goal)       parts.push(v.goal.trim());
  if (v.task)       parts.push(v.task.trim());
  if (v.constraint) parts.push(v.constraint.trim());
  if (v.output)     parts.push(v.output.trim());
  return parts.filter(Boolean).join('\n\n');
}

function renderPlayground(step) {
  const s = step.scenario;
  const savedResponse = state[`playground_response_${state.moduleId}_${state.stepIndex}`] || '';
  const savedPrompt   = state[`playground_prompt_${state.moduleId}_${state.stepIndex}`] || '';

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
        <button class="btn-generate" id="playground-btn" onclick="sendPlaygroundPrompt()">
          ✦ Generate Response
        </button>
        <div class="response-area" id="playground-response-area" ${savedResponse ? '' : 'style="display:none"'}>
          <div class="response-header">🤖 AI Response</div>
          <div class="response-body" id="playground-response-body">${savedResponse}</div>
        </div>
      </div>
    </div>`;
}

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
        <div class="callout-body">Your answers are saved locally as you type. There are no right or wrong answers — be honest and specific.</div>
      </div>
    </div>
    <div class="reflection-questions">${qs}</div>`;
}

function renderTransfer(step) {
  const scenarioCards = step.challenge.scenarios.map(s => `
    <div class="callout info" style="margin-bottom:0.5rem">
      <div class="callout-icon">${s.icon}</div>
      <div class="callout-body"><strong>${s.label}:</strong> ${s.desc}</div>
    </div>`).join('');

  const refKey = `transfer_reflection`;
  const savedRef = state.reflectionValues[refKey] || '';

  return `
    <div class="content-card">
      <p>${step.intro}</p>
    </div>

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
        <button class="btn-generate" id="transfer-btn" onclick="sendTransferPrompt()">
          ✦ Send to AI
        </button>
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

/* ── Module complete ────────────────────────────────────── */
function renderComplete() {
  const mod = MODULES.find(m => m.id === state.moduleId);
  const nextMod = MODULES.find(m => m.id === state.moduleId + 1);
  const isLastMod = !nextMod;

  return `
    <div class="step-view fade-in">
      <div class="module-complete">
        <div class="complete-icon">${isLastMod ? '🏆' : '🎉'}</div>
        <h2>${isLastMod ? 'Course Complete!' : `Module ${state.moduleId} Complete!`}</h2>
        <p>${isLastMod
          ? 'Congratulations — you have completed all four modules of PromptCraft. You now have the skills to write structured prompts that generate high-quality teaching materials.'
          : `Great work! You have finished "${mod?.title}". You are ready to continue to the next module.`
        }</p>
        ${isLastMod
          ? `<button class="btn-back-dashboard" onclick="navigateDashboard()">← Back to Dashboard</button>`
          : `<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
               <button class="btn-back-dashboard" onclick="navigateDashboard()">← Back to Dashboard</button>
               <button class="btn-start" onclick="navigateStep(${nextMod.id}, 0)">Start ${nextMod.title} →</button>
             </div>`
        }
      </div>
      ${!isLastMod ? '' : `
        <div class="content-card">
          <h2>What you have learned</h2>
          <ul>
            <li><strong>Module 1:</strong> Why prompts matter and the 5-part framework (Goal, Context, Task, Constraints, Output Format)</li>
            <li><strong>Module 2:</strong> How to learn from expert prompt examples and build structured prompts</li>
            <li><strong>Module 3:</strong> How to apply the framework in real teaching contexts — lesson plans, speaking activities, and reading tasks</li>
            <li><strong>Module 4:</strong> How to reflect on prompt choices and transfer the skill beyond teaching</li>
          </ul>
          <div class="callout success">
            <div class="callout-icon">🚀</div>
            <div class="callout-body">
              <strong>Keep practising</strong>
              The more you use structured prompts in your daily teaching preparation, the more natural it becomes. Return to the Prompt Playground in Module 3 anytime you need to generate new materials.
            </div>
          </div>
        </div>`}
    </div>`;
}

/* ── Event listeners (attached after render) ────────────── */
function attachStepListeners() {
  // Nothing extra needed — handlers are inline for simplicity
}

/* ── Quiz handlers ──────────────────────────────────────── */
function selectQuizAnswer(qi, oi) {
  if (state.quizChecked) return;
  state.quizAnswers[qi] = oi;
  // Re-render the step in place
  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod.steps_data[state.stepIndex];
  const main = document.getElementById('app-main');
  main.innerHTML = renderStep();
}

function checkAnswers() {
  state.quizChecked = true;
  const main = document.getElementById('app-main');
  main.innerHTML = renderStep();
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
  // Show/hide the send button by re-rendering the card bottom part
  // (simple approach: re-render the full step)
  const main = document.getElementById('app-main');
  main.innerHTML = renderStep();
  // Restore focus to active textarea
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

  // Save the typed prompt
  state[`playground_prompt_${state.moduleId}_${state.stepIndex}`] = prompt;

  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  const systemPrompt = step?.systemPrompt || '';

  btn.disabled = true;
  btn.textContent = 'Generating…';
  responseArea.style.display = '';
  responseBody.className = 'response-body loading';
  responseBody.innerHTML = `Generating your materials… <span class="loading-dots"><span></span><span></span><span></span></span>`;

  try {
    const result = await API.generate(prompt, systemPrompt);
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
  if (!input || !responseArea || !responseBody) return;

  const prompt = input.value.trim();
  if (!prompt) return;

  state.transferPrompt = prompt;

  const mod = MODULES.find(m => m.id === state.moduleId);
  const step = mod?.steps_data[state.stepIndex];
  const systemPrompt = step?.systemPrompt || '';

  btn.disabled = true;
  btn.textContent = 'Generating…';
  responseArea.style.display = '';
  responseBody.className = 'response-body loading';
  responseBody.innerHTML = `Generating… <span class="loading-dots"><span></span><span></span><span></span></span>`;

  try {
    const result = await API.generate(prompt, systemPrompt);
    state.transferResponse = result;
    responseBody.className = 'response-body';
    responseBody.textContent = result;
    // Re-render to show reflection question
    const main = document.getElementById('app-main');
    main.innerHTML = renderStep();
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
function escAttr(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/\n/g, '&#10;');
}

/* ── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  render();
});
