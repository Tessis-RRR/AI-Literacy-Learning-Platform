# Module 2: Lesson Builder — Implementation Guide

## Overview

Module 2 is a chat-based lesson planning module for ESL Co-Pilot that helps middle school ESL teachers create classroom-ready lesson plans through an LLM conversation interface. It builds directly on Module 1's **5-Part Prompt Framework**.

## Architecture

### Backend Models

#### `Module2Session`
Tracks the overall state of a Module 2 lesson-building session.

```python
class Module2Session(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    participant_id = models.TextField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    current_step = models.CharField(max_length=100, choices=STEP_CHOICES)
    completion_status = models.CharField(max_length=50, choices=COMPLETION_CHOICES)
    
    global_context_json = models.JSONField(default=dict)
    generated_lesson_json = models.JSONField(default=dict)
    revised_lesson_json = models.JSONField(default=dict)
    final_lesson_json = models.JSONField(default=dict)
    section_feedback_json = models.JSONField(default=dict)
```

**Step Flow:**
- `opening` → Initial message
- `desired_results` → Learning goal questions
- `learner_context` → Student/classroom context questions
- `evidence_of_learning` → Assessment questions
- `instructional_plan` → Lesson structure questions
- `output_requirements` → Output format questions
- `context_summary` → Review before generation
- `lesson_generation` → Creating draft
- `local_adjustment` → Revision workspace
- `final_review` → Accept or save
- `completed` → Session finished

#### `GlobalContextSurvey`
Stores the teacher's responses to the 5-part framework questions.

```python
class GlobalContextSurvey(models.Model):
    session = models.OneToOneField(Module2Session, on_delete=models.CASCADE)
    
    desired_results = models.JSONField(default=dict)
    learner_context = models.JSONField(default=dict)
    evidence_of_learning = models.JSONField(default=dict)
    instructional_plan = models.JSONField(default=dict)
    output_requirements = models.JSONField(default=dict)
    
    required_learning_goal_text = models.TextField()
    required_local_context_text = models.TextField()
```

### API Endpoints

All endpoints are mounted at `/api/` path prefix.

#### `POST /api/module2/start`
**Purpose:** Create a new Module 2 session

**Request:**
```json
{
  "userId": 123,
  "participantId": "user_xyz"
}
```

**Response:**
```json
{
  "sessionId": 1,
  "currentStep": "opening",
  "status": "in_progress"
}
```

---

#### `POST /api/module2/save-context`
**Purpose:** Save the five-part context survey

**Request:**
```json
{
  "sessionId": 1,
  "contextData": {
    "desiredResults": {
      "languageFocus": "Speaking",
      "studentOutcomeType": "Students can describe something"
    },
    "learnerContext": {
      "englishProficiencyLevel": "L2",
      "classroomFactor": "Mixed proficiency levels"
    },
    "evidenceOfLearning": {
      "demonstrationType": "Say a sentence or short response",
      "evidenceFocus": "Clear communication"
    },
    "instructionalPlan": {
      "lessonStructure": "Warm-up → Model → Guided practice → Independent practice → Exit ticket",
      "scaffold": "Sentence frames"
    },
    "outputRequirements": {
      "outputType": "Full lesson plan",
      "detailLevel": "Standard lesson plan"
    },
    "requiredLearningGoal": "Students will be able to describe their favorite season using two adjectives and one complete sentence frame.",
    "requiredLocalContext": "7th grade students, mostly L2–L3, shy when speaking English, projector available, no student devices"
  }
}
```

**Response:**
```json
{
  "success": true,
  "contextSummary": "Here's what I'll use to build your lesson...",
  "currentStep": "context_summary"
}
```

---

#### `POST /api/module2/generate-lesson`
**Purpose:** Generate the full lesson draft from collected context

**Request:**
```json
{
  "sessionId": 1
}
```

**Response:**
```json
{
  "lessonDraft": {
    "lesson_title": "Describing Seasons with Sensory Adjectives",
    "desired_results": "Students will be able to describe a season using two sensory adjectives and a complete sentence frame.",
    "learner_context": "L2–L3 middle school students who are shy about speaking; projector available, no individual devices.",
    "evidence_of_learning": "Students will complete an exit ticket describing a season orally in pairs, using the provided sentence frame.",
    "instructional_plan": "...",
    "output_requirements": "Standard full lesson plan",
    "materials": "...",
    "teacher_notes": "..."
  },
  "currentStep": "lesson_generation"
}
```

