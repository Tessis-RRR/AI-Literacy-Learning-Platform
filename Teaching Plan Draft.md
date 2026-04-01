# Teaching Plan: Using LLM to Build Lesson Plans & Teaching Materials

**Target Audience:** Multilingual / ESL Teachers (Middle School)
**Total Duration:** ~30 minutes
**Format:** Web-based interactive module

---

## Learning Goals

By the end of this module, teachers will be able to:
1. Write a structured 5-part prompt to generate a lesson plan outline using an LLM
2. Use LLM to create bilingual reading/comprehension materials as part of a lesson plan

---

## The 5-Part Prompt Framework

| Part | Description |
|------|-------------|
| **Goal** | What you want students to learn or be able to do |
| **Context** | Who your students are (grade, proficiency, class size, first language backgrounds) |
| **Task** | What specific thing you want the AI to create |
| **Constraints** | Rules, requirements, and things to avoid |
| **Output Format** | How the AI should structure its response |

---

## Evaluation Rubric (5 Dimensions, Max 15 Points)

| Dimension | Novice (1) | Developing (2) | Proficient (3) |
|-----------|-----------|----------------|----------------|
| **1. Procedural Formulation** | Vague request; treats AI as basic translator; no age/level/dialect specified | Identifies audience but lacks strict formatting constraints | Explicitly defines proficiency level, dialects, and pedagogical format |
| **2. Conceptual Engagement** | Uses AI only to generate final artifacts; no planning | Uses AI for basic supports (simple glossaries) only | Uses AI diagnostically to analyze language, predict difficulty, generate analogies |
| **3. Assessment & Iteration** | Accepts literal/formal AI output blindly | Notices tone issues; asks for a simple surface fix | Identifies root cause of AI bias; rewrites prompt with negative constraints |
| **4. Reflective AI Literacy** | Assumes AI understands students' lived experience and slang | Acknowledges odd translations as random glitches | Understands LLMs default to dominant formal norms; prompts actively to counter this |

**Scoring:** Each dimension scored 1–3. Total max = 15 points.

---

## Module Flow Overview

