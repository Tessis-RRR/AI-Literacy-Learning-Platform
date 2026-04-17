# PromptCraft — Instructional Design Overview

---

## The Problem This Module Is Solving

Multilingual and ESL teachers are increasingly expected to use AI tools (like ChatGPT) to speed up lesson planning and create bilingual teaching materials. But most teachers who try it get disappointing results — vague, generic lesson plans that don't match their classroom reality.

The root cause is not the AI. It's the prompt. Teachers default to one-line requests like *"make me a lesson plan for Grade 6 ESL"* because they have never been taught how to structure a request for an AI system. The output reflects the vagueness of the input.

This module solves a specific, teachable skill gap: **how to write a structured prompt that reliably produces usable, classroom-ready lesson materials.**

The target audience is multilingual and ESL middle school teachers — professionals with deep pedagogical knowledge but little to no experience with prompt engineering. They don't need to learn AI theory. They need one transferable technique that works immediately in their context.

---

## What Learners Will Be Able to Do

By the end of the ~30-minute module, teachers will be able to:

1. Write a structured 5-part AI prompt that generates a lesson plan tailored to their specific class
2. Use AI to create bilingual reading and comprehension materials as part of that lesson plan

These are applied performance outcomes, not declarative knowledge goals. The module does not ask teachers to explain prompt engineering — it asks them to do it.

---

## The Core Instructional Strategy: A 5-Part Prompt Framework

The module teaches a single, concrete framework. Every AI prompt a teacher writes should have five parts:

| Part | What it does |
|---|---|
| **Goal** | States what students will learn or be able to do (with a measurable action verb and success criteria) |
| **Context** | Describes who the students are — grade, proficiency level, first language background, specific learning challenges |
| **Task** | Tells the AI exactly what to create — the type of output, the duration, the deliverables |
| **Constraints** | Sets rules — what to include, what to avoid, lesson structure, language register, activity types |
| **Output Format** | Specifies how the response should look — table, bullet list, specific columns |

This framework is not arbitrary. Each part maps to a common failure mode in AI output:
- No **Goal** → the AI picks a random learning direction
- No **Context** → the lesson ignores the students' actual proficiency and language background
- No **Task** → the output is incomplete or misses key deliverables
- No **Constraints** → the AI uses inappropriate technology, vocabulary level, or lesson structure
- No **Output Format** → the response is an unformatted wall of text, unusable in class

Teaching the framework as a diagnostic tool — not just a checklist — is central to the design.

---

## How the Module Is Constructed: The Instructional Sequence

The module follows a **progressive scaffolding model**, moving from full support to full independence over six steps. Each step reduces the scaffold while increasing the demand on the learner.

```
Pre-Test
   │
   ├── Score ≥ 10/15 ──► skip intro ──► Worked Example
   │
   └── Score < 10/15 ──► Framework Intro ──► Worked Example
                                                    │
                                              Faded Example
                                                    │
                                           Full Prompt Practice
                                                    │
                                            Self-Reflection
                                                    │
                                              Post-Test
```

### Step 0 — Pre-Test (2–5 min): Diagnose, then branch

Before any instruction, learners write a prompt for a real teaching scenario (Grade 3, daily routines, bilingual class). The AI scores it against the rubric (0–15). This serves two purposes:

1. **Diagnostic branching** — teachers who already write structured prompts (score ≥ 10) skip the framework introduction and go straight to the worked example. Their time is not wasted.
2. **Baseline for pre/post comparison** — the score is saved and compared against the post-test to show measurable learning.

Critically, no score or feedback is shown at this stage. The pre-test is purely diagnostic; revealing scores here would prime learners on what to optimize rather than letting them perform authentically.

### Step 1 — Framework Introduction (2–5 min, skippable): Build the mental model

For learners who need it, five visual cards introduce the framework — one per part. The hook is direct: *"You've probably typed something like 'Make me a lesson plan' into ChatGPT — and gotten something generic. Here's the fix."*

This is kept intentionally short. The goal is not deep understanding of each part — it's enough schema to make the worked example legible. Understanding is built through practice, not through reading.

### Step 2 — Worked Example (5 min): Show what "good" looks like

A complete, high-quality 5-part prompt is displayed for the same Grade 3 scenario used in the pre-test. Each part is color-coded and annotated with a brief explanation of *why* it works — not just *what* it says.

The interaction here is **drag-and-drop category matching**: learners assign each labeled block to its framework part. This is a recognition task, not a production task — appropriate for this early stage. It forces engagement with the structure without requiring learners to generate anything yet.

The worked example uses the same scenario as the pre-test intentionally. Learners can immediately compare what they wrote with what a strong prompt looks like, without being told their pre-test score.

### Step 3 — Faded Example (5 min): Guided production with support

Learners now write a prompt themselves — but with support. For a new scenario (Grade 7 ESL, daily routines vocabulary, Spanish-speaking class), each framework part is partially pre-filled with an opening sentence. Learners complete the blanks and write the two fully blank sections (Task and Output Format).