---

#### `POST /api/module2/evaluate-draft`
**Purpose:** Evaluate the lesson draft across the 5-Part Framework and return feedback

**Request:**
```json
{
  "sessionId": 1
}
```

**Response:**
```json
{
  "sectionFeedback": {
    "desired_results": {
      "what_works": "The objective is student-centered and observable.",
      "what_to_improve": "The goal may be too broad for one class period.",
      "suggested_adjustment": "Narrow the outcome to one speaking task using one sentence frame."
    },
    "learner_context": {
      "what_works": "Context reflects the shy students and projector-only setup.",
      "what_to_improve": "Could specify time constraints more clearly.",
      "suggested_adjustment": "Add estimated time for each activity."
    },
    "evidence_of_learning": {...},
    "instructional_plan": {...},
    "output_requirements": {...}
  },
  "currentStep": "local_adjustment"
}
```

---

#### `POST /api/module2/revise-lesson`
**Purpose:** Revise the lesson based on quick action or custom request

**Request:**
```json
{
  "sessionId": 1,
  "quickAction": "Make it easier",
  "customRequest": null
}
```

OR

```json
{
  "sessionId": 1,
  "quickAction": null,
  "customRequest": "My students are shy, so reduce whole-class speaking and add more pair practice first."
}
```

**Response:**
```json
{
  "revisedLesson": {
    "lesson_title": "...",
    "desired_results": "...",
    "learner_context": "...",
    "evidence_of_learning": "...",
    "instructional_plan": "...",
    "output_requirements": "...",
    "materials": "...",
    "teacher_notes": "..."
  },
  "sectionFeedback": {
    "desired_results": {...},
    "learner_context": {...},
    "evidence_of_learning": {...},
    "instructional_plan": {...},
    "output_requirements": {...}
  }
}
```

---

#### `POST /api/module2/finalize`
**Purpose:** Finalize and save the accepted lesson

**Request:**
```json
{
  "sessionId": 1,
  "finalLesson": {
    "lesson_title": "...",
    "desired_results": "...",
    ...
  }
}
```

**Response:**
```json
{
  "success": true,
  "currentStep": "completed",
  "completionStatus": "completed"
}
```

---

## Frontend Components (To Be Built)

The frontend should implement these React components:

1. **Module2ChatShell** — Main container for the chat interface
2. **Module2OpeningMessage** — Initial welcome screen
3. **FivePartProgressBar** — Visual indicator of progress through 5 parts
4. **ChatMessage** — Individual message in the conversation
5. **QuickReplyButtons** — Multiple-choice question buttons
6. **OpenEndedInput** — Text input for required questions
7. **ContextSummaryCard** — Display of collected context
8. **LessonDraftSidePanel** — Preview of generated lesson
9. **LocalAdjustmentPage** — One-page revision workspace with full lesson + feedback + buttons
10. **SectionFeedbackPanel** — Displays feedback for all 5 parts
11. **SectionFeedbackCard** — Individual feedback card
12. **FinalLessonPreview** — Final lesson display
13. **Module2Completion** — Success screen

## Frontend State Management

```javascript
const [currentStage, setCurrentStage] = useState("opening");
const [contextData, setContextData] = useState({
  desiredResults: { languageFocus: "", studentOutcomeType: "", requiredLearningGoalText: "" },
  learnerContext: { englishProficiencyLevel: "", classroomFactor: "", requiredLocalContextText: "" },
  evidenceOfLearning: { demonstrationType: "", evidenceFocus: "" },
  instructionalPlan: { lessonStructure: "", scaffold: "" },
  outputRequirements: { outputType: "", detailLevel: "" },
});
const [lessonDraft, setLessonDraft] = useState(null);
const [sectionFeedback, setSectionFeedback] = useState({
  desiredResults: null,
  learnerContext: null,
  evidenceOfLearning: null,
  instructionalPlan: null,
  outputRequirements: null,
});
const [revisedLesson, setRevisedLesson] = useState(null);
```

## Quick Actions for Local Adjustment

- `Make it easier` — Simplify activities and reduce vocabulary demand
- `Make it more challenging` — Add depth and complexity
- `Add more scaffolding` — Include sentence frames, word banks, visuals
- `Make activities more interactive` — Increase pair/group work, reduce passive listening
- `Shorten the lesson` — Reduce activities, compress timeline
- `Add bilingual support` — Include L1 keywords, translations
- `Make it more printable` — Format for easy printing
- `Edit manually` — Open for custom text editing
- `Regenerate Draft` — Start over with a new draft

