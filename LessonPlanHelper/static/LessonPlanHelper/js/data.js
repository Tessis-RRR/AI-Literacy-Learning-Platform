/* ============================================================
   ESL Co-Pilot — Module content & data
   ============================================================ */

const MODULES = [
  {
    id: 1,
    number: 1,
    kind: 'Learning Module',
    title: 'Design in Action',
    description: 'Master the framework for crafting evidence-based lesson plans tailored to middle-school ESL classrooms.',
    icon: '✦',
    duration: '~30 min',
    steps: 7,
    progress: 0,
    status: 'progress',
    tint: '#E8E4FB',
    accent: '#5B5CEC',
    illustration: 'spark',
    outcomes: [
      'Identify the 5-part framework for evidence-based ESL lesson design',
      'Distinguish input, output, and feedback loops for middle-school learners',
      'Draft a lesson aligned to ACTFL proficiency descriptors',
    ],
    detailSteps: [
      { t: 'Pre-Test', d: 'Write a prompt for a real classroom scenario; AI scores it against the rubric.', time: '5 min' },
      { t: 'The 5-Part Framework', d: 'Walk through Desired Results, Learner Context, Evidence, Instruction, Output.', time: '5 min' },
      { t: 'Worked Example', d: 'Drag-label the parts of a real 7th-grade lesson — annotated prompt.', time: '8 min' },
      { t: 'Faded Example', d: 'Fill in blanks on a partially-written prompt with AI feedback per field.', time: '8 min' },
      { t: 'Full Prompt Practice', d: 'Write a complete 5-part prompt from scratch; get AI rubric feedback.', time: '10 min' },
      { t: 'Self-Reflection', d: 'Reflect on your prompt choices and iterate with live AI output.', time: '8 min' },
      { t: 'Post-Test', d: 'New scenario — compare pre vs. post scores to see your growth.', time: '5 min' },
    ],
    steps_data: [

      /* ── Step 0: Pre-Test ──────────────────────────────── */
      {
        type: 'pretest',
        title: 'Pre-Test',
        instruction: 'Read the scenario below and write the exact prompt you would give to an AI to create the lesson plan described.',
        scenario: {
          title: 'Scenario 1: The Seasonal Debate',
          topic: "What's Your Favorite Season?",
          learners: 'Level 1/2 (Entering/Emerging) students.',
          foundational_literacy: 'Phonics and decoding of seasonal vowel teams and multi-syllabic weather words (e.g., S-u-mm-er, Au-tumn, Free-zing, Th-un-der).',
          grammar_and_syntax: 'Use of subordinating conjunctions (because, since, although) to justify opinions and build complex sentence structures.',
          vocabulary: {
            tier_1: ['Sun', 'rain', 'snow', 'hot', 'cold', 'like'],
            tier_2: ['Preference', 'transition', 'frequent', 'extreme', 'average'],
            tier_3: ['Solstice', 'equinox', 'precipitation', 'humidity', 'hemisphere']
          },
          social_language: 'Polite Disagreement. Practicing phrases like, "I see your point, but I prefer..." to build confidence in academic discussions.'
        },
        placeholder: 'Write your prompt here — include as much detail as you think is needed…'
      },

      /* ── Step 1: Prompt Structure Intro (skippable) ────── */
      {
        type: 'info',
        title: 'The 5-Part Prompt Framework',
        skippable: true,
        content: `
          <p>One of the best ways to get a useful lesson plan from AI is to give it a <strong>structured prompt</strong>. Vague prompts often lead to generic lesson ideas. Structured prompts help AI generate materials that are more focused, relevant, and classroom-ready.</p>
          <p>We use a <strong>5-Part Framework</strong>. Each part gives the AI an important kind of information it needs to create a stronger lesson plan.</p>
          <div class="framework-cards">
            <div class="framework-card goal">
              <div class="fc-label">Part 1</div>
              <div class="fc-name">Desired Results</div>
              <div class="fc-desc">What should students learn or be able to do by the end of the lesson? This tells the AI what the lesson is really aiming for. A clear learning goal helps the AI stay focused instead of generating random activities.</div>
              <div class="fc-example">e.g. "Students will be able to identify the main idea of a short text and support it with two details."</div>
            </div>
            <div class="framework-card context">
              <div class="fc-label">Part 2</div>
              <div class="fc-name">Learner &amp; Context</div>
              <div class="fc-desc">Who are your students, and what teaching situation should the AI know about? Include details like grade level, language proficiency, class size, prior knowledge, or other important classroom conditions.</div>
              <div class="fc-example">e.g. "I teach an ESL class of 20 middle school students at WIDA level 3 (Developing)."</div>
            </div>
            <div class="framework-card task">
              <div class="fc-label">Part 3</div>
              <div class="fc-name">Evidence of Learning</div>
              <div class="fc-desc">How will students show that they met the goal? This helps the AI design a lesson with a meaningful check for understanding, instead of activities that feel disconnected from the goal.</div>
              <div class="fc-example">e.g. "Include a short exit ticket where students identify the main idea and give two supporting details."</div>
            </div>
            <div class="framework-card constraint">
              <div class="fc-label">Part 4</div>
              <div class="fc-name">Instructional Plan</div>
              <div class="fc-desc">What kind of lesson flow, activities, or supports should the AI include? You can describe the teaching approach, sequence, grouping, and scaffolds you want in the lesson.</div>
              <div class="fc-example">e.g. "Start with teacher modeling, then partner practice, then independent work. Include sentence frames and one guided example."</div>
            </div>
            <div class="framework-card output">
              <div class="fc-label">Part 5</div>
              <div class="fc-name">Output Requirements</div>
              <div class="fc-desc">What exactly should the AI generate, and how should it be organized? This tells the AI what final product you want, such as a lesson plan, worksheet, bilingual support, or table format.</div>
              <div class="fc-example">e.g. "Create a 40-minute lesson plan with objective, warm-up, guided practice, pair activity, exit ticket, and materials list. Format it as a table."</div>
            </div>
          </div>
          <div class="callout info">
            <div class="callout-icon">📌</div>
            <div class="callout-body">
              When all five parts work together, the AI has a much clearer picture of what to teach, who the lesson is for, how learning should happen, and what kind of output to produce.
            </div>
          </div>
        `
      },

      /* ── Step 2: Worked Example ────────────────────────── */
      {
        type: 'annotated',
        title: 'Worked Example — Daily Routines Lesson Plan',
        scenario: {
          title: 'Scenario 2: The International Cafe',
          topic: "What's Your Comfort Food?",
          learners: 'Level 2–3 (Emerging/Developing) students.',
          foundational_literacy: 'Basic reading comprehension and decoding through simplified, visual recipe cards. Focusing on identifying measurements and instructional verbs.',
          grammar_and_syntax: 'Sensory verbs (tastes, smells, feels) combined with descriptive adjectives to create vivid imagery in writing.',
          vocabulary: {
            tier_1: ['Eat', 'cook', 'bread', 'meat', 'sweet', 'family'],
            tier_2: ['Authentic', 'significant', 'primary', 'tradition', 'texture'],
            tier_3: ['Savory', 'palate', 'fermentation', 'carbohydrate', 'nutrient']
          },
          social_language: 'Cultural Sharing. Building a space where students feel confident presenting a dish from their heritage to a small group.'
        },
        components: [
          {
            type: 'desired_results',
            label: 'Desired Results',
            text: 'By the end of the lesson, students will be able to describe a comfort food from their own life or culture using sensory verbs and descriptive adjectives, and identify key measurements and instructional verbs in a simplified visual recipe card.',
            explanation: "Naming both the grammar target (sensory verbs + adjectives) and the literacy task (identify measurements and instructional verbs) keeps the AI focused on two concrete, measurable outcomes rather than generating a vague lesson topic."
          },
          {
            type: 'learner_context',
            label: 'Learner &amp; Context',
            text: 'Students are Level 2–3 multilingual learners with developing reading comprehension. They benefit from visuals, modeling, sentence frames, and small-group speaking support. Focus areas — Foundational literacy: simplified visual recipe cards, measurements, instructional verbs. Grammar: sensory verbs + descriptive adjectives. Vocabulary: Tier 1 (eat, cook, bread, meat, sweet, family), Tier 2 (authentic, significant, primary, tradition, texture), Tier 3 (savory, palate, fermentation, carbohydrate, nutrient). Social language: respectful cultural sharing in small groups.',
            explanation: 'Providing the full learner profile — proficiency band, preferred supports, grammar focus, all three vocabulary tiers, and the social language goal — gives the AI everything it needs to calibrate difficulty and scaffold appropriately. 👉 Tip: Good context = not just "who they are" but "what they need."'
          },
          {
            type: 'evidence_of_learning',
            label: 'Evidence of Learning',
            text: 'Include: a task where students identify 2 measurements and 2 instructional verbs from a recipe card; a small-group speaking task describing their comfort food; a short exit ticket where students write 2–3 sentences using sensory language.',
            explanation: 'Listing three distinct evidence tasks forces the AI to design activities that actually check understanding, not just fill time. Each task targets a different skill: reading, speaking, and writing. 👉 Tip: Specify the evidence before the activities so the lesson works backwards from proof of learning.'
          },
          {
            type: 'instructional_plan',
            label: 'Instructional Plan',
            text: 'Use this sequence: warm-up on meaningful foods → teacher modeling with a simplified recipe card → guided practice identifying recipe language → small-group cultural sharing → short independent writing → exit ticket. Include sentence frames and vocabulary support throughout.',
            explanation: 'A named sequence with explicit scaffolds (sentence frames, vocabulary support) prevents the AI from generating a generic outline. Specifying the cultural sharing step ensures the lesson stays community-centred. 👉 Tip: Force the model to follow your sequence — not invent its own.'
          },
          {
            type: 'output_requirements',
            label: 'Output Requirements',
            text: 'Format the response as a clear lesson-plan table with columns: Objective | Timing | Teacher Actions | Student Actions | Materials | Scaffolds | Speaking Task | Exit Ticket. Keep the lesson practical, culturally responsive, and appropriate for emerging/developing English learners.',
            explanation: 'Naming every column means the AI cannot collapse or skip any component. Adding the tone requirement (culturally responsive) at the format stage ensures it carries through the entire output. 👉 Tip: Good format = less editing after generation.'
          }
        ]
      },

      /* ── Step 3: Faded Example ─────────────────────────── */
      {
        type: 'faded',
        title: 'Guided Practice — Complete the Prompt',
        scenario: {
          title: 'Scenario 3: Digital Citizenship',
          topic: 'Building a Digital Identity',
          learners: 'Level 2–3 (Emerging/Developing) students.',
          foundational_literacy: 'Decoding multi-syllabic digital terms (al-go-rithm, pri-va-cy) using syllable-division rules to improve reading fluency in technical texts.',
          grammar_and_syntax: 'The imperative mood for giving advice or instructions (e.g., "Set your password," "Do not share personal info").',
          vocabulary: {
            tier_1: ['Post', 'phone', 'share', 'secret', 'fake'],
            tier_2: ['Permanent', 'consequence', 'perspective', 'verification', 'engagement'],
            tier_3: ['Algorithm', 'anonymity', 'encryption', 'metadata', 'digital footprint']
          },
          social_language: 'Handling Online Conflict. Role-playing how to respond to negative comments using assertive, respectful "I" statements.'
        },
        fields: [
          {
            key: 'desired_results',
            label: 'Desired Results',
            type: 'desired_results',
            prefix: '',
            placeholder: '…e.g. "Students will be able to write a clear 3-step how-to guide using sequence adverbs and imperative verbs, and give a peer one compliment and one suggestion during a script review."',
            tip: 'Name the specific skill students will produce — what can they write, say, or do? Include the grammar target and any social language goal.'
          },
          {
            key: 'learner_context',
            label: 'Learner &amp; Context',
            type: 'learner_context',
            prefix: 'My students are Level 2–3 (Emerging/developing) multilingual learners.',
            placeholder: '…e.g. "They can write in paragraphs but need support with logical sequencing and academic vocabulary. Some students struggle to give constructive peer feedback respectfully."',
            tip: 'Add details about what your students can already do, what they find difficult, and any classroom conditions (group size, tech access, mixed abilities) the AI should know.'
          },
          {
            key: 'evidence_of_learning',
            label: 'Evidence of Learning',
            type: 'evidence_of_learning',
            prefix: 'To show they have met the learning goal, students should',
            placeholder: '…e.g. "produce a written 3-step how-to guide using at least 3 sequence adverbs, and complete a peer feedback form with one compliment and one suggestion."',
            tip: 'What will students produce or do that proves they learned? Be specific — name the task, the quantity, and the language feature you expect to see.'
          },
          {
            key: 'instructional_plan',
            label: 'Instructional Plan',
            type: 'instructional_plan',
            prefix: '',
            placeholder: 'e.g. "Design a 45-minute lesson that moves from: watching a short how-to video → identifying sequence adverbs → guided writing with a sentence frame scaffold → peer script review using a feedback sentence starter."',
            tip: 'Give the AI a lesson sequence to follow. Name the activity types and scaffolds you want — don\'t leave the structure up to the AI.'
          },
          {
            key: 'output_requirements',
            label: 'Output Requirements',
            type: 'output_requirements',
            prefix: '',
            placeholder: 'e.g. "Format as a lesson plan table: Timing | Activity | Teacher Actions | Student Actions | Materials | Scaffolds. Include a separate peer feedback sentence-starter card."',
            tip: 'Tell the AI exactly what to produce and how to structure it. Name every section or column you need so nothing gets left out.'
          }
        ],
        systemPrompt: 'You are an expert EFL/ESL curriculum designer for multilingual classrooms. Create detailed, practical, classroom-ready teaching materials. Follow all constraints and format requirements exactly.'
      },

      /* ── Step 4: Full Prompt Practice ──────────────────── */
      {
        type: 'fullpractice',
        title: 'Your Turn — Write a Full Prompt',
        scenario: {
          title: 'Scenario 4: The Influencer\'s Guide',
          topic: 'The Art of the "How-To" Video',
          learners: 'Level 3–4 (Developing/Expanding) students.',
          foundational_literacy: 'Summarizing multi-step video tutorials into a clear, 3-step written guide to practice identifying main ideas.',
          grammar_and_syntax: 'Sequence adverbs (First, Second, Next, Finally) to create logical flow in instructional writing.',
          vocabulary: {
            tier_1: ['Show', 'help', 'watch', 'make', 'tell'],
            tier_2: ['Sequential', 'objective', 'demonstrate', 'modify', 'clarify'],
            tier_3: ['Transitions', 'aspect ratio', 'frame rate', 'storyboarding', 'post-production']
          },
          social_language: 'Feedback. Practicing how to give a peer a compliment and a suggestion during script reviews.'
        },
        fields: [
          { key: 'desired_results',    label: 'Desired Results',      type: 'desired_results',      tip: 'What will students be able to write, say, or do by the end of the lesson? Name the grammar target and the social language goal.' },
          { key: 'learner_context',    label: 'Learner &amp; Context', type: 'learner_context',      tip: 'Describe your students\' proficiency level, what they can already do, what they struggle with, and any classroom conditions the AI needs to know.' },
          { key: 'evidence_of_learning', label: 'Evidence of Learning', type: 'evidence_of_learning', tip: 'What will students produce that proves they learned? Name the task, the language features you expect, and any peer interaction component.' },
          { key: 'instructional_plan', label: 'Instructional Plan',   type: 'instructional_plan',   tip: 'Give the AI a lesson sequence to follow — name the activity types, timing, and scaffolds. Don\'t leave the structure up to the AI.' },
          { key: 'output_requirements', label: 'Output Requirements',  type: 'output_requirements',  tip: 'Tell the AI exactly what to produce and how to structure it — table columns, separate resource cards, tone. Name every section you need.' }
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
            question: 'What is one part of the output you would most like to improve?',
            hint: 'Identify a concrete problem before you revise.'
          },
          {
            num: 'Q2',
            question: 'Which one part of your prompt will you change to improve that?',
            hint: 'Make a deliberate, single revision choice — don\'t change everything at once. Then edit your prompt on the right and click Regenerate.',
            type: 'multiple_choice',
            options: [
              'Desired Results',
              'Learner & Context',
              'Evidence of Learning',
              'Instructional Plan',
              'Output Requirements'
            ]
          },
          {
            num: 'Q3',
            question: 'After regenerating, what changed in the new output?',
            hint: 'Compare the two versions and describe what you notice.'
          },
          {
            num: 'Q4',
            question: 'What does this tell you about how prompt details affect AI output?',
            hint: 'Form a general principle from the small test you just ran.',
            starter: 'When I changed ________, the AI output became ________. This suggests that ________.'
          }
        ],
        systemPrompt: 'You are an expert EFL/ESL curriculum designer for multilingual classrooms. Create detailed, practical, classroom-ready lesson plans for language teachers. Include bilingual vocabulary when requested, using conversational rather than academic language. Follow all format and constraint requirements exactly.'
      },

      /* ── Step 6: Post-Test ─────────────────────────────── */
      {
        type: 'posttest',
        title: 'Post-Test',
        instruction: 'Read the scenario below. Write the exact prompt you would give to an AI to create a lesson plan based on this material.',
        scenario: {
          title: 'Scenario 5: The Tech Tug-of-War',
          topic: 'Screens in School (Benefits vs. Drawbacks)',
          learners: 'Level 4–5 (Expanding/Bridging) students.',
          foundational_literacy: 'Reading for Detail. Using the provided text to highlight "benefits" and "drawbacks" to improve analytical reading.',
          grammar_and_syntax: 'Conjunctions of Contrast (however, on the other hand, whereas) to link opposing viewpoints within a single paragraph.',
          vocabulary: {
            tier_1: ['Book', 'laptop', 'fast', 'easy', 'hard'],
            tier_2: ['Efficient', 'drawback', 'benefit', 'deployment', 'organized'],
            tier_3: ['Hyper-connected', 'Deployment', 'Pedagogical', 'Synchronous', 'Multimodal']
          },
          social_language: 'Negotiation and Compromise. Small group discussions where students must agree on a "balanced" rule for laptop use in the classroom.'
        },
        placeholder: 'Write your full prompt here, using the 5-part framework (Desired Results, Learner & Context, Evidence of Learning, Instructional Plan, Output Requirements)…'
      }

    ]
  },
  {
    id: 2, number: 2, kind: 'Co-Design Tool',
    title: 'Lesson Builder',
    description: 'Generate and refine daily lesson plans with the AI co-designer. Inputs become drafts in seconds.',
    icon: '🏗️', duration: 'Coming soon', steps: 0, progress: 0, status: 'notstarted',
    tint: '#FCE8DA', accent: '#E89461', illustration: 'crane',
    outcomes: [
      'Brief the AI with grade, level, and standard in under 90 seconds',
      'Edit lesson sections directly with tracked changes',
      'Export to PDF, Google Doc, or share-link for co-teachers',
    ],
    detailSteps: [], steps_data: []
  },
  {
    id: 3, number: 3, kind: 'Learning Module',
    title: 'Worksheet Workshop',
    description: 'Strategies for assignment worksheets that scaffold without shutting down talk.',
    icon: '📄', duration: 'Coming soon', steps: 0, progress: 0, status: 'notstarted',
    tint: '#DCEBF7', accent: '#5B95D4', illustration: 'pen',
    outcomes: [], detailSteps: [], steps_data: []
  },
  {
    id: 4, number: 4, kind: 'Co-Design Tool',
    title: 'Resource Generator',
    description: 'Build worksheets, rubrics, and reading passages on demand from your existing materials.',
    icon: '⚙️', duration: 'Coming soon', steps: 0, progress: 0, status: 'notstarted',
    tint: '#E5F0E0', accent: '#6BA259', illustration: 'gear',
    outcomes: [], detailSteps: [], steps_data: []
  },
  {
    id: 5, number: 5, kind: 'Learning Module',
    title: 'Evaluation Theory',
    description: 'Assessment fundamentals for multilingual learners — formative, summative, and everything between.',
    icon: '📊', duration: 'Coming soon', steps: 0, progress: 0, status: 'notstarted',
    tint: '#F7DDE3', accent: '#D26A82', illustration: 'chart',
    outcomes: [], detailSteps: [], steps_data: []
  },
  {
    id: 6, number: 6, kind: 'Co-Design Tool',
    title: 'Student Evaluator',
    description: 'Grade student work and surface patterns across a class with AI-assisted feedback.',
    icon: '📝', duration: 'Coming soon', steps: 0, progress: 0, status: 'notstarted',
    tint: '#FAEFC9', accent: '#C58B27', illustration: 'clipboard',
    outcomes: [], detailSteps: [], steps_data: []
  }
];

