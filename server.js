require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, systemPrompt } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'API key not configured. Please add your OPENAI_API_KEY to the .env file.'
      });
    }

    const message = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful AI assistant for language teachers. Provide clear, practical, classroom-ready responses.' },
        { role: 'user', content: prompt }
      ]
    });

    res.json({ content: message.choices[0].message.content });
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/evaluate', async (req, res) => {
  try {
    const { prompt, userTypedParts } = req.body;
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'API key not configured.' });
    }
    const sysPrompt = `You evaluate AI prompts written by language teachers. Return ONLY valid JSON with no markdown or extra text.

STEP 1 — GIBBERISH CHECK (do this first):
When evaluating LEARNER-TYPED parts specifically, flag as gibberish if ANY of the following apply:
- A single character, digit, or number (e.g. "1", "a", "123")
- Random letters or keyboard mashing (e.g. "asdf", "qwerty", "zzz")
- A word or phrase completely unrelated to teaching, language learning, or the scenario (e.g. "pizza", "hello", "idk")
- Fewer than 4 meaningful words that form no coherent teaching intent
- Repeating the same character or word (e.g. "aaa", "test test test")
- Anything that is clearly not a genuine attempt to complete a teaching prompt

IMPORTANT: The learner is completing sentence starters. Even if the full assembled sentence looks grammatical, evaluate ONLY whether the learner's typed completion is a genuine, meaningful teaching-related response — not just any word that fits grammatically.

If gibberish is detected, return ONLY this and nothing else:
{"gibberish":true,"scores":{"procedural":0,"conceptual":0,"iteration":0,"literacy":0},"total":0,"feedback":{"procedural":"","conceptual":"","iteration":"","literacy":""},"overall":"Your input does not look like a teaching prompt. Please write a real prompt for the given scenario."}

STEP 2 — If it is a genuine attempt (even a weak one), score each of the 4 dimensions 1–3:

DIMENSION 1 — Procedural Formulation:
1: Vague; missing grade level, proficiency level, or dialect/language details.
2: Names audience but lacks strict formatting constraints or specific benchmarks.
3: Explicitly states proficiency level, regional dialect (e.g. Mexican Spanish, Taiwanese Mandarin), lesson structure, and output format requirements.

DIMENSION 2 — Conceptual Engagement:
1: Only asks AI to generate a final artifact with no conceptual planning.
2: Asks for basic supports (e.g. a simple glossary) but no deeper instructional planning.
3: Uses AI diagnostically — asks it to analyze language difficulty, scaffold ideas, or generate relatable age-appropriate analogies.

DIMENSION 3 — Assessment & Iteration:
1: No negative constraints or awareness of AI limitations or potential errors.
2: Generic correction instructions only (e.g. "make it simpler").
3: Uses negative constraints to prevent formal or clinical language (e.g. "do not use academic register", "avoid literal clinical translations").

DIMENSION 4 — Reflective AI Literacy:
1: Assumes AI is culturally neutral and inherently understands student context.
2: Some hedging but no explicit strategy to counter AI bias.
3: Explicitly specifies regional dialect, conversational register, or code-switching permissions to counter AI's dominant-norm bias.

Return ONLY this JSON structure:
{"scores":{"procedural":1,"conceptual":1,"iteration":1,"literacy":1},"total":4,"feedback":{"procedural":"specific feedback","conceptual":"specific feedback","iteration":"specific feedback","literacy":"specific feedback"},"overall":"1-2 sentence summary"}`;

    const message = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 700,
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: userTypedParts
            ? `Full prompt to evaluate:\n${prompt}\n\nIMPORTANT — The following parts were typed by the learner (the rest was pre-filled). Apply the gibberish check to these parts specifically:\n${userTypedParts}`
            : `Evaluate this teacher prompt:\n\n${prompt}` }
      ]
    });
    const raw = message.choices[0].message.content.trim();
    const result = JSON.parse(raw);
    res.json(result);
  } catch (error) {
    console.error('Evaluate error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\nPromptCraft is running at http://localhost:${PORT}\n`);
});
