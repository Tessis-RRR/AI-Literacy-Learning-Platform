/* ============================================================
   PromptCraft — All module content & data
   ============================================================ */

const MODULES = [
  /* ─────────────────────────────────────────────────────────
     MODULE 1 — Why Prompts Matter
     ───────────────────────────────────────────────────────── */
  {
    id: 1,
    title: 'Why Prompts Matter',
    description: 'Understand what makes a prompt effective and learn the 5-part framework that powers great AI outputs.',
    icon: '💡',
    duration: '~20 min',
    steps: 5,
    steps_data: [
      {
        type: 'info',
        title: 'What Is a Prompt?',
        content: `
          <p>Every time you type a message to an AI tool like ChatGPT or Claude, you are writing a <strong>prompt</strong>. A prompt is simply the instruction or question you give to an AI to tell it what you want.</p>
          <p>Think of it this way: the AI is like an incredibly knowledgeable teaching assistant who is waiting for your instructions. But unlike a human colleague, the AI has no prior knowledge of your classroom, your students, or your goals — <strong>unless you tell it</strong>.</p>
          <div class="callout info">
            <div class="callout-icon">💡</div>
            <div class="callout-body">
              <strong>Why does this matter?</strong>
              The quality of what the AI produces depends almost entirely on the quality of your prompt. A vague prompt gives a generic response. A structured prompt gives a targeted, usable response.
            </div>
          </div>
          <h3>Common teacher experiences with AI</h3>
          <p>Many teachers who try AI tools for the first time report frustration like:</p>
          <ul>
            <li>"The lesson plan it gave me was too generic."</li>
            <li>"I had to rewrite most of what it generated."</li>
            <li>"It didn't know my students' level at all."</li>
            <li>"The output was too long / too short / in the wrong format."</li>
          </ul>
          <p>These are all <strong>prompt problems</strong>, not AI problems. In this course, you will learn how to solve them.</p>
          <div class="callout success">
            <div class="callout-icon">🎯</div>
            <div class="callout-body">
              <strong>Your goal in this module</strong>
              By the end of Module 1, you will know the 5-part prompt framework and be able to tell the difference between a weak prompt and a strong one.
            </div>
          </div>
        `
      },
      {
        type: 'info',
        title: 'The 5-Part Framework',
        content: `
          <p>Effective prompts share a common structure. We call it the <strong>5-Part Framework</strong>. Each part gives the AI a different type of information it needs to produce exactly what you want.</p>
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
              <div class="fc-desc">Who are your students? Grade level, language proficiency, class size, any special needs?</div>
              <div class="fc-example">e.g. "I teach a Grade 8 ESL class of 28 students at B1 level."</div>
            </div>
            <div class="framework-card task">
              <div class="fc-label">Part 3</div>
              <div class="fc-name">Task</div>
              <div class="fc-desc">What specific thing do you want the AI to <em>create or do</em>?</div>
              <div class="fc-example">e.g. "Please create a 50-minute lesson plan."</div>
            </div>
            <div class="framework-card constraint">
              <div class="fc-label">Part 4</div>
              <div class="fc-name">Constraints</div>
              <div class="fc-desc">What limitations or requirements must the output follow?</div>
              <div class="fc-example">e.g. "No technology needed. Include pair work. Keep vocabulary at B1 level."</div>
            </div>
            <div class="framework-card output">
              <div class="fc-label">Part 5</div>
              <div class="fc-name">Output Format</div>
              <div class="fc-desc">How should the AI structure its response?</div>
              <div class="fc-example">e.g. "Format as a table with columns: Time, Activity, Materials, Teacher Notes."</div>
            </div>
          </div>
          <div class="callout info">
            <div class="callout-icon">📌</div>
            <div class="callout-body">
              <strong>You don't always need all five parts</strong>
              For simple tasks, 2–3 parts may be enough. But for teaching materials — lesson plans, activities, assessments — including all five parts consistently produces far better results.
            </div>
          </div>
        `
      },
      {
        type: 'comparison',
        title: 'Weak vs Strong Prompts',
        weakPrompt: `Make a lesson plan for teaching English.`,
        strongPrompt: `I am teaching a Grade 7 ESL class of 24 students at A2–B1 proficiency level. [CONTEXT]

My goal is for students to practise making suggestions and recommendations using "should" and "could". [GOAL]

Please create a complete 50-minute lesson plan. [TASK]

The lesson must not require internet access, should include at least one pair activity and one whole-class activity, and vocabulary should stay at A2–B1 level. [CONSTRAINTS]

Format the plan as a table with four columns: Time, Activity Description, Teacher Action, Student Action. [OUTPUT FORMAT]`,
        analysis: [
          { icon: '❌', label: 'No goal', desc: 'The weak prompt gives no learning objective. The AI must guess what "teaching English" means.' },
          { icon: '❌', label: 'No context', desc: 'Age, grade, class size, and language level are all missing. The AI cannot calibrate difficulty.' },
          { icon: '❌', label: 'Vague task', desc: '"Make a lesson plan" gives no time frame, topic focus, or activity type.' },
          { icon: '❌', label: 'No constraints', desc: 'Nothing limits the AI\'s choices — it can produce anything, including impractical ideas.' },
          { icon: '❌', label: 'No output format', desc: 'The AI will choose its own structure, which may not match how you work.' },
        ]
      },
      {
        type: 'quiz',
        title: 'Spot the Framework Elements',
        intro: 'Read the prompt below. Then answer the questions to identify each part of the 5-part framework.',
        prompt: `I teach a Grade 9 EFL class with 30 students at B1 level. My goal is for students to improve their ability to write a formal email requesting information. Please design a 45-minute writing workshop. The workshop should not require computers — students will write by hand. Include a model text analysis activity and a guided writing task. Present the plan as a numbered list of timed activities, each with a brief description.`,
        questions: [
          {
            question: 'Which sentence states the Goal?',
            answer: 1,
            options: [
              'I teach a Grade 9 EFL class with 30 students at B1 level.',
              'My goal is for students to improve their ability to write a formal email requesting information.',
              'Please design a 45-minute writing workshop.',
              'Present the plan as a numbered list of timed activities.'
            ]
          },
          {
            question: 'Which sentence provides the Context?',
            answer: 0,
            options: [
              'I teach a Grade 9 EFL class with 30 students at B1 level.',
              'My goal is for students to improve their ability to write a formal email requesting information.',
              'Please design a 45-minute writing workshop.',
              'The workshop should not require computers.'
            ]
          },
          {
            question: 'Which part describes the Constraints?',
            answer: 3,
            options: [
              'My goal is for students to write a formal email.',
              'Please design a 45-minute writing workshop.',
              'Present the plan as a numbered list.',
              'The workshop should not require computers — students will write by hand. Include a model text analysis activity and a guided writing task.'
            ]
          }
        ]
      },
      {
        type: 'info',
        title: 'Module 1 — Summary',
        content: `
          <div class="callout success">
            <div class="callout-icon">✅</div>
            <div class="callout-body">
              <strong>You completed Module 1!</strong>
              Here is a quick recap of what you learned.
            </div>
          </div>
          <h3>Key takeaways</h3>
          <ul>
            <li>A <strong>prompt</strong> is the instruction you give an AI. Its quality determines the quality of the output.</li>
            <li>The <strong>5-Part Framework</strong> gives you a reliable structure: Goal → Context → Task → Constraints → Output Format.</li>
            <li>Weak prompts are vague and produce generic results. Structured prompts produce targeted, usable materials.</li>
            <li>You are always the lead decision-maker. The AI follows your instructions — so clear instructions lead to better collaboration.</li>
          </ul>
          <h3>Coming up in Module 2</h3>
          <p>In the next module, you will study three <strong>worked examples</strong> of expert prompts — real prompts broken down component by component — so you can see exactly how the framework works in practice.</p>
          <div class="callout info">
            <div class="callout-icon">🧠</div>
            <div class="callout-body">
              <strong>Learning tip</strong>
              Research shows that studying worked examples before attempting your own work helps you build stronger mental models. That is exactly what Module 2 is designed for.
            </div>
          </div>
        `
      }
    ]
  },

  /* ─────────────────────────────────────────────────────────
     MODULE 2 — Worked Examples
     ───────────────────────────────────────────────────────── */
  {
    id: 2,
    title: 'Worked Examples',
    description: 'Study three expert prompts analysed step by step. See how each component shapes the AI output.',
    icon: '🔍',
    duration: '~20 min',
    steps: 5,
    steps_data: [
      {
        type: 'info',
        title: 'Learning from Expert Examples',
        content: `
          <p>One of the most effective ways to learn a new skill is to <strong>study how experts do it</strong> — not just read about it in theory.</p>
          <p>In this module, you will examine three <strong>worked examples</strong>: real prompts written for real teaching situations. Each prompt is broken into its 5 components, with an explanation of <em>why</em> each part was written the way it was.</p>
          <div class="callout info">
            <div class="callout-icon">🔬</div>
            <div class="callout-body">
              <strong>How to get the most from worked examples</strong>
              Don't just read — analyse. For each component, ask yourself: <em>"Could I apply this to my own teaching context?"</em> Note any ideas that come to mind.
            </div>
          </div>
          <h3>The three examples you will study</h3>
          <ul>
            <li><strong>Example 1</strong> — Generating a lesson plan for grammar instruction</li>
            <li><strong>Example 2</strong> — Designing a speaking activity for a conversation class</li>
            <li><strong>Example 3</strong> — Adapting a reading text for different proficiency levels</li>
          </ul>
          <p>As you work through each example, notice how the five parts fit together to guide the AI toward a precise, useful output.</p>
        `
      },
      {
        type: 'annotated',
        title: 'Example 1 — Grammar Lesson Plan',
        scenario: 'A middle school ESL teacher wants a lesson plan for teaching the present perfect tense.',
        components: [
          {
            type: 'context',
            label: 'Context',
            text: 'I am teaching a Grade 8 ESL class of 26 students at A2–B1 proficiency level. Most students speak Mandarin as their first language and tend to confuse the present perfect with the simple past.',
            explanation: 'Mentioning both the proficiency level AND the common error (L1 interference) tells the AI to design activities that specifically address this confusion — not just generic present perfect practice.'
          },
          {
            type: 'goal',
            label: 'Goal',
            text: 'My goal is for students to correctly use the present perfect (have/has + past participle) to describe life experiences using "ever" and "never".',
            explanation: 'The goal is narrow and specific — life experiences with "ever/never" rather than all uses of the present perfect. A focused goal produces a focused lesson, not an overwhelming overview.'
          },
          {
            type: 'task',
            label: 'Task',
            text: 'Please create a complete 50-minute lesson plan.',
            explanation: 'The task is direct. Specifying "complete" signals that the AI should include all lesson stages (warm-up, presentation, practice, production), not just an activity idea.'
          },
          {
            type: 'constraint',
            label: 'Constraints',
            text: 'The lesson should include a short grammar explanation, a controlled practice activity, and a communicative speaking task. No technology required. Keep all example sentences within A2–B1 vocabulary.',
            explanation: 'Constraints shape the design. "No technology" is a practical classroom restriction. Specifying three activity types prevents the AI from producing a lesson that is all one type (e.g. only worksheet exercises).'
          },
          {
            type: 'output',
            label: 'Output Format',
            text: 'Format the lesson plan as a table with four columns: Time, Stage, Activity Description, and Teaching Notes.',
            explanation: 'A table format is practical for teachers — it is easy to print, read at a glance, and adapt. Specifying column names means the output will match exactly how you want to use it.'
          }
        ]
      },
      {
        type: 'annotated',
        title: 'Example 2 — Speaking Activity',
        scenario: 'An EFL teacher wants a communicative speaking activity for an intermediate adult class.',
        components: [
          {
            type: 'context',
            label: 'Context',
            text: 'I am teaching a B1–B2 adult EFL class of 16 students at a language centre. Students are professionals (mixed industries) aged 25–45. They are motivated but sometimes reluctant to speak due to fear of making mistakes.',
            explanation: 'This context gives the AI crucial information: adult learners, professional backgrounds, and a specific classroom challenge (reluctance to speak). This shapes both the topic and the design of the activity.'
          },
          {
            type: 'goal',
            label: 'Goal',
            text: 'My goal is for students to practise expressing opinions and agreeing/disagreeing politely in English.',
            explanation: 'The goal names the specific communicative function (expressing opinions, agreeing/disagreeing) rather than a grammar point. This tells the AI the activity should be opinion-driven, not accuracy-focused.'
          },
          {
            type: 'task',
            label: 'Task',
            text: 'Please create a 20-minute discussion activity.',
            explanation: 'Specifying 20 minutes prevents the AI from generating an activity that would take a full lesson. Clear time constraints make outputs immediately classroom-ready.'
          },
          {
            type: 'constraint',
            label: 'Constraints',
            text: 'The topic should be professionally relevant but not too sensitive (avoid politics and religion). Include discussion questions at three levels: opening, expanding, and challenging. Provide a short language box with 8–10 useful expressions for agreeing and disagreeing politely.',
            explanation: 'Three types of constraints here: topic sensitivity (professionally appropriate), activity structure (three question levels), and a scaffolding tool (language box). Each constraint makes the activity more directly usable.'
          },
          {
            type: 'output',
            label: 'Output Format',
            text: 'Present the activity as a student handout: topic introduction (2–3 sentences), language box, then three sets of questions (Opening, Expanding, Challenging), each with 3 questions.',
            explanation: 'Asking for a "student handout" format means the output is ready to print and distribute — no reformatting needed. Specifying exactly 3 questions per set produces a well-paced, balanced activity.'
          }
        ]
      },
      {
        type: 'annotated',
        title: 'Example 3 — Reading Adaptation',
        scenario: 'A teacher wants to adapt a news article for students at different proficiency levels.',
        components: [
          {
            type: 'context',
            label: 'Context',
            text: 'I have a mixed-ability Grade 9 English class with students ranging from A2 to B2 proficiency. I want to use the same topic for all students to allow whole-class discussion.',
            explanation: 'This context identifies a specific classroom challenge: mixed ability. The teacher wants differentiation without fragmenting the class into completely different lessons. This is important information for the AI.'
          },
          {
            type: 'goal',
            label: 'Goal',
            text: 'My goal is for all students to read about the same topic (climate change) and be able to participate in a brief class discussion.',
            explanation: 'The goal makes the teacher\'s priority clear: inclusion and participation, not just comprehension. This signals that the AI should prioritise accessibility and engagement over linguistic complexity.'
          },
          {
            type: 'task',
            label: 'Task',
            text: 'Please create two versions of a short reading text (150–180 words each) on the impact of climate change on daily life.',
            explanation: 'Two versions, same topic, specified word count. Clear and efficient. The AI now knows exactly how many outputs to produce and what constraints each must meet.'
          },
          {
            type: 'constraint',
            label: 'Constraints',
            text: 'Version A should use A2–B1 vocabulary with short sentences (maximum 15 words per sentence) and simple grammar. Version B should use B1–B2 vocabulary with varied sentence structures. Both versions should cover the same key ideas so all students can discuss together.',
            explanation: 'These constraints do the heavy differentiation work: vocabulary level, sentence length, and grammar complexity are all specified for each version. The shared content requirement is the key insight that makes whole-class discussion possible.'
          },
          {
            type: 'output',
            label: 'Output Format',
            text: 'Present Version A first with the label "Version A (Foundation)", then Version B with the label "Version B (Extension)". After both texts, provide 3 comprehension questions suitable for both versions.',
            explanation: 'Clear labelling makes printing and distributing simple. Shared comprehension questions reinforce the goal of whole-class participation — all students can answer the same questions despite reading different texts.'
          }
        ]
      },
      {
        type: 'builder',
        title: 'Build Your First Structured Prompt',
        intro: 'Now it is your turn. Use the prompt builder below to construct a structured prompt for a teaching task of your choice. Fill in each field and watch your prompt take shape.',
        fields: [
          { key: 'context',    label: 'Context',      type: 'context',    placeholder: 'Describe your class: grade level, age, class size, language level, any special characteristics…' },
          { key: 'goal',       label: 'Goal',         type: 'goal',       placeholder: 'What do you want students to learn or be able to do by the end?' },
          { key: 'task',       label: 'Task',         type: 'task',       placeholder: 'What specific thing do you want the AI to create? (e.g. "Please create a 45-minute lesson plan")' },
          { key: 'constraint', label: 'Constraints',  type: 'constraint', placeholder: 'Any requirements or limitations? (e.g. no technology, include pair work, vocabulary level…)' },
          { key: 'output',     label: 'Output Format',type: 'output',     placeholder: 'How should the output be structured? (e.g. table, numbered list, student handout…)' }
        ]
      }
    ]
  },

  /* ─────────────────────────────────────────────────────────
     MODULE 3 — Situated Learning
     ───────────────────────────────────────────────────────── */
  {
    id: 3,
    title: 'Situated Practice',
    description: 'Write real prompts for three authentic teaching scenarios and receive live AI responses.',
    icon: '✍️',
    duration: '~20 min',
    steps: 4,
    steps_data: [
      {
        type: 'info',
        title: 'Practice in Real Contexts',
        content: `
          <p>Reading about prompting and studying examples builds your knowledge. But real skill only develops through <strong>doing</strong>.</p>
          <p>In this module, you will write prompts for three authentic teaching scenarios — situations that reflect real challenges language teachers face. After you write each prompt, you will send it to an AI and see the response.</p>
          <div class="callout warning">
            <div class="callout-icon">✏️</div>
            <div class="callout-body">
              <strong>This is where the learning happens</strong>
              Don't skip ahead or copy from the examples. Write your own prompt first. If you get a poor response, analyse why — that is one of the most valuable learning experiences in this course.
            </div>
          </div>
          <h3>The three scenarios</h3>
          <ul>
            <li><strong>Scenario 1</strong> — Generate a lesson plan for a grammar or vocabulary topic of your choice</li>
            <li><strong>Scenario 2</strong> — Design a classroom speaking or discussion activity</li>
            <li><strong>Scenario 3</strong> — Create or adapt a reading task for your students</li>
          </ul>
          <h3>Tips for this module</h3>
          <ul>
            <li>Apply the 5-part framework to each prompt</li>
            <li>Be specific about your students — use your actual class if possible</li>
            <li>If you receive a response that is too generic, revise your prompt and try again</li>
            <li>Think of the AI as a draft creator — you review and refine the output</li>
          </ul>
        `
      },
      {
        type: 'playground',
        title: 'Scenario 1 — Lesson Plan',
        scenario: {
          tag: 'Scenario 1',
          title: 'Generate a Lesson Plan',
          description: 'Choose a grammar point, vocabulary set, or language skill you are currently teaching. Write a prompt using the 5-part framework to ask the AI to create a lesson plan for your class.'
        },
        systemPrompt: 'You are an expert EFL/ESL curriculum designer. Create detailed, practical, classroom-ready lesson plans and teaching materials for language teachers. Use clear headings, structured formats, and age-appropriate content. Always tailor your response to the specific class described in the prompt.',
        placeholder: `Example structure to guide you:

I am teaching [describe your class: grade, size, proficiency level].
My goal is for students to [specific learning objective].
Please create a [duration]-minute lesson plan [for topic].
[Constraints: what the lesson must/must not include]
Format the plan as [table / numbered list / etc.] with [columns/sections].`,
        hint: 'Remember the 5 parts: Context → Goal → Task → Constraints → Output Format. The more specific you are, the more usable the output will be.'
      },
      {
        type: 'playground',
        title: 'Scenario 2 — Speaking Activity',
        scenario: {
          tag: 'Scenario 2',
          title: 'Design a Speaking Activity',
          description: 'Think of a communicative goal you want your students to achieve — expressing preferences, debating, storytelling, giving instructions, etc. Write a prompt to generate a speaking or discussion activity.'
        },
        systemPrompt: 'You are an expert EFL/ESL curriculum designer specialising in communicative language teaching. Create engaging, interactive speaking activities that are realistic for classroom use. Include clear instructions, timing guidance, and any language support needed.',
        placeholder: `Example structure to guide you:

I am teaching [describe your class].
My goal is for students to practise [specific speaking skill or function].
Please create a [duration]-minute speaking activity.
[Constraints: grouping, topics to avoid, scaffolding needed, etc.]
Format the activity as [student handout / teacher instructions / etc.].`,
        hint: 'For speaking activities, it helps to specify: grouping (pairs, groups, whole class), any language support needed (e.g. a phrase bank), and whether the activity is competitive, collaborative, or open discussion.'
      },
      {
        type: 'playground',
        title: 'Scenario 3 — Reading Task',
        scenario: {
          tag: 'Scenario 3',
          title: 'Create or Adapt a Reading Task',
          description: 'Ask the AI to create original reading material or adapt a topic for your students. You could request a text with comprehension questions, a graded reader passage, or a differentiated version for mixed-ability groups.'
        },
        systemPrompt: 'You are an expert EFL/ESL materials writer. Create engaging, level-appropriate reading texts and accompanying tasks for language learners. Ensure vocabulary, sentence structure, and topic are suitable for the specified proficiency level. Include clear comprehension and language tasks.',
        placeholder: `Example structure to guide you:

I am teaching [describe your class].
My goal is for students to [reading skill: skim for main idea, scan for details, understand vocabulary in context, etc.].
Please create [a reading text / two versions of a text] on the topic of [topic].
[Constraints: word count, vocabulary level, sentence complexity, etc.]
Format as [student worksheet with text + questions / two labelled versions / etc.].`,
        hint: 'Specifying the reading purpose (skim, scan, infer, etc.) helps the AI choose the right type of text and comprehension questions. A news-style article, a narrative, and a description all require different question types.'
      }
    ]
  },

  /* ─────────────────────────────────────────────────────────
     MODULE 4 — Reflection & Transfer
     ───────────────────────────────────────────────────────── */
  {
    id: 4,
    title: 'Reflection & Transfer',
    description: 'Reflect on what you have learned, analyse your prompting choices, and apply the framework beyond teaching.',
    icon: '🔄',
    duration: '~20 min',
    steps: 4,
    steps_data: [
      {
        type: 'info',
        title: 'Why Reflection Matters',
        content: `
          <p>You have now written prompts and received real AI responses. But learning does not stop when you get an output — it deepens when you <strong>think critically about what happened</strong>.</p>
          <p>Reflection is where you move from following a framework to <em>understanding</em> it. When you can explain <em>why</em> one prompt worked better than another, you have genuinely internalised the skill.</p>
          <div class="callout info">
            <div class="callout-icon">🧠</div>
            <div class="callout-body">
              <strong>The learning science behind this</strong>
              Reflection activates metacognition — the ability to think about your own thinking. Research consistently shows that learners who reflect on their performance transfer skills more effectively to new situations than those who practise without reflection.
            </div>
          </div>
          <h3>What you will do in this module</h3>
          <ul>
            <li>Answer guided reflection questions about your prompting practice in Module 3</li>
            <li>Analyse how specific prompt elements influenced the AI outputs you received</li>
            <li>Complete a <strong>Transfer Challenge</strong> — apply the 5-part framework to a context <em>outside</em> of teaching</li>
          </ul>
          <p>The transfer challenge is the final test of whether you have truly understood prompt structure as a <strong>general thinking skill</strong>, not just a teaching tool.</p>
        `
      },
      {
        type: 'reflection',
        title: 'Reflecting on Your Prompts',
        intro: 'Think back to the three prompts you wrote in Module 3. Answer the following questions as honestly and specifically as you can. There are no right or wrong answers — the goal is to build awareness.',
        questions: [
          {
            num: 'Q1',
            question: 'Look at the AI response you received for Scenario 1 (Lesson Plan). Was it immediately usable, or did it need significant editing? What do you think caused the quality of that response?'
          },
          {
            num: 'Q2',
            question: 'Which of the 5 parts (Goal, Context, Task, Constraints, Output Format) do you think had the biggest influence on the quality of your outputs? Why?'
          },
          {
            num: 'Q3',
            question: 'Was there any part of the framework that you found difficult or forgot to include? How did leaving it out affect the output?'
          },
          {
            num: 'Q4',
            question: 'If you could rewrite one of your three prompts from Module 3, which would it be and what would you change?'
          }
        ]
      },
      {
        type: 'reflection',
        title: 'Analysing Prompt Choices',
        intro: 'These questions ask you to think more deeply about the relationship between specific prompt decisions and AI outputs.',
        questions: [
          {
            num: 'Q5',
            question: 'The "Output Format" component often has a surprisingly large effect on how useful a response is. Did you specify an output format in your prompts? How did it affect the structure of the AI\'s response?'
          },
          {
            num: 'Q6',
            question: 'The "Context" component tells the AI about your students. If you gave detailed student context, did the AI\'s response reflect it? Give a specific example from your practice.'
          },
          {
            num: 'Q7',
            question: 'How would you modify the prompt from Scenario 2 (Speaking Activity) to make it suitable for a lower-proficiency class or a much younger age group? What specifically would you change?'
          }
        ]
      },
      {
        type: 'transfer',
        title: 'Transfer Challenge',
        intro: 'The final step is to prove to yourself that prompt structure is a general skill, not just a teaching tool.',
        challenge: {
          title: 'Apply the Framework Outside Teaching',
          description: 'Choose ONE of the following non-teaching scenarios and write a structured prompt using the 5-part framework. Then send it to the AI and evaluate the response.',
          scenarios: [
            { icon: '📅', label: 'Personal planning', desc: 'Ask the AI to help you plan a monthly personal goal-tracking system.' },
            { icon: '✉️', label: 'Professional writing', desc: 'Ask the AI to help you draft a professional email to a parent about a student concern.' },
            { icon: '📊', label: 'Meeting preparation', desc: 'Ask the AI to create an agenda and talking points for a departmental meeting.' },
            { icon: '🍽️', label: 'Personal task', desc: 'Ask the AI to create a two-week meal plan for a household with dietary restrictions you specify.' }
          ]
        },
        systemPrompt: 'You are a helpful, practical AI assistant. Provide clear, well-structured, actionable responses to the user\'s request. Follow any format or structure specified in the prompt.',
        placeholder: `Write your structured prompt here.

Remember to include all 5 parts:
1. Context — who you are, what situation you are in
2. Goal — what you want to achieve
3. Task — what you want the AI to create or do
4. Constraints — limitations or requirements
5. Output Format — how you want the response structured`,
        hint: 'If the framework works here — outside teaching — then you have genuinely internalised it as a thinking skill, not just a classroom technique.',
        reflection: {
          question: 'After receiving the AI\'s response to your transfer challenge: Did the 5-part framework help you get a better result than if you had just written a simple request? What does this tell you about the nature of prompt structure?',
          num: 'Final Reflection'
        }
      }
    ]
  }
];
