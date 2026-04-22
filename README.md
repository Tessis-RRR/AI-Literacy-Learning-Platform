# ESL Co-Pilot

An interactive web-based learning platform that empowers multilingual and ESL teachers (middle school level) to use LLMs to create evidence-based lesson plans and bilingual teaching materials tailored to their classrooms.

---

## Overview

**Target audience:** ESL teachers (middle school level)
**Platform Scope:** 6 distinct modules covering prompt design, lesson building, and student evaluation.
**Current Availability:** Module 1 ("Design in Action") is fully playable (~30 minutes).

## Platform Modules

1. **Design in Action** (Available) — Master the 5-part framework for crafting evidence-based lesson plans.
2. **Lesson Builder** (Coming Soon) — Use the actual tool to generate and refine your daily lesson plans.
3. **Worksheet Workshop** (Coming Soon) — Learn the strategies for creating effective assignment worksheets.
4. **Resource Generator** (Coming Soon) — Access the worksheet and rubric generator to build student-ready materials.
5. **Evaluation Theory** (Coming Soon) — Gain a deep understanding of assessment and evaluation techniques.
6. **Student Evaluator** (Coming Soon) — Use the evaluation tool to grade and provide feedback on students' homework.

---

## Module 1: Design in Action

This module follows a single linear flow with branching based on pre-test performance:

```text
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
| Framework Intro | `info` | The 5-part prompt framework (Desired Results, Learner & Context, Evidence of Learning, Instructional Plan, Output Requirements); skippable |
| Worked Example | `annotated` | Drag-and-drop category matching; blocks update in place on correct match |
| Faded Example | `faded` | Guided practice with pre-filled prefix sentences + blanks + tips; AI rubric feedback |
| Full Prompt Practice | `fullpractice` | Blank 5-part form; AI feedback + generated lesson plan; edit & regenerate |
| Self-Reflection | `selfreflection` | Split screen — 4 multi-select reflection questions (left) + editable prompt & live output (right) |
| Post-Test | `posttest` | New scenario; AI scores; pre vs. post score comparison shown |

---

## The 5-Part Prompt Framework

Teachers learn to structure every AI prompt with five parts:

| Part | Purpose |
|------|---------|
| **Desired Results** | What should students learn or be able to do by the end of the lesson? |
| **Learner & Context** | Who are your students, and what teaching situation should the AI know about? |
| **Evidence of Learning** | How will students show that they met the goal? |
| **Instructional Plan** | What kind of lesson flow, activities, or supports should the AI include? |
| **Output Requirements** | What exactly should the AI generate, and how should it be organized? |

---

## Evaluation Rubric

All prompts (pre-test, faded example, full practice, post-test) are scored by AI against a 5-dimension rubric (**0–3 per dimension, max 15 points**).

### Scoring uses a hybrid Rule + LLM pipeline:

1. **Rule engine (JS/Python)** — pre-detects binary signals from the prompt via regex (e.g. `has_time`, `has_proficiency`, `component_count`) before the LLM call.
2. **LLM evaluator** — receives the detected features as ground truth; only interprets ambiguous cases and generates feedback.
3. **Tie-breaking rule** — when unsure between two scores, always choose the lower score.

### Rubric dimensions

| Dimension | 0 | 1 | 2 | 3 |
|-----------|---|---|---|---|
| **Desired Results** | No meaningful goal | Topic/intention only, no student outcome | Broad/vague goal or not fully measurable | Clear, student-centered, specific, observable learning goal |
| **Learner Context** | Nothing | Minimal context with weak guidance | Some context, but key details missing | Multiple relevant learner details that shape the lesson |
| **Evidence of Learning** | Nothing | Vague mention of assessment | Check for understanding included, but partly aligned | Clear evidence of learning aligned to the goal |
| **Instructional Plan** | Nothing | One activity or instructional move | General flow present, but broad/incomplete | Clear lesson flow with relevant scaffolds matched to learners |
| **Output Requirements** | Nothing | Product requested, but minimal structure | Deliverable is clear, but key structure details missing | Deliverable and structure are clearly specified |

**Branching threshold:** Pre-test score ≥ 10/15 → skip Framework Intro (with optional review link)

### Evaluation settings

| Setting | Value |
|---------|-------|
| Model | Configurable via `EVAL_MODEL` in `.env` (default: `gpt-4o`) |
| Temperature | `0` (deterministic, consistent scoring) |
| Feedback | One overall feedback block — what's good + "BUT..." improvement (bold) |

---

## Scenarios Used (Module 1)

| Step | Level | Topic | Focus |
|------|-------|-------|-------|
| Pre-Test | Level 1/2 (Entering/Emerging) | The Seasonal Debate (What's Your Favorite Season?) | Phonics, subordinating conjunctions |
| Worked Example | Level 2–3 (Emerging/Developing) | The International Cafe (What's Your Comfort Food?) | Visual recipe cards, sensory verbs |
| Faded Example | Level 2–3 (Emerging/Developing) | Digital Citizenship (Building a Digital Identity) | Decoding technical terms, imperative mood |
| Full Practice | Level 3–4 (Developing/Expanding) | The Influencer's Guide (The Art of the "How-To" Video) | Summarizing, sequence adverbs |
| Post-Test | Level 4–5 (Expanding/Bridging) | The Tech Tug-of-War (Screens in School) | Conjunctions of contrast, reading for detail |

---

## Local Setup (Step-by-Step)

### Prerequisites

- **Python 3.11+** — check with `python --version`
- **Docker Desktop** — download at https://www.docker.com/products/docker-desktop  
  Docker runs the PostgreSQL database so you don't need to install it manually.

---

### Step 1 — Clone the repo

```bash
git clone <repo-url>
cd <repo-folder>
```

---

### Step 2 — Create your `.env` file

Copy the example file and fill in your OpenAI key:

```bash
cp .env.example .env
```

Open `.env` and replace `your_openai_api_key_here` with your actual key. Leave everything else as-is for local dev.

```ini
DJANGO_SECRET_KEY=dev-only-insecure-key-change-in-production
OPENAI_API_KEY=sk-...          ← paste your key here
DATABASE_URL=postgresql://promptcraft:promptcraft@127.0.0.1:5433/promptcraft
GENERATE_MODEL=gpt-4o
EVAL_MODEL=gpt-4o
DEBUG=True
ALLOWED_HOSTS=localhost 127.0.0.1
```

**About the Django Secret Key:**
- **For local development** (current stage): Use the default key `dev-only-insecure-key-change-in-production`. All teammates can use the same key.
- **For production deployment**: Generate a unique secure key using:
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```

