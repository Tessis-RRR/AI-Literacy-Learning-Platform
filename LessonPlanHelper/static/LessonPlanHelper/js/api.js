/* Session ID — persists in localStorage across tab closes */
const getSessionId = () => {
  let sid = localStorage.getItem('promptcraft_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 11)
                  + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('promptcraft_session_id', sid);
  }
  return sid;
};

/* Participant ID — set externally (e.g. name entry screen) */
const getParticipantId = () => localStorage.getItem('promptcraft_participant_id') || null;

const API = {
  async generate(prompt, systemPrompt) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemPrompt })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data.content;
  },

  async evaluate(prompt, userTypedParts = null) {
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, userTypedParts })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Evaluation failed');
    return data;
  },

  async evaluatePart(dimension, fieldText, prefix = '') {
    const res = await fetch('/api/evaluate-part', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dimension, fieldText, prefix })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Evaluation failed');
    return { feedback: data.feedback, score: data.score };
  },

  async semanticHighlights(payload) {
    const res = await fetch('/api/highlight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Semantic highlight failed');
    return { highlights: data.highlights || [] };
  },

  async logEvent(event, data) {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          data,
          sessionId:     getSessionId(),
          participantId: getParticipantId()
        })
      });
    } catch (_) {
      // Ignore logging failures — must never block the user
    }
  }
};
