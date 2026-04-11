const getSessionId = () => {
  let sid = sessionStorage.getItem('promptcraft_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem('promptcraft_session_id', sid);
  }
  return sid;
};

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

  async logEvent(event, data) {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data, sessionId: getSessionId() })
      });
    } catch (_) {
      // Ignore logging failures silently so they don't block user experience
    }
  }
};