## Usage Flow

```
1. Teacher clicks "Start Lesson Builder"
   → Create Module2Session, set to "opening"
   → Display opening message and "Start" button

2. Teacher clicks "Start"
   → Move through 5-part questions (one part at a time)
   → Collect responses in contextData

3. Teacher submits all context
   → POST /api/module2/save-context
   → Display summary, buttons: "Generate Lesson" or "Edit Context"

4. Teacher clicks "Generate Lesson"
   → POST /api/module2/generate-lesson
   → Display lesson draft in side panel
   → Move to local adjustment

5. Evaluate draft
   → POST /api/module2/evaluate-draft
   → Display feedback cards for all 5 parts
   → Show quick action buttons + custom request box

6. Teacher selects quick action or types custom request
   → POST /api/module2/revise-lesson
   → Display revised lesson and updated feedback on same page
   → Allow multiple revisions

7. Teacher clicks "Accept Lesson"
   → POST /api/module2/finalize
   → Save final lesson to session
   → Show completion screen with options to export/share
```

## Error Handling

All endpoints return:
- **200 OK** with data on success
- **404 Not Found** if session doesn't exist
- **500 Internal Server Error** for system failures
- **503 Service Unavailable** if OpenAI key is not configured

## Environment Variables Required

```
OPENAI_API_KEY=sk-...
GENERATE_MODEL=gpt-4-turbo (or similar)
EVAL_MODEL=gpt-4-turbo (or similar)
GENERATE_MAX_TOKENS=3000
```

## Testing the Endpoints

### Using cURL

```bash
# Start a session
curl -X POST http://localhost:8000/api/module2/start \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "participantId": "test_user"}'

# Save context
curl -X POST http://localhost:8000/api/module2/save-context \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": 1,
    "contextData": {...}
  }'

# Generate lesson
curl -X POST http://localhost:8000/api/module2/generate-lesson \
  -H "Content-Type: application/json" \
  -d '{"sessionId": 1}'

# Evaluate draft
curl -X POST http://localhost:8000/api/module2/evaluate-draft \
  -H "Content-Type: application/json" \
  -d '{"sessionId": 1}'

# Revise lesson
curl -X POST http://localhost:8000/api/module2/revise-lesson \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": 1,
    "quickAction": "Make it easier"
  }'

# Finalize
curl -X POST http://localhost:8000/api/module2/finalize \
  -H "Content-Type: application/json" \
  -d '{"sessionId": 1, "finalLesson": {...}}'
```

## Database Schema

```sql
-- Module 2 Sessions
CREATE TABLE module2_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  participant_id TEXT,
  started_at DATETIME,
  completed_at DATETIME NULL,
  current_step VARCHAR(100),
  completion_status VARCHAR(50),
  global_context_json JSON,
  generated_lesson_json JSON,
  revised_lesson_json JSON,
  final_lesson_json JSON,
  section_feedback_json JSON
);

-- Global Context Surveys
CREATE TABLE global_context_surveys (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT UNIQUE,
  desired_results JSON,
  learner_context JSON,
  evidence_of_learning JSON,
  instructional_plan JSON,
  output_requirements JSON,
  required_learning_goal_text TEXT,
  required_local_context_text TEXT,
  created_at DATETIME,
  updated_at DATETIME
);
```

## MVP Acceptance Criteria Status

✅ Data models created and migrated  
✅ All 6 core API endpoints implemented  
✅ OpenAI integration for generation and evaluation  
✅ 5-Part Framework context collection  
✅ Lesson generation from context  
✅ Section feedback evaluation  
✅ Revision support with quick actions and custom requests  
⏳ Frontend components (to be built)  
⏳ Integration tests  
⏳ E2E tests  

## Next Steps

1. **Build Frontend Components** — Implement React components for chat interface
2. **Integrate with Main App** — Wire Module 2 into the main navigation/routing
3. **Add Admin Panel** — Create Django admin interface for viewing sessions
4. **Implement Export** — Add PDF/Word export functionality
5. **Add Analytics** — Track teacher workflows and lesson generation patterns
6. **Localization** — Prepare for multi-language support

---

*Generated: May 4, 2026*
