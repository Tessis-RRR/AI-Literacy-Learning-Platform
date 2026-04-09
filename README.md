# PromptCraft

An interactive web-based learning module that teaches multilingual middle school teachers how to use LLMs to create lesson plans and bilingual teaching materials.

---

## Overview

**Target audience:** Multilingual / ESL teachers (middle school level)
**Duration:** ~30 minutes
**Goal:** Teachers will be able to write structured AI prompts that generate lesson plans and bilingual teaching materials tailored to their classroom.

---

## Module Structure

The module follows a single linear flow with branching based on pre-test performance:

```
Pre-Test (2–5 min)
    │
    ├─ Score ≥ 10/15 ──► [Skip intro, optional review link] ──► Worked Example
    │
    └─ Score < 10/15 ──► 5-Part Framework Intro (2–5 min)
                                │
                                ▼
                        Worked Example (5 min)
                                │
                                ▼
                        Faded Example (5 min)
                                │
                                ▼
                      Full Prompt Practice (5–8 min)
                                │
                                ▼
                        Self-Reflection (5 min)
                                │
                                ▼
                          Post-Test (5 min)
```

### Step-by-step breakdown

| Step | Type | Description |
|------|------|-------------|
| Pre-Test | `pretest` | Write one prompt for a scenario; AI scores it 0–15 against the rubric; ≥10 skips intro |
| Framework Intro | `info` | The 5-part prompt framework (Goal, Context, Task, Constraints, Output Format); skippable |
| Worked Example | `annotated` | Grade 3, daily routines — drag-and-drop category matching; blocks update in place on correct match |
| Faded Example | `faded` | Grade 7 ESL, daily routines — pre-filled prefix sentences + blanks + tips; AI rubric feedback |
| Full Prompt Practice | `fullpractice` | Grade 6 ESL, speaking activity — blank 5-part form; AI feedback + generated lesson plan; edit & regenerate |
| Self-Reflection | `selfreflection` | Split screen — 4 multi-select reflection questions (left) + editable prompt & live output (right) |
| Post-Test | `posttest` | New scenario (health & wellness); AI scores; pre vs. post score comparison shown |

---

## The 5-Part Prompt Framework

Teachers learn to structure every AI prompt with five parts:

| Part | Purpose |
|------|---------|
| **Goal** | What students will learn or be able to do |
| **Context** | Grade, proficiency level, class size, first language backgrounds |
| **Task** | What the AI should create (type + duration) |
| **Constraints** | What to include/avoid; lesson structure; language register |
| **Output Format** | How the response should be structured (table, list, etc.) |

---

## Evaluation Rubric

All prompts (pre-test, faded example, full practice, post-test) are scored by AI against a 5-dimension rubric (**0–3 per dimension, max 15 points**).

### Scoring uses a hybrid Rule + LLM pipeline:

1. **Rule engine (JS)** — pre-detects binary signals from the prompt via regex (e.g. `has_time`, `has_proficiency`, `component_count`) before the LLM call
2. **LLM evaluator** — receives the detected features as ground truth; only interprets ambiguous cases (e.g. "is this a real constraint?") and generates feedback
3. **Tie-breaking rule** — when unsure between two scores, always choose the lower score

### Rubric dimensions

| Dimension | 0 | 1 | 2 | 3 |
|-----------|---|---|---|---|
| **Goal** | Nothing | Topic only | Learning target + topic, but vague verb OR no success criteria | Learning target + measurable action verb + topic + success criteria |
| **Context** | Nothing | Vague student mention | Grade/proficiency present, no student detail | Grade/age + proficiency + specific student detail |
| **Task** | Nothing | Vague task | Product present, missing time OR <2 components | Clear product + time/duration + ≥2 components |
| **Constraints** | Nothing | Vague preference only | 1 actionable constraint | ≥2 actionable constraints |
| **Output Format** | Nothing | General request only | Elements listed, no format type | Structure + format type + named required elements |

**Branching threshold:** Pre-test score ≥ 10/15 → skip Framework Intro (with optional review link)

### Evaluation settings

| Setting | Value |
|---------|-------|
| Model | Configurable via `EVAL_MODEL` in `.env` (default: `gpt-4o`) |
| Temperature | `0` (deterministic, consistent scoring) |
| Feedback | One overall feedback block — what's good (black) + "BUT..." improvement (bold) |

---

## Scenarios Used

| Step | Grade | Topic | Languages |
|------|-------|-------|-----------|
| Pre-Test | Grade 3, varying proficiency, 24 students | Daily routines — present simple | English + Mandarin |
| Worked Example | Grade 3, varying proficiency, 24 students | Daily routines — present simple | English + Mandarin |
| Faded Example | Grade 7, A2–B1, 25 students | Daily routines vocabulary | English + conversational Mexican Spanish |
| Full Practice | Grade 6, A2, 22 students | Speaking — "talking about your weekend" | English + Mandarin |
| Post-Test | Grade 7, B1, 25 students | Health & wellness (energy drinks source text) | English + Spanish + Mandarin |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS, HTML5, CSS3 (no framework) |
| Backend | Node.js + Express |
| AI | OpenAI API via `/api/generate` and `/api/evaluate` |
| Styling | Custom CSS design system with CSS variables |
| Storage | `localStorage` for session progress |

### API endpoints

- `POST /api/generate` — generates lesson plan content from a prompt; model set via `GENERATE_MODEL` in `.env`
- `POST /api/evaluate` — scores a prompt using the hybrid rule + LLM pipeline; returns JSON with dimension scores (0–3), bar chart data, and overall feedback

---

## Project Structure

```
/
├── server.js              # Express server + OpenAI API endpoints + rule engine
├── package.json
├── .env                   # API key and model config (not committed)
├── rule&LLMPipeline.md    # Evaluation pipeline specification
├── Teaching Plan Draft.md # Full teaching plan specification
└── public/
    ├── index.html         # Single HTML shell
    ├── js/
    │   ├── data.js        # All module content and step definitions
    │   ├── app.js         # App state, rendering, event handlers, score bar chart
    │   └── api.js         # Fetch wrappers for /api/generate and /api/evaluate
    └── css/
        └── styles.css     # Complete design system
```

---

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure `.env`**
   ```
   OPENAI_API_KEY=your_key_here
   GENERATE_MODEL=gpt-4o
   EVAL_MODEL=gpt-4o
   PORT=3000
   ```
   To use a cheaper/faster eval model, set `EVAL_MODEL=gpt-4o-mini`.

3. **Start the server**
   ```bash
   npm start
   ```
   or with auto-reload:
   ```bash
   npm run dev
   ```

4. **Open** `http://localhost:3000`

---

## Key Design Decisions

- **Hybrid evaluation pipeline** — rule engine pre-extracts deterministic signals (grade, time, component count, etc.) so the LLM only handles interpretation and feedback generation, not raw detection
- **Temperature 0 for evaluation** — ensures consistent, reproducible scores for the same prompt
- **In-place drag-and-drop** — worked example blocks update in place on correct match without re-rendering or scrolling
- **Score bar chart** — 5-column chart (red→green spectrum, 0–3 scale) gives instant visual feedback on dimension scores
- **One feedback block** — single overall feedback (what's good + bold improvement) instead of per-dimension cards, keeping feedback focused
- **Back-and-forth editing** — faded example, full practice, and reflection all allow editing and resubmitting
- **Branching with transparency** — learners who skip the intro are told what they skipped and can review it at any time
- **Parallel API calls** — full practice runs `evaluate` and `generate` simultaneously for faster feedback
