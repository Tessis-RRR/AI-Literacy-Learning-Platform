/* ============================================================
   PromptCraft — Behavioural Tracker
   Tracks: time on step, button clicks, field edits.
   All events are sent fire-and-forget via API.logEvent.
   ============================================================ */

const Tracker = (() => {
  let _stepStart = null;
  let _stepMeta  = null;
  const _clicks  = {};
  const _edited  = new Set();

  /* ── Step timing ─────────────────────────────────────────── */

  function startStep(moduleId, stepIndex, stepType) {
    _stepStart = Date.now();
    _stepMeta  = { moduleId, stepIndex, stepType, enteredAt: new Date().toISOString() };
    for (const k in _clicks) delete _clicks[k];
    _edited.clear();
  }

  function endStep() {
    if (!_stepStart || !_stepMeta) return;
    const duration_seconds = Math.round((Date.now() - _stepStart) / 1000);
    API.logEvent('time_on_step', { ..._stepMeta, duration_seconds });
    _stepStart = null;
  }

  /* ── Button click tracking ───────────────────────────────── */

  function click(buttonName) {
    _clicks[buttonName] = (_clicks[buttonName] || 0) + 1;
    API.logEvent('button_click', {
      button: buttonName,
      total_clicks: _clicks[buttonName],
      ...(_stepMeta || {})
    });
  }

  /* ── Field edit tracking ─────────────────────────────────── */

  function fieldEdit(fieldName) {
    _edited.add(fieldName);
  }

  function getEditedFields() {
    return [..._edited];
  }

  /* ── Page unload — flush final step time ─────────────────── */

  window.addEventListener('beforeunload', () => endStep());

  return { startStep, endStep, click, fieldEdit, getEditedFields };
})();
