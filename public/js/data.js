/* ============================================================
   PromptCraft — Module content & data
   ============================================================ */

const MODULES = [
  {
    id: 1,
    title: 'Using LLM for Lesson Planning',
    description: 'Learn to write structured AI prompts that generate lesson plans and bilingual teaching materials tailored to your multilingual classroom.',
    icon: '✦',
    duration: '~30 min',
    steps: 7,
    steps_data: [

      /* ── Step 0: Pre-Test ──────────────────────────────── */
      {
        type: 'pretest',
        title: 'Pre-Test',
        instruction: 'Read the scenario below and write the exact prompt you would give to an AI to create the lesson plan described.',
        scenario: "You are an experienced bilingual (English/Mandarin) educator preparing a 45-minute lesson for a Grade 3 class of 24 students with varying levels of English proficiency. Your core objective is to teach students how to describe daily routines using the present simple tense (specifically, first-person 'I' and third-person 'he/she'). The final lesson plan must include a bilingual learning goal, a list of required materials, and a clear in-class activity complete with an assessment component.",
        placeholder: 'Write your prompt here — include as much detail as you think is needed…'
      },

      /* ── Step 1: Prompt Structure Intro (skippable) ────── */
      {
        type: 'info',
        title: 'The 5-Part Prompt Framework',
        skippable: true,
        content: `
          <p>One of the most effective ways to get useful output from an AI is to give it a <strong>structured prompt</strong>. Vague prompts produce generic results. Structured prompts produce targeted, classroom-ready materials.</p>
          <p>We use a <strong>5-Part Framework</strong>. Each part gives the AI a different type of information it needs.</p>
          <div class="framework-cards">
            <div class="framework-card goal">
              <div class="fc-label">Part 1</div>
              <div class="fc-name">Goal</div>
              <div class="fc-desc">What do you want students to <em>learn or be able to do</em> by the end of the lesson?</div>
              <div class="fc-example">e.g. "My goal is for students to practise using past simple to describe a past event."</div>
            </div>
            <div class="framework-card context">
              <div class="fc-label">Part 2</div>
              <div class="fc-name">Context</div>
              <div class="fc-desc">Who are your students? Grade level, language proficiency, class size, L1 backgrounds.</div>
              <div class="fc-example">e.g. "I teach a Grade 8 ESL class of 28 students at B1 level, with mixed L1 backgrounds."</div>
            </div>
            <div class="framework-card task">
              <div class="fc-label">Part 3</div>
              <div class="fc-name">Task</div>
              <div class="fc-desc">What specific thing do you want the AI to <em>create or do</em>?</div>
              <div class="fc-example">e.g. "Please create a 50-minute lesson plan including a bilingual vocabulary list."</div>
            </div>
            <div class="framework-card constraint">
              <div class="fc-label">Part 4</div>
              <div class="fc-name">Constraints</div>
              <div class="fc-desc">What limitations or requirements must the output follow?</div>
              <div class="fc-example">e.g. "No technology needed. Include pair work. Structure: Hook → Teaching Points → Demo → Summary → Call to Action."</div>
            </div>
            <div class="framework-card output">
              <div class="fc-label">Part 5</div>
              <div class="fc-name">Output Format</div>
              <div class="fc-desc">How should the AI structure its response?</div>
              <div class="fc-example">e.g. "Format as a table: Time | Activity | Materials | Teacher Notes."</div>
            </div>
          </div>
          <div class="callout info">
            <div class="callout-icon">📌</div>
            <div class="callout-body">
              <strong>Why constraints matter for multilingual classrooms</strong>
              Without constraints, AI defaults to formal, dominant-language norms. Specifying regional dialects (e.g. Mexican Spanish, Taiwanese Mandarin) and instructional structure forces the AI to produce culturally appropriate, pedagogically sound output.
            </div>
          </div>
        `
      },

      /* ── Step 2: Worked Example ────────────────────────── */
      {
        type: 'annotated',
        title: 'Worked Example — Daily Routines Lesson Plan',
        scenario: 'An experienced bilingual (English/Mandarin) educator is preparing a 45-minute lesson for a Grade 3 class of 24 students with varying levels of English proficiency. The core objective is teaching students how to describe daily routines using the present simple tense (specifically, first-person "I" and third-person "he/she"). The final lesson plan must include a bilingual learning goal, a list of required materials, and a clear in-class activity complete with an assessment component.',
        components: [
          {
            type: 'goal',
            label: 'Goal',
            text: 'Students will be able to describe daily routines using the present simple tense, focusing on the first-person "I" and third-person "he/she" forms. The lesson must include a bilingual learning goal in English and Mandarin.',
            explanation: "Not just grammar (present simple) — also specify the exact forms (I vs he/she) to prevent the AI from generating a generic tense overview. Adding the bilingual requirement ensures the AI incorporates the students' L1 context."
          },
          {
            type: 'context',
            label: 'Context',
            text: 'Grade 3 class of 24 students. The students are bilingual with Mandarin L1 backgrounds and have varying levels of English proficiency. Some students may struggle with verb conjugations between first and third person.',
            explanation: 'Beyond basic demographics, specifying the L1 background and the specific learning struggle (verb conjugation) tells the AI where students will need extra scaffolding. 👉 Tip: Good context = not just "who they are" but "what they struggle with."'
          },
          {
            type: 'task',
            label: 'Task',
            text: "Create a 45-minute lesson plan to teach daily routines. Design a lesson that moves from a hook → input/scaffolding → guided practice → an interactive in-class activity → assessment. Ensure the activity allows students to practice speaking or writing about their own routines and a partner's routine.",
            explanation: 'The task breaks down the lesson structure so the AI creates exactly what you need. It forces the model to include interactive components rather than jumping straight to a worksheet. 👉 Tip: Force the model to reason first — not just output.'
          },
          {
            type: 'constraint',
            label: 'Constraints',
            text: 'Pedagogical: Use age-appropriate, simple vocabulary suitable for Grade 3. Include visual aids or TPR (Total Physical Response) suggestions. Linguistic: Provide bilingual support (English/Mandarin) where concepts might be confusing. Critical Negative Constraints: Do NOT use overly formal academic language. Do NOT produce a lecture-style lesson. Focus strictly on "daily routines".',
            explanation: "Constraints are the core of quality control — you are tightening the output space. Negative constraints (Do NOT…) block the model's default, often overly formal or generic behaviours."
          },
          {
            type: 'output',
            label: 'Output Format',
            text: 'Part 1 — Bilingual Learning Goal. Part 2 — Required Materials List. Part 3 — Step-by-Step Lesson Plan Table: Time | Activity | Teacher Instructions | Student Actions | Materials. Part 4 — In-Class Activity Description. Part 5 — Assessment Checklist.',
            explanation: 'Naming each deliverable explicitly means the AI cannot skip anything requested in the scenario. A table format is immediately usable. 👉 Tip: Good format = less editing after generation.'
          }
        ]
      },

      /* ── Step 3: Faded Example ─────────────────────────── */
      {
        type: 'faded',
        title: 'Guided Practice — Complete the Prompt',
        scenario: 'You are teaching a Grade 7 ESL class of 25 students at A2–B1 level. Their primary L1 is Spanish. The lesson is 45 minutes and focuses on vocabulary for daily routines. You want the lesson to include a bilingual vocabulary list (English + conversational Mexican Spanish) and at least one communicative speaking activity.',
        fields: [
          {
            key: 'goal',
            label: 'Goal',
            type: 'goal',
            prefix: 'My goal is for students to learn and practise vocabulary related to daily routines, so that they can',
            placeholder: '…e.g. "describe their morning routine in both English and Spanish."',
            tip: 'Think about what students will be able to do or say by the end of the lesson.'
          },
          {
            key: 'context',
            label: 'Context',
            type: 'context',
            prefix: 'I teach a Grade 7 ESL class of 25 students at A2–B1 level. Their L1 is Spanish.',
            placeholder: '…e.g. "Some students also have exposure to Mandarin at home."',
            tip: 'Any other details the AI should know? Classroom environment, mixed ability, specific challenges?'
          },
          {
            key: 'task',
            label: 'Task',
            type: 'task',
            prefix: '',
            placeholder: 'e.g. "Please create a 45-minute lesson plan on daily routines vocabulary for this class."',
            tip: 'Tell the AI exactly what to create. Be specific about the type of output and lesson duration.'
          },
          {
            key: 'constraints',
            label: 'Constraints',
            type: 'constraint',
            prefix: 'Include a bilingual vocabulary list in English and conversational Mexican Spanish (not formal Castilian Spanish).',
            placeholder: '…e.g. "Do not use technology. Include at least one pair speaking activity. Keep vocabulary at A2 level."',
            tip: 'What must be included or avoided? Activity types, language level, classroom logistics?'
          },
          {
            key: 'output',
            label: 'Output Format',
            type: 'output',
            prefix: '',
            placeholder: 'e.g. "Format as a table with columns: Time | Activity | Materials | Teacher Notes."',
            tip: 'Should the AI give a table? A bullet list? Specify the structure so the output is easy to use.'
          }
        ],
        systemPrompt: 'You are an expert EFL/ESL curriculum designer for multilingual classrooms. Create detailed, practical, classroom-ready teaching materials. When bilingual vocabulary is requested, use conversational regional dialect (e.g. Mexican Spanish, not formal Castilian), not formal academic language. Follow all constraints and format requirements exactly.'
      },

      /* ── Step 4: Full Prompt Practice ──────────────────── */
      {
        type: 'fullpractice',
        title: 'Your Turn — Write a Full Prompt',
        scenario: 'You are preparing a Grade 6 ESL class of 22 students at A2 level, with mixed L1 backgrounds (Mandarin and Arabic). You want to create a 40-minute lesson plan for a communicative speaking activity on the topic "talking about your weekend." The activity should include at least one pair or group speaking task and a simple informal assessment. Include a short bilingual vocabulary list in English and Mandarin.',
        fields: [
          { key: 'goal', label: 'Goal', type: 'goal', tip: 'What will students be able to do or say by the end of the lesson?' },
          { key: 'context', label: 'Context', type: 'context', tip: 'Grade, proficiency level, class size, L1 backgrounds, any special needs?' },
          { key: 'task', label: 'Task', type: 'task', tip: 'What exactly should the AI create? Be specific about type and length.' },
          { key: 'constraints', label: 'Constraints', type: 'constraint', tip: 'What must be included or avoided? Lesson structure, language level, activity types?' },
          { key: 'output', label: 'Output Format', type: 'output', tip: 'How should the response look? Table? Step-by-step? Specify columns if needed.' }
        ],
        systemPrompt: 'You are an expert EFL/ESL curriculum designer for multilingual classrooms. Create detailed, practical, classroom-ready lesson plans for language teachers. Include bilingual vocabulary when requested, using conversational rather than academic language. Follow all format and constraint requirements exactly.'
      },

      /* ── Step 5: Self-Reflection ───────────────────────── */
      {
        type: 'selfreflection',
        title: 'Reflect on Your Prompt',
        intro: 'Review what your prompt produced. Then use <strong>Refine Your Prompt</strong> to edit and regenerate — see how small changes lead to better outputs.',
        questions: [
          {
            num: 'Q1',
            question: 'Looking at the AI output from your full prompt practice — how would you describe it?',
            options: [
              'It was mostly usable, but I\'d tweak a few activities or instructions to better fit my class',
              'The structure looked right, but the language level or content didn\'t quite match my students\' needs',
              'It needed significant editing — the output felt too generic and didn\'t reflect the context I described'
            ]
          },
          {
            num: 'Q2',
            question: 'Which part of your 5-part prompt do you think had the biggest impact on the output quality?',
            options: [
              'Goal — being specific about the learning outcome shaped the whole direction of the lesson',
              'Constraints — telling the AI what to include and avoid made the output more targeted and realistic',
              'Output Format — specifying the structure made the response much easier to use directly in class'
            ]
          },
          {
            num: 'Q3',
            question: 'Was there a part of the prompt you found difficult to write? How did it affect the output?',
            options: [
              'Constraints — I wasn\'t sure what to restrict, and the output ended up too open-ended',
              'Output Format — I left it vague, and the AI\'s layout wasn\'t what I had in mind',
              'Context — I didn\'t include enough detail, so the output felt too generic'
            ]
          },
          {
            num: 'Q4',
            question: 'What would you change to get a better result from your prompt?',
            options: [
              'Be more specific in Constraints — name the exact activity types or lesson structure to follow',
              'Add more detail to Context — specific L1 backgrounds, proficiency nuances, classroom constraints',
              'Rewrite the Output Format to get a cleaner, more directly usable structure'
            ]
          }
        ],
        systemPrompt: 'You are an expert EFL/ESL curriculum designer for multilingual classrooms. Create detailed, practical, classroom-ready lesson plans for language teachers. Include bilingual vocabulary when requested, using conversational rather than academic language. Follow all format and constraint requirements exactly.'
      },

      /* ── Step 6: Post-Test ─────────────────────────────── */
      {
        type: 'posttest',
        title: 'Post-Test',
        instruction: 'Read the scenario and source text below. Write the exact prompt you would give to an AI to create a lesson plan based on this material.',
        scenario: 'You are teaching a bilingual health and wellness unit to a Grade 7 class of 25 students at B1 level. L1 backgrounds include Spanish and Mandarin. You want to create a 45-minute lesson plan using the source text below. The plan should include bilingual vocabulary support and at least one communicative speaking activity.',
        sourceText: '"Energy drinks contain high concentrations of caffeine and taurine that temporarily block adenosine receptors in the brain, delaying the onset of sleep. However, this artificial alert state inevitably leads to a physiological \'crash,\' characterized by severe fatigue and a measurable decrease in baseline executive functioning and emotional regulation."',
        placeholder: 'Write your full prompt here, using the 5-part framework (Goal, Context, Task, Constraints, Output Format)…'
      }

    ]
  }
];