---

### Step 3 — Install Python dependencies

```bash
pip install -r requirements.txt
```

> If you use a virtual environment (recommended):
> ```bash
> python -m venv venv
> source venv/bin/activate      # Mac/Linux
> venv\Scripts\activate         # Windows
> pip install -r requirements.txt
> ```

---

### Step 4 — Start Docker Desktop

Open **Docker Desktop** from your Applications folder (Mac) or Start Menu (Windows) and wait until it shows **"Docker Desktop is running"** in the menu bar / taskbar.

> Docker Desktop must be running before the next step. You only need to do this once per machine restart.

---

### Step 5 — Start the database

In your terminal, run:

```bash
docker-compose up -d db
```

This starts a PostgreSQL database in the background on port 5433. You should see:

```text
✔ Container new-db-1  Started
```

To stop the database later: `docker-compose down`

---

### Step 6 — Apply database migrations

```bash
python manage.py migrate
```

This sets up all the tables. You only need to run this once (or after pulling new migrations).

---

### Step 7 — Start the Django server

First, ensure **Docker Desktop is still running** and the database is active. To start the database if it's not running:

```bash
docker-compose up -d
```

Then start the Django development server:

```bash
python manage.py runserver
```

You should see:

```text
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
Django version 5.2.11, using settings 'webapps.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

**Open** http://127.0.0.1:8000 in your browser to access the application.

To stop the server, press **CONTROL-C** in the terminal.

To stop the database, run:

```bash
docker-compose down
```

---

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot connect to the Docker daemon` | Docker Desktop isn't running — open it and wait for it to start |
| `connection to server at "127.0.0.1", port 5433 failed` | Run `docker-compose up -d db` first |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` (make sure your venv is activated) |
| Port 8000 already in use | Run `python manage.py runserver 8080` and open http://localhost:8080 |

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
