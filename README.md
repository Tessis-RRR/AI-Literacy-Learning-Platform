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
    ├─ Score ≥ 8/12 ──► [Skip intro, optional review link] ──► Worked Example
    │
    └─ Score < 8/12 ──► 5-Part Framework Intro (2–5 min)
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
| Pre-Test | `pretest` | Write one prompt for a scenario; AI scores it 1–12 against the rubric; ≥8 skips intro |
| Framework Intro | `info` | The 5-part prompt framework (Goal, Context, Task, Constraints, Output Format); skippable |
| Worked Example | `annotated` | Grade 8 ESL, past simple — full prompt in 5 color-coded annotated blocks with explanations |
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

All prompts (pre-test, faded example, full practice, post-test) are scored by AI against a 4-dimension rubric (max 12 points):

| Dimension | Novice (1) | Developing (2) | Proficient (3) |
|-----------|-----------|----------------|----------------|
| Procedural Formulation | Vague; no level/dialect specified | Names audience; lacks format constraints | Explicit level, dialect, lesson structure, format |
| Conceptual Engagement | Final artifact only | Basic supports (glossary) | Diagnostic use — analyze language, scaffold, analogies |
| Assessment & Iteration | No negative constraints | Generic correction instructions | Negative constraints to prevent formal/clinical defaults |
| Reflective AI Literacy | Assumes AI is neutral | Some hedging | Explicitly counters dominant-norm bias |

**Branching threshold:** Pre-test score ≥ 8/12 → skip Framework Intro (with optional review link)

---

## Scenarios Used

| Step | Grade | Topic | Languages |
|------|-------|-------|-----------|
| Pre-Test | Grade 7, B1, 24 students | Daily routines — present simple | English + Spanish |
| Worked Example | Grade 8, B1, 28 students | Past simple tense | English + Spanish vocabulary list |
| Faded Example | Grade 7, A2–B1, 25 students | Daily routines vocabulary | English + conversational Mexican Spanish |
| Full Practice | Grade 6, A2, 22 students | Speaking — "talking about your weekend" | English + Mandarin |
| Post-Test | Grade 7, B1, 25 students | Health & wellness (energy drinks source text) | English + Spanish + Mandarin |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS, HTML5, CSS3 (no framework) |
| Backend | Node.js + Express |
| AI | OpenAI GPT-4o via `/api/generate` and `/api/evaluate` |
| Styling | Custom CSS design system with CSS variables |
| Storage | `localStorage` for session progress |

### API endpoints

- `POST /api/generate` — generates lesson plan content from a prompt
- `POST /api/evaluate` — scores a prompt against the 4-dimension rubric; returns JSON with dimension scores, feedback, and overall summary

---

## Project Structure

```
/
├── server.js              # Express server + OpenAI API endpoints
├── package.json
├── .env                   # OPENAI_API_KEY (not committed)
├── Teaching Plan Draft.md # Full teaching plan specification
└── public/
    ├── index.html         # Single HTML shell
    ├── js/
    │   ├── data.js        # All module content and step definitions
    │   ├── app.js         # App state, rendering, event handlers
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

2. **Configure API key** — create a `.env` file:
   ```
   OPENAI_API_KEY=your_key_here
   ```

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

- **One page per section** — each step fits within one screen height; no scrolling required
- **Back-and-forth editing** — faded example, full practice, and reflection all allow editing and resubmitting to see how prompt changes affect scores and output
- **Branching with transparency** — learners who skip the intro are told what they skipped and can review it at any time
- **Split-screen reflection** — questions on the left; editable prompt + live AI output on the right
- **Parallel API calls** — full practice runs `evaluate` and `generate` simultaneously for faster feedback
