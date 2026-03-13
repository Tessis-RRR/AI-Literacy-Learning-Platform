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
  }
};
