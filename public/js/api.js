/* ============================================================
   PromptCraft — API layer
   ============================================================ */

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
  }
};