const SAVED_RESOURCES = [
  { id: 'r1', kind: 'worksheet', title: 'Past tense scaffolding — 7th gr.', meta: 'Worksheet · 2 pages', updated: '2 days ago', tint: '#DCEBF7', accent: '#5B95D4' },
  { id: 'r2', kind: 'rubric',    title: 'Speaking rubric (5 dimensions)',  meta: 'Rubric · ACTFL-aligned', updated: '5 days ago', tint: '#E8E4FB', accent: '#5B5CEC' },
  { id: 'r3', kind: 'worksheet', title: 'Reading: Wonder Ch. 1 vocab',     meta: 'Worksheet · 1 page',  updated: 'last week', tint: '#FCE8DA', accent: '#E89461' },
  { id: 'r4', kind: 'rubric',    title: 'Writing rubric — narrative',      meta: 'Rubric · 4 levels',   updated: 'last week', tint: '#E5F0E0', accent: '#6BA259' },
  { id: 'r5', kind: 'worksheet', title: 'Listening cloze — pop song',      meta: 'Worksheet · audio link', updated: '2 weeks ago', tint: '#F7DDE3', accent: '#D26A82' },
];

const WEEK_PROGRESS = [
  { lbl: 'M', state: 'done' },
  { lbl: 'T', state: 'done' },
  { lbl: 'W', state: 'done' },
  { lbl: 'T', state: 'today' },
  { lbl: 'F', state: 'idle' },
  { lbl: 'S', state: 'idle' },
  { lbl: 'S', state: 'idle' },
];