```
Pre-Test (2–5 min)
       │
       ├── Score ≥ 10/15 ──► [Skip notification + optional review link] ──► Worked Example
       │
       └── Score < 10/15 ──► Prompt Structure Intro (2–5 min)
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

---

## Section 1: Pre-Test

**Time:** 2–5 minutes
**Purpose:** Assess prior prompt-writing knowledge; determine learning path
**Page Design:** Single page, no scrolling required

### Content

**Instruction text (brief):**
> Read the scenario below and write the exact prompt you would give to an AI to help you create the lesson plan.

**Scenario (displayed in a highlighted box):**
> You are an experienced bilingual (English/Mandarin) educator preparing a 45-minute lesson for a Grade 3 class of 24 students with varying levels of English proficiency. Your core objective is to teach students how to describe daily routines using the present simple tense (specifically, first-person 'I' and third-person 'he/she'). The final lesson plan must include a bilingual learning goal, a list of required materials, and a clear in-class activity complete with an assessment component.

**Interaction:**
- Large text input area for the learner's prompt
- "Submit" button
- After submission: AI evaluates the prompt against the 4-dimension rubric (score not shown to learner yet)

### Branch Logic

| Score | Action |
|-------|--------|
| ≥ 10 / 15 | Display message: *"Great work! Your prompt already shows strong structure. You can jump straight to the worked example. If you'd like to review the 5-Part Prompt Framework first, [click here to take a look]."* → Redirect to Worked Example |
| < 10 / 15 | Proceed automatically to Prompt Structure Intro |

---

## Section 2: Prompt Structure Introduction

**Time:** 2–5 minutes
**Skippable:** Yes — learners who scored ≥ 10/15 on the pre-test skip this section (with optional review link)
**Page Design:** All 5 parts visible on one screen as visual cards; no scrolling required

### Content Structure (Hook → Teaching Points → Summary)

**Hook (10–20 seconds):**
> "You've probably typed something like 'Make me a lesson plan' into ChatGPT — and gotten something generic. Here's the fix."

**Teaching Points (5 cards, one per framework part):**

| Card | Part | What It Means | Example |
|------|------|--------------|---------|
| 1 | 🎯 Goal | What you want students to learn | *"Students will practice past simple to describe a past event."* |
| 2 | 👥 Context | Who your students are | *"Grade 3 class of 24 students. Bilingual with Mandarin first language backgrounds and varying levels of English proficiency."* |
| 3 | 📋 Task | What you want the AI to create | *"Create a 50-minute lesson plan."* |
| 4 | ⛔ Constraints | What the AI must follow or avoid | *"No technology needed. Include pair work. Vocabulary at B1 level. Structure: Hook → Teaching Points → Demo → Summary → Call to Action."* |
| 5 | 📄 Output Format | How the response should be structured | *"Format as a table: Time \| Activity \| Materials \| Teacher Notes."* |

**Summary:**
> A strong prompt gives the AI a clear Goal, describes the Context of your students, states the Task, sets Constraints, and specifies the Output Format. The more specific you are, the more useful the output.

**Navigation:** "Next → See a Full Example" button

---

## Section 3: Worked Example

**Time:** 5 minutes
**Purpose:** Show a complete, well-structured prompt chunked into 5 parts, and explain why each part is written the way it is
**Page Design:** One page. Prompt displayed in 5 color-coded sections. Analysis/annotation visible alongside each part.

### Scenario

> An experienced bilingual (English/Mandarin) educator is preparing a 45-minute lesson for a Grade 3 class of 24 students with varying levels of English proficiency. The core objective is teaching students how to describe daily routines using the present simple tense (specifically, first-person "I" and third-person "he/she"). The final lesson plan must include a bilingual learning goal, a list of required materials, and a clear in-class activity complete with an assessment component.

### Full Prompt (Chunked and Color-Coded)

**🎯 Goal**
> "My goal is for students to practice using past simple tense to describe a past event, and to be able to use irregular verbs correctly in context."

*Why this works: Specifying both the grammar target and the skill (irregular verbs) gives the AI clear scope — it won't generate a lesson on all tenses.*

---

**👥 Context**
> "Grade 3 class of 24 students. The students are bilingual with Mandarin first language backgrounds and have varying levels of English proficiency. Some students may struggle with verb conjugations between first and third person."

*Why this works: Specifying the first language background and the specific learning struggle (verb conjugation) tells the AI where students will need extra scaffolding.*

---

**📋 Task**
> "Please create a 50-minute lesson plan for this class, including a short bilingual vocabulary list (English and Spanish) of 8–10 key irregular past tense verbs."

*Why this works: Stating the time and the deliverable (lesson plan + vocabulary list) ensures the output is complete and usable — not just a list of ideas.*

---

**⛔ Constraints**
> "No technology required. Include at least one pair work activity. Keep all vocabulary and instructions at B1 level. Structure the lesson in this order: Hook (10 min) → Teaching Points (10 min) → Demonstration (15 min) → Summary (10 min) → Call to Action (5 min). Do not include grammar explanations in Spanish or Chinese — English only."

*Why this works: The lesson structure constraint ensures the AI follows sound pedagogical design. The negative constraint ("do not include grammar explanations in...") prevents the AI from defaulting to translation-heavy output.*

---

**📄 Output Format**
> "Format the lesson plan as a table with these columns: Time | Activity | Materials | Teacher Notes. Present the vocabulary list separately at the end as a two-column table: English | Spanish."

*Why this works: Without a format instruction, AI responses are often walls of text. A table makes the plan immediately usable in the classroom.*

---

**Navigation:** "Next → Try It Yourself" button

---

## Section 4: Faded Example

**Time:** 5 minutes
**Purpose:** Guided practice — learner completes a partially-written prompt using initial sentences and tips
**Page Design:** One page. Scenario at top. 5-part form below with pre-filled parts and blanks to complete. Tips visible per section.

### Scenario

> You are teaching a Grade 7 ESL class of 25 students at A2–B1 level. Their primary first language is Spanish. The lesson is 45 minutes and focuses on vocabulary for daily routines. You want the lesson to include a bilingual vocabulary list (English + conversational Mexican Spanish) and at least one communicative activity where students speak to each other.

### Prompt Template (Faded)

**🎯 Goal** *(partially pre-filled — learner completes)*
> "My goal is for students to learn and practice vocabulary related to daily routines, so that they can _________________________ ."

*Tip: Think about what students will be able to do or say by the end of the lesson.*

---

**👥 Context** *(partially pre-filled — learner completes)*
> "I teach a Grade 7 ESL class of 25 students at A2–B1 level. Their first language is _______________ and the class includes _______________."

*Tip: Any other details about your students that the AI should know? Special needs, mixed ability, classroom environment?*

---

**📋 Task** *(blank — learner writes)*
> [Write here]

*Tip: Tell the AI exactly what to create. Be specific about the type of output and how long the lesson is.*

---

**⛔ Constraints** *(partially pre-filled — learner completes)*
> "Include a bilingual vocabulary list in English and conversational Mexican Spanish (not formal Castilian). Do not use _______________, and make sure to include _______________."

*Tip: What activity types must be included? What should the AI avoid? Think about level, technology, and classroom logistics.*

---

**📄 Output Format** *(blank — learner writes)*
> [Write here]

*Tip: Should the AI give you a table? A bullet list? Specify the columns or structure you want so the output is easy to use.*

---

### Interactions

1. Learner fills in blanks and writes the empty sections
2. Learner clicks **"Submit for Feedback"**
3. AI evaluates the completed prompt against the rubric → shows score + constructive feedback per dimension
4. Learner can **edit and resubmit** to see how changes affect the score and feedback

**Prominent note on page:**
> 💡 **You can edit and resubmit as many times as you like.** Try changing one part at a time to see how it affects the feedback — this is how real prompt engineering works!

---

## Section 5: Full Prompt Practice

**Time:** 5–8 minutes
**Purpose:** Independent practice — write a complete 5-part prompt from scratch, receive AI feedback, and see the actual LLM-generated lesson plan
**Page Design:** One page. Scenario at top. Empty 5-part form with tips below. After submission: feedback panel and generated content displayed on the same page.

### Scenario

> You are preparing a Grade 6 ESL class of 22 students at A2 level, with mixed first language backgrounds (Mandarin and Arabic). You want to create a 40-minute lesson plan for a communicative speaking activity on the topic "talking about your weekend." The activity should include at least one pair or group speaking task and a simple informal assessment. Include a short bilingual vocabulary list in English and Mandarin.

### Prompt Form (5 parts, empty, with tips)

| Part | Input | Tip |
|------|-------|-----|
| 🎯 Goal | [text area] | *What will students be able to do or say by the end?* |
| 👥 Context | [text area] | *Grade, proficiency level, class size, first language backgrounds, any special needs?* |
| 📋 Task | [text area] | *What exactly should the AI create? Be specific about type and length.* |
| ⛔ Constraints | [text area] | *What must be included or avoided? Lesson structure, language level, activity types?* |
| 📄 Output Format | [text area] | *How should the response look? Table? Step-by-step? Specify columns if needed.* |

### After Submission

The page updates to show three panels:

**Panel 1 — Your Prompt Score & Feedback**
- Score displayed per dimension (e.g., Procedural: 2/3, Conceptual: 1/3...)
- Constructive written feedback for each dimension with specific suggestions

**Panel 2 — AI-Generated Lesson Plan**
- The actual lesson plan generated from the learner's prompt
- Displayed in full so learner can assess whether it is usable

**Panel 3 — Edit & Regenerate (Back-and-Forth)**
> 🔄 **Want to see how a small change makes a big difference?**
> Edit any part of your prompt above and click **"Regenerate"** to see a new output.
> Try changing just one thing — for example, add a constraint or rewrite your Output Format — and compare the result with your first attempt.

- Learner can modify any of the 5 parts
- Click "Regenerate" → new AI output appears
- Previous output remains visible for comparison (side-by-side or toggle)

---

## Section 6: Self-Reflection

**Time:** 5 minutes
**Purpose:** Metacognitive reflection — help learners understand how their prompt choices determined the quality of their output
**Page Design:** Split screen
- **Left panel:** 3–4 reflection questions (multi-select 多选题)
- **Right panel:** Editable 5-part prompt from Full Prompt Practice + live LLM-generated output (learner can modify and regenerate)

### Right Panel (Interactive Prompt Editor)

- Shows the learner's 5-part prompt from Section 5 in editable fields
- Below it: the most recent AI-generated lesson plan
- **"Regenerate"** button — after editing, produces new output
- Subtle prompt to learners: *"Try tweaking just one part and see what changes."*

### Reflection Questions (Multi-Select 多选题)

Each question has **3 options** (all are valid — they represent different reflection directions) + an **"Other"** free-text option. Learners may select multiple options.

---

**Q1. Looking at the AI output from your full prompt practice — how would you describe it?**

- [ ] It was mostly usable, but I'd tweak a few activities or instructions to better fit my class
- [ ] The structure looked right, but the language level or content didn't quite match my students' needs
- [ ] It needed significant editing — the output felt too generic and didn't reflect the specific context I described

**Other:** _______________

---

**Q2. Which part of your 5-part prompt do you think had the biggest impact on the output quality?**

- [ ] Goal — being specific about the learning outcome shaped the whole direction of the lesson
- [ ] Constraints — telling the AI what to include and avoid made the output more targeted and realistic
- [ ] Output Format — specifying the structure made the response much easier to use directly in class

**Other:** _______________

---

**Q3. Was there a part of the prompt you found difficult to write? How did it affect the output?**

- [ ] Constraints — I wasn't sure what to restrict, and the output ended up feeling off or too open-ended
- [ ] Output Format — I left it vague, and the AI's layout wasn't what I had in mind
- [ ] Context — I didn't include enough detail about my students, so the output felt too generic

**Other:** _______________

---

**Q4. Now that you can see your prompt score, the feedback, and the generated content together — what would you change to get a better result?**

- [ ] I'd be more specific in Constraints (e.g., name the exact activity types or lesson structure to follow)
- [ ] I'd add more detail to Context (e.g., specific first language backgrounds, proficiency level nuances, classroom constraints)
- [ ] I'd rewrite the Output Format to get a cleaner, more directly usable structure

**Other:** _______________

---

## Section 7: Post-Test

**Time:** 5 minutes
**Purpose:** Assess learning outcomes; compare with pre-test baseline
**Page Design:** Single page, same format as pre-test; no scrolling required

### Format

One open-ended prompt writing task, AI-scored against the 5-dimension rubric (max 15 pts)

### Instruction Text

> Read the scenario and the source text below. Write the exact prompt you would give to an AI to create a lesson plan based on this material.

### Scenario

> You are teaching a bilingual health and wellness unit to a Grade 7 class of 25 students at B1 level. first language backgrounds include Spanish and Mandarin. You want to create a 45-minute lesson plan using the source text below. The plan should include bilingual vocabulary support and at least one communicative speaking activity.

**Source Text:**
> *"Energy drinks contain high concentrations of caffeine and taurine that temporarily block adenosine receptors in the brain, delaying the onset of sleep. However, this artificial alert state inevitably leads to a physiological 'crash,' characterized by severe fatigue and a measurable decrease in baseline executive functioning and emotional regulation."*

### Interaction

1. Learner writes their prompt in the text area
2. Learner clicks "Submit"
3. AI scores the prompt against the rubric (max 15 pts)
4. Learner sees:
   - **Pre-test score vs. Post-test score** (visual comparison — e.g., bar chart or before/after display)
   - **AI feedback** on their post-test prompt (dimension by dimension, constructive)
   - **Closing message:** *"You've completed this module! You now have the skills to use LLM as a collaborative partner in your lesson planning. [Continue to Next Module →]"*

---

## Design Principles Summary

| Principle | Implementation |
|-----------|---------------|
| **One page per section** | Each section fits within one screen height — no scrolling required |
| **Back-and-forth editing** | Clearly signposted in Sections 4, 5, and 6 with "Edit & Regenerate" affordances |
| **Branching with transparency** | Pre-test skip path explicitly tells learners what they skipped and offers review |
| **AI feedback on all practice** | Faded example and Full Prompt Practice both receive rubric-based AI feedback |
| **Split-screen reflection** | Reflection questions on left; editable prompt + live output on right |
| **Progressive scaffolding** | Faded example (initial sentences + structure) → Full practice (tips only, blank form) |

---

## Scenarios Used Across the Module

| Section | Scenario | Topic |
|---------|----------|-------|
| Pre-Test | Grade 3, 24 students, varying proficiency, Mandarin first language | Daily routines — present simple, learning goal, materials, activity |
| Worked Example | Grade 3, 24 students, varying proficiency, Mandarin first language | Daily routines — present simple, learning goal, materials, activity |
| Faded Example | Grade 7 ESL, 25 students, A2–B1, Spanish first language | Daily routines vocabulary — bilingual list + communicative activity |
| Full Prompt Practice | Grade 6 ESL, 22 students, A2, Mandarin + Arabic first language | Communicative speaking — "talking about your weekend" |
| Post-Test | Grade 7 bilingual, 25 students, B1, Spanish + Mandarin first language | Health & wellness — energy drinks (source text adaptation) |
