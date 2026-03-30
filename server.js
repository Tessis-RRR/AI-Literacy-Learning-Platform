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
{"gibberish":true,"scores":{"goal":0,"context":0,"task":0,"constraints":0,"output":0},"total":0,"feedback":{"goal":"","context":"","task":"","constraints":"","output":""},"overall":"Your input does not look like a teaching prompt. Please write a real prompt for the given scenario."}

STEP 2 — If it is a genuine attempt (even a weak one), score each of the 5 dimensions of the prompt framework 1–3:

DIMENSION 1 — Goal:
1: Vague or missing explicit learning goals.
2: Mentions a general topic but lacks specific communicative or linguistic outcomes.
3: Explicitly states what students will learn to do or say by the end of the lesson.

DIMENSION 2 — Context:
1: Missing grade level, proficiency level, or student background details.
2: Names basic audience demographics but lacks specific learning challenges or L1 backgrounds.
3: Explicitly states proficiency level, specific L1 backgrounds, and learning context or struggles.

DIMENSION 3 — Task:
1: Vague request (e.g., "make a lesson").
2: Asks for a specific output (e.g., "45-minute lesson plan") but lacks sub-steps or clear reasoning process.
3: Tells the AI exactly what to create, breaking the task into clear analytical or generation steps.

DIMENSION 4 — Constraints:
1: No limitations or requirements specified.
2: Provides basic pedagogical structure or generic "make it simpler" instructions.
3: Uses strict negative constraints, specifies regional dialects, language level, and explicit pedagogical rules (e.g., "Do NOT use academic register").

DIMENSION 5 — Output Format:
1: No format requested.
2: Asks for a general format like "a list" or "bullet points".
3: Explicitly defines the structure of the output (e.g., "Format as a table with columns: Time | Activity | Materials").

Return ONLY this JSON structure:
{"scores":{"goal":1,"context":1,"task":1,"constraints":1,"output":1},"total":5,"feedback":{"goal":"specific feedback","context":"specific feedback","task":"specific feedback","constraints":"specific feedback","output":"specific feedback"},"overall":"1-2 sentence summary"}`;

    const message = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 700,
      messages: [
        { role: 'system', content: sysPrompt },
        {
          role: 'user', content: userTypedParts
            ? `Full prompt to evaluate:\n${prompt}\n\nIMPORTANT — The following parts were typed by the learner (the rest was pre-filled). Apply the gibberish check to these parts specifically:\n${userTypedParts}`
            : `Evaluate this teacher prompt:\n\n${prompt}`
        }
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