After submission, the AI scores the completed prompt dimension by dimension and returns constructive feedback. Learners can **edit and resubmit** as many times as they want. The page explicitly invites this: *"Try changing one part at a time to see how it affects the feedback — this is how real prompt engineering works."*

The faded structure removes the cognitive load of generating from scratch while still requiring the learner to produce real content. The edit-resubmit loop makes the rubric legible through direct experience rather than explanation.

### Step 4 — Full Prompt Practice (5–8 min): Independent production + real output

Learners write a complete 5-part prompt from scratch for a new scenario (Grade 6, speaking activity, Mandarin/Arabic class). There are no pre-filled sentences — only brief tips per field as scaffolding.

On submission, two things happen simultaneously:
- The AI **evaluates** the prompt and returns a scored rubric with feedback
- The AI **generates** the actual lesson plan from the prompt

This is the core learning moment of the module. Learners see the direct relationship between what they wrote in their prompt and what came out. A weak Constraints section produces a generic lesson structure. A missing Output Format produces a paragraph instead of a usable table. The feedback makes this connection explicit, and the generated lesson plan makes it concrete.

Learners can then edit any part of the prompt and regenerate — comparing the new output with the previous one. This edit-compare loop is the most powerful part of the module: it transforms the rubric from an abstract scoring system into a practical tool for improving AI output.

### Step 5 — Self-Reflection (5 min): Metacognitive consolidation

A split-screen step. On the left: four multi-select reflection questions about the learner's experience in the full practice step. On the right: their editable prompt and the live AI output, which they can still modify and regenerate.

The reflection questions are designed to surface metacognitive insight — not to test knowledge. All answer choices are valid; they represent different but equally legitimate observations. The questions push learners to articulate *why* certain prompt choices led to certain outputs, not just *what* they would change.

The right-side editor keeps the reflection grounded in the actual artifact, not in abstract recall.

### Step 6 — Post-Test (5 min): Transfer to a new scenario

A new scenario: Grade 7, health and wellness unit, source text about energy drinks, Spanish and Mandarin class. No scaffold, no tips. Learners write a prompt independently.

The AI scores it against the same rubric. Immediately after submission, learners see:
- Their pre-test score vs. post-test score (visual comparison)
- Dimension-by-dimension feedback on the post-test prompt
- A closing message framing AI as a collaborative partner in lesson planning

The scenario shift tests **transfer** — whether learners can apply the framework to content they haven't seen before, which is the actual skill they'll need in their classrooms.

---

## How Assessment Works

Every prompt submission in the module (pre-test, faded example, full practice, post-test) is evaluated by a **hybrid rule engine + LLM pipeline**:

1. A rule engine first extracts deterministic signals from the prompt using pattern matching — does it mention a grade level, a time duration, specific activity types? These are binary facts, not interpretations.
2. The LLM evaluator receives those extracted signals alongside the full prompt. It scores each of the five dimensions (0–3) and generates feedback. It handles only what requires interpretation — is this a real constraint, or just a vague preference?

This design prevents the most common failure mode of pure LLM evaluation: inconsistent scoring based on surface features rather than actual prompt content. The rule engine anchors the LLM to what's actually in the text.

The rubric is calibrated to distinguish between levels of specificity, not just presence or absence:

- A Goal scores 3 only if it includes a measurable action verb AND success criteria — not just a topic
- A Context scores 3 only if it names grade, proficiency, AND a specific student learning challenge — not just demographics
- Constraints score 3 only with two or more actionable constraints — vague words like "engaging" are ignored

When evidence is ambiguous, the system always scores lower. This prevents grade inflation and keeps feedback meaningful.

---

## Key Instructional Design Decisions

**One real output, not just a score.** The full practice step generates an actual lesson plan, not just feedback. This grounds the rubric in something tangible. Teachers can immediately see whether the output is classroom-ready or not — which is the outcome they care about.

**Scenarios that escalate in complexity.** Each step uses a different teaching scenario, with increasing linguistic and pedagogical complexity. The pre-test and worked example share the same scenario to support comparison. Later scenarios introduce new grades, languages, and content types to build flexible application.

**Edit-resubmit loops as the primary learning mechanism.** The module does not teach primarily through reading or watching. It teaches through doing, failing, adjusting, and doing again. The rubric becomes meaningful when learners experience how changing a single field changes their score and their output.

**Adaptive branching without penalizing advanced learners.** Teachers who already write structured prompts skip the intro without being told they're being tracked. They're given an optional review link. This respects professional expertise while keeping the module efficient.

**Scaffolding that fades explicitly.** The sequence moves from no production (drag-and-drop) → partial production (faded form) → full production (blank form). Each step names what the previous scaffold was and removes it. Learners are aware of the progression.

**Reflection that uses the artifact, not memory.** Self-reflection happens alongside the actual prompt and generated output, not after the learner has closed them. This prevents reflection from becoming abstract and keeps it tied to concrete choices.
