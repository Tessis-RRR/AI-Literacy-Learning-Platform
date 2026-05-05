/**
 * Module 2: Lesson Builder - Frontend API Client Example
 * 
 * This example shows how to interact with the Module 2 API endpoints
 * from the frontend React application.
 */

class Module2Client {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Start a new Module 2 session
   */
  async startSession(userId = null, participantId = null) {
    const response = await fetch(`${this.baseUrl}/module2/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, participantId })
    });
    return response.json();
  }

  /**
   * Save the five-part context survey
   */
  async saveContext(sessionId, contextData) {
    const response = await fetch(`${this.baseUrl}/module2/save-context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, contextData })
    });
    return response.json();
  }

  /**
   * Generate the full lesson draft
   */
  async generateLesson(sessionId) {
    const response = await fetch(`${this.baseUrl}/module2/generate-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    return response.json();
  }

  /**
   * Evaluate the lesson draft and get feedback
   */
  async evaluateDraft(sessionId) {
    const response = await fetch(`${this.baseUrl}/module2/evaluate-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    return response.json();
  }

  /**
   * Revise the lesson based on quick action or custom request
   */
  async reviseLesson(sessionId, quickAction = null, customRequest = null) {
    const response = await fetch(`${this.baseUrl}/module2/revise-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, quickAction, customRequest })
    });
    return response.json();
  }

  /**
   * Finalize and save the lesson
   */
  async finalizeLesson(sessionId, finalLesson) {
    const response = await fetch(`${this.baseUrl}/module2/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, finalLesson })
    });
    return response.json();
  }
}

/**
 * Example Usage in React Component
 */
const Module2Example = () => {
  const client = new Module2Client();
  const [sessionId, setSessionId] = React.useState(null);
  const [lesson, setLesson] = React.useState(null);
  const [feedback, setFeedback] = React.useState(null);

  // Step 1: Start session
  const handleStart = async () => {
    const { sessionId } = await client.startSession(
      1, // userId
      'teacher_xyz' // participantId
    );
    setSessionId(sessionId);
  };

  // Step 2: Save context
  const handleSaveContext = async () => {
    const contextData = {
      desiredResults: {
        languageFocus: 'Speaking',
        studentOutcomeType: 'Students can describe something'
      },
      learnerContext: {
        englishProficiencyLevel: 'L2',
        classroomFactor: 'Mixed proficiency levels'
      },
      evidenceOfLearning: {
        demonstrationType: 'Say a sentence or short response',
        evidenceFocus: 'Clear communication'
      },
      instructionalPlan: {
        lessonStructure: 'Warm-up → Model → Guided practice → Independent practice → Exit ticket',
        scaffold: 'Sentence frames'
      },
      outputRequirements: {
        outputType: 'Full lesson plan',
        detailLevel: 'Standard lesson plan'
      },
      requiredLearningGoal: 'Students will be able to describe their favorite season using two adjectives and one complete sentence frame.',
      requiredLocalContext: '7th grade students, mostly L2–L3, shy when speaking English, projector available, no student devices'
    };

    await client.saveContext(sessionId, contextData);
  };

  // Step 3: Generate lesson
  const handleGenerateLesson = async () => {
    const { lessonDraft } = await client.generateLesson(sessionId);
    setLesson(lessonDraft);
  };

  // Step 4: Evaluate draft
  const handleEvaluateDraft = async () => {
    const { sectionFeedback } = await client.evaluateDraft(sessionId);
    setFeedback(sectionFeedback);
  };

  // Step 5: Revise with quick action
  const handleReviseWithQuickAction = async (action) => {
    const { revisedLesson, sectionFeedback } = await client.reviseLesson(
      sessionId,
      action, // quickAction
      null    // customRequest
    );
    setLesson(revisedLesson);
    setFeedback(sectionFeedback);
  };

  // Step 6: Finalize
  const handleFinalize = async () => {
    await client.finalizeLesson(sessionId, lesson);
    alert('Lesson saved!');
  };

  return (
    <div className="module2-container">
      <h1>ESL Lesson Builder (Module 2)</h1>

      <section className="controls">
        <button onClick={handleStart}>1. Start Session</button>
        <button onClick={handleSaveContext} disabled={!sessionId}>2. Save Context</button>
        <button onClick={handleGenerateLesson} disabled={!sessionId}>3. Generate Lesson</button>
        <button onClick={handleEvaluateDraft} disabled={!sessionId}>4. Evaluate Draft</button>
      </section>

      {lesson && (
        <section className="lesson-display">
          <h2>{lesson.lesson_title}</h2>
          <div>{lesson.desired_results}</div>
          <div>{lesson.learner_context}</div>
          <div>{lesson.evidence_of_learning}</div>
          <div>{lesson.instructional_plan}</div>
          <div>{lesson.output_requirements}</div>

          <div className="quick-actions">
            <button onClick={() => handleReviseWithQuickAction('Make it easier')}>Make it easier</button>
            <button onClick={() => handleReviseWithQuickAction('Make it more challenging')}>Make it more challenging</button>
            <button onClick={() => handleReviseWithQuickAction('Add more scaffolding')}>Add more scaffolding</button>
            <button onClick={() => handleReviseWithQuickAction('Make activities more interactive')}>Make activities more interactive</button>
            <button onClick={() => handleReviseWithQuickAction('Shorten the lesson')}>Shorten the lesson</button>
            <button onClick={() => handleReviseWithQuickAction('Add bilingual support')}>Add bilingual support</button>
          </div>

          <button onClick={handleFinalize} className="finalize-btn">Accept & Save Lesson</button>
        </section>
      )}

      {feedback && (
        <section className="feedback-display">
          <h3>Section Feedback</h3>
          {Object.entries(feedback).map(([section, data]) => (
            <div key={section} className="feedback-card">
              <h4>{section}</h4>
              <p><strong>What works:</strong> {data.what_works}</p>
              <p><strong>What to improve:</strong> {data.what_to_improve}</p>
              <p><strong>Suggested adjustment:</strong> {data.suggested_adjustment}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default Module2Example;
