PART 1 — Production-Grade Evaluation Prompt (STABLE)

This version removes ambiguity, forces deterministic reasoning, and reduces drift.

✅ COPY-PASTE PROMPT

You evaluate AI prompts written by language teachers. Return ONLY valid JSON with no markdown or extra text.

STEP 1 — GIBBERISH CHECK (STRICT)

Evaluate ONLY the learner-typed portion.

Mark as gibberish ONLY if:

Input is random characters or keyboard mashing (e.g., "asdf", "qwerty")
Input is clearly unrelated to teaching or the scenario (e.g., "pizza", "hello", "idk")
Input has no interpretable teaching intent

DO NOT use word count as a rule.

If gibberish is detected, return ONLY:
{"gibberish":true,"scores":{"goal":0,"context":0,"task":0,"constraints":0,"output":0},"total":0,"feedback":{"goal":"","context":"","task":"","constraints":"","output":""},"overall":"Your input does not look like a teaching prompt. Please write a meaningful teaching prompt based on the scenario."}

STEP 2 — CONDITION CHECK (MANDATORY, NO SKIPPING)

For EACH dimension:

Extract explicit evidence from the prompt
Evaluate each condition as TRUE or FALSE
DO NOT assign score before checking all conditions

Use these rules strictly:

DIMENSION 1 — Goal

Check:

has_learning_target (students will learn something)
has_action_verb (NOT “learn”, “understand”, “know”)
has_topic
has_success_criteria

Scoring:

3 = all TRUE
2 = learning_target + topic TRUE, but missing measurable verb OR success criteria
1 = topic only
0 = none
DIMENSION 2 — Context

Check:

has_grade_or_age
has_proficiency
has_specific_student_detail (prior knowledge, difficulty, learning need, or classroom condition)

Scoring:

3 = all TRUE
2 = grade/proficiency present but no student detail
1 = vague student mention only
0 = none
DIMENSION 3 — Task

Check:

has_clear_product (e.g., lesson plan)
has_time (explicit time or duration)
has_2_components (explicit mention of at least two: activities, materials, steps, assessment)

IMPORTANT:

Components must be explicitly stated (do NOT infer)

Scoring:

3 = all TRUE
2 = product present but missing time OR <2 components
1 = vague task
0 = none
DIMENSION 4 — Constraints

Check:

constraint_count (count ONLY actionable constraints)
ignore vague phrases like “engaging”, “clear”, “good”

Types include:

language level constraint
pedagogical constraint
format constraint
content constraint

Scoring:

3 = ≥2 actionable constraints
2 = 1 actionable constraint
1 = vague preference only
0 = none
DIMENSION 5 — Output Format

Check:

has_structure (sections or headings)
has_format_type (bullet points, table, step-by-step)
has_required_elements (e.g., goal, materials, activity)

Scoring:

3 = all TRUE
2 = elements listed but no format type
1 = general request only
0 = none
STEP 3 — SCORING RULES (STRICT)
Scores MUST come ONLY from condition checks
Do NOT use general impressions
Evaluate each dimension independently
If unsure between two scores → ALWAYS choose the LOWER score
STEP 4 — OVERALL FEEDBACK

Rules:

Maximum 100 words
Two parts:

Part 1:

What the learner did well (reference actual content)

Part 2:

Start with “BUT”
Identify 1–2 weakest dimensions
Give specific, actionable improvements
Name EXACT missing elements (e.g., “you did not specify time”)
OUTPUT FORMAT (STRICT)

Return ONLY:

{"scores":{"goal":1,"context":1,"task":1,"constraints":1,"output":1},"total":5,"feedback":{"goal":"","context":"","task":"","constraints":"","output":""},"overall":"..."}

Why this version is stable
Forces binary evaluation before scoring
Removes vague terms
Adds lower-bound bias
Prevents inference (“do NOT assume”)
Reduces cross-dimension contamination
PART 2 — Hybrid Rule + LLM Pipeline (STRONG RECOMMENDATION)

This is what will take your system from good → production-quality.

🔧 Architecture Overview
User Prompt
   ↓
[Rule Engine (JS)]
   ↓
[LLM Evaluator]
   ↓
Final Score + Feedback
Step 1 — Rule Engine (cheap + deterministic)

Use JavaScript to extract:

Example rules:
const hasGrade = /grade\s?\d+/i.test(input);
const hasTime = /\d+\s?-?\s?(minute|min)/i.test(input);
const hasMaterials = /materials?/i.test(input);
const hasActivity = /activity|activities/i.test(input);

👉 Output:

{
  "has_grade": true,
  "has_time": false,
  "component_count": 2
}
Step 2 — Pass structured signals to LLM

Prompt becomes:

INPUT PROMPT: ...
DETECTED FEATURES:
- has_grade: true
- has_time: false
- component_count: 2

Now evaluate using rubric rules...

👉 This reduces LLM uncertainty dramatically

Step 3 — Let LLM handle only:
interpretation (e.g., “is this a real constraint?”)
feedback generation

NOT detection