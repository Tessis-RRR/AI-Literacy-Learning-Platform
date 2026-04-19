import json
import re

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from openai import OpenAI
from .models import (
    LogEvent, Participant, Session, StepTime,
    PromptSubmission, ButtonClick, AnnotatedDrop, GenerateEvent,
)

# ── OpenAI client ────────────────────────────────────────────
client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None


# ── Helpers ──────────────────────────────────────────────────

def get_client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def extract_features(prompt):
    """Rule engine: extract deterministic signals from the prompt text."""
    t = prompt or ''

    has_grade       = bool(re.search(r'grade\s?\d+|\d+(st|nd|rd|th)\s+grade|year\s?\d+', t, re.I))
    has_age         = bool(re.search(r'\d+\s*[-–]?\s*year[s]?\s*[- ]?old|\bage\s*\d+', t, re.I))
    has_proficiency = bool(re.search(
        r'\b(beginner[s]?|elementary|pre[-\s]?intermediate|intermediate|'
        r'upper[-\s]?intermediate|advanced|A1|A2|B1|B2|C1|C2)\b', t, re.I))
    has_time        = bool(re.search(r'\d+\s*[-–]?\s*(minute[s]?|min[s]?|hour[s]?)', t, re.I))
    has_materials   = bool(re.search(r'\bmaterials?\b', t, re.I))
    has_activity    = bool(re.search(r'\bactivit(y|ies)\b', t, re.I))
    has_assessment  = bool(re.search(r'\b(assess(ment)?|evaluat(e|ion)|quiz|test)\b', t, re.I))
    has_steps       = bool(re.search(r'\bstep[s]?\b', t, re.I))
    has_action_verb = bool(re.search(
        r'\b(describe|identify|write|produce|use|create|list|match|compare|explain|'
        r'demonstrate|apply|construct|distinguish|categorize|label|select|arrange|'
        r'complete|respond|perform|discuss|present|ask|answer|form|build)\b', t, re.I))
    has_success_criteria = bool(re.search(
        r'\bby the end\b|\bwill be able to\b|\bcan correctly\b|\bsuccessfully\b', t, re.I))
    has_bullets  = bool(re.search(r'bullet[s]?|\n\s*[-•*]\s', t, re.I))
    has_table    = bool(re.search(r'\btable\b|\bcolumns?\b', t, re.I))
    has_headings = bool(re.search(r'\bsection[s]?\b|\bheading[s]?\b|\bpart[s]?\b', t, re.I))

    component_count = sum([has_materials, has_activity, has_assessment, has_steps])

    return {
        'has_grade_or_age':     has_grade or has_age,
        'has_proficiency':      has_proficiency,
        'has_time':             has_time,
        'has_action_verb':      has_action_verb,
        'has_success_criteria': has_success_criteria,
        'has_materials':        has_materials,
        'has_activity':         has_activity,
        'has_assessment':       has_assessment,
        'has_steps':            has_steps,
        'component_count':      component_count,
        'has_bullets':          has_bullets,
        'has_table':            has_table,
        'has_headings':         has_headings,
    }


# ── SPA entry point ──────────────────────────────────────────

def index(request):
    return render(request, 'LessonPlanHelper/index.html')


# ── POST /api/log ────────────────────────────────────────────

@csrf_exempt
@require_POST
def log_event(request):
    try:
        from django.utils import timezone
        body           = json.loads(request.body)
        event          = body.get('event', 'unknown')
        data           = body.get('data', {})
        session_id     = body.get('sessionId', 'unknown')
        participant_id = body.get('participantId')
        ip             = get_client_ip(request)
        now            = timezone.now()

        # ── Raw event log (flat, for audit trail) ────────────
        LogEvent.objects.create(
            session_id=session_id, participant_id=participant_id,
            event=event, data=data, ip=ip,
        )

        # ── Upsert Participant ────────────────────────────────
        if participant_id:
            Participant.objects.get_or_create(
                participant_id=participant_id,
                defaults={'first_seen_at': now},
            )

        # ── Upsert Session ────────────────────────────────────
        participant_obj = (
            Participant.objects.filter(participant_id=participant_id).first()
            if participant_id else None
        )
        session_obj, _ = Session.objects.get_or_create(
            session_id=session_id,
            defaults={'participant': participant_obj, 'started_at': now},
        )
        if event == 'session_start':
            session_obj.user_agent = data.get('userAgent')
            session_obj.screen_w   = data.get('screenW')
            session_obj.screen_h   = data.get('screenH')
            if participant_obj and not session_obj.participant:
                session_obj.participant = participant_obj
            session_obj.save()

        # ── Normalized event routing ──────────────────────────
        if event == 'time_on_step':
            StepTime.objects.create(
                session=session_obj, participant_id=participant_id,
                module_id=data.get('moduleId'), step_index=data.get('stepIndex'),
                step_type=data.get('stepType'),
                duration_seconds=data.get('duration_seconds'),
                recorded_at=now,
            )

        elif event in ('submit_pretest', 'submit_posttest'):
            s = (data.get('evalResult') or {}).get('scores', {})
            sub_type = 'pretest' if event == 'submit_pretest' else 'posttest'
            PromptSubmission.objects.create(
                session=session_obj, participant_id=participant_id,
                submission_type=sub_type, attempt_number=1,
                prompt_text=data.get('prompt'),
                score_goal=s.get('goal'), score_context=s.get('context'),
                score_task=s.get('task'), score_constraints=s.get('constraints'),
                score_output=s.get('output'),
                total_score=(data.get('evalResult') or {}).get('total'),
                overall_feedback=(data.get('evalResult') or {}).get('overall'),
                submitted_at=now,
            )

        elif event == 'fullpractice_attempt':
            s = data.get('scores', {})
            PromptSubmission.objects.create(
                session=session_obj, participant_id=participant_id,
                submission_type='fullpractice', attempt_number=data.get('attempt', 1),
                score_goal=s.get('goal'), score_context=s.get('context'),
                score_task=s.get('task'), score_constraints=s.get('constraints'),
                score_output=s.get('output'), total_score=data.get('total'),
                edited_fields=data.get('editedFields') or [],
                submitted_at=now,
            )

        elif event == 'button_click':
            ButtonClick.objects.create(
                session=session_obj, participant_id=participant_id,
                button_name=data.get('button'), total_clicks=data.get('total_clicks'),
                module_id=data.get('moduleId'), step_index=data.get('stepIndex'),
                step_type=data.get('stepType'), clicked_at=now,
            )

        elif event == 'annotated_dropped':
            AnnotatedDrop.objects.create(
                session=session_obj, participant_id=participant_id,
                expected_type=data.get('expectedType'),
                dragged_type=data.get('draggedType'),
                correct=data.get('correct'), dropped_at=now,
            )

        elif event == 'generate_prompt':
            GenerateEvent.objects.create(
                session=session_obj, participant_id=participant_id,
                generate_type=data.get('type'), prompt_text=data.get('prompt'),
                ai_output=data.get('result'), generated_at=now,
            )

        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ── POST /api/generate ───────────────────────────────────────

@csrf_exempt
@require_POST
def generate(request):
    if not client:
        return JsonResponse(
            {'error': 'OPENAI_API_KEY not configured.'}, status=503)
    try:
        body         = json.loads(request.body)
        prompt       = body.get('prompt', '')
        system_prompt = body.get('systemPrompt') or (
            'You are a helpful AI assistant for language teachers. '
            'Provide clear, practical, classroom-ready responses.'
        )
        full_system = (
            system_prompt + '\n\nIMPORTANT: Do not use markdown formatting. '
            'Do not use **, *, #, ##, or any markdown symbols. '
            'Use plain text only. Use line breaks and indentation to structure your output.'
        )

        response = client.chat.completions.create(
            model=settings.GENERATE_MODEL,
            max_tokens=1500,
            messages=[
                {'role': 'system', 'content': full_system},
                {'role': 'user',   'content': prompt},
            ]
        )
        return JsonResponse({'content': response.choices[0].message.content})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ── POST /api/evaluate ───────────────────────────────────────

@csrf_exempt
@require_POST
def evaluate(request):
    if not client:
        return JsonResponse({'error': 'OPENAI_API_KEY not configured.'}, status=503)
    try:
        body           = json.loads(request.body)
        prompt         = body.get('prompt', '')
        user_typed     = body.get('userTypedParts')

        features       = extract_features(prompt)
        features_text  = '\n'.join(f'- {k}: {v}' for k, v in features.items())

        system_prompt = f"""You evaluate AI prompts written by language teachers. Return ONLY valid JSON with no markdown or extra text.

STEP 1 — GIBBERISH CHECK (STRICT)
Evaluate ONLY the learner-typed portion.
Mark as gibberish ONLY if:
- Input is random characters or keyboard mashing (e.g., "asdf", "qwerty")
- Input is clearly unrelated to teaching or the scenario (e.g., "pizza", "hello", "idk")
- Input has no interpretable teaching intent
DO NOT use word count as a rule.

If gibberish is detected, return ONLY:
{{"gibberish":true,"scores":{{"goal":0,"context":0,"task":0,"constraints":0,"output":0}},"total":0,"feedback":{{"goal":"","context":"","task":"","constraints":"","output":""}},"overall":"Your input does not look like a teaching prompt. Please write a meaningful teaching prompt based on the scenario."}}

STEP 2 — CONDITION CHECK (MANDATORY, NO SKIPPING)
The rule engine has already detected these features from the prompt — trust them for detection; use your judgment only for interpretation:

DETECTED FEATURES:
{features_text}

Use these features as ground truth for binary conditions. Do NOT re-detect what is already flagged.

STEP 3 — SCORE EACH DIMENSION using ONLY the condition checks below:

DIMENSION 1 — Goal
Conditions: has_learning_target, has_action_verb (NOT "learn"/"understand"/"know"), has_topic, has_success_criteria
3 = all TRUE | 2 = learning target + topic TRUE but missing measurable verb OR success criteria | 1 = topic only | 0 = none

DIMENSION 2 — Context
Conditions: has_grade_or_age, has_proficiency, has_specific_student_detail (prior knowledge / difficulty / learning need / classroom condition — interpret from prompt)
3 = all TRUE | 2 = grade/proficiency present but no student detail | 1 = vague student mention only | 0 = none

DIMENSION 3 — Task
Conditions: has_clear_product, has_time (use has_time from features), component_count ≥ 2 (use component_count from features)
3 = all TRUE | 2 = product present but missing time OR component_count < 2 | 1 = vague task | 0 = none

DIMENSION 4 — Constraints
Count ONLY actionable constraints. Ignore vague phrases like "engaging", "clear", "good".
Types: language level, pedagogical, format, content constraints — interpret from prompt.
3 = ≥2 actionable constraints | 2 = 1 actionable constraint | 1 = vague preference only | 0 = none

DIMENSION 5 — Output Format
Conditions: has_structure (use has_headings), has_format_type (use has_bullets or has_table), has_required_elements (interpret from prompt)
3 = all TRUE | 2 = elements listed but no format type | 1 = general request only | 0 = none

STEP 4 — SCORING RULES
- Scores MUST come ONLY from condition checks above
- Do NOT use general impressions
- If unsure between two scores → ALWAYS choose the LOWER score

STEP 5 — OVERALL FEEDBACK
- Maximum 100 words total
- Part 1: what the learner did well (reference actual content from their prompt)
- Part 2: start with "BUT" — identify 1–2 weakest dimensions, name EXACT missing elements
- Keep all feedback field values as empty strings

Return ONLY this JSON:
{{"scores":{{"goal":1,"context":1,"task":1,"constraints":1,"output":1}},"total":5,"feedback":{{"goal":"","context":"","task":"","constraints":"","output":""}},"overall":"..."}}"""

        user_content = (
            f'Full prompt to evaluate:\n{prompt}\n\n'
            f'IMPORTANT — The following parts were typed by the learner (the rest was pre-filled). '
            f'Apply the gibberish check to these parts specifically:\n{user_typed}'
            if user_typed
            else f'Evaluate this teacher prompt:\n\n{prompt}'
        )

        response = client.chat.completions.create(
            model=settings.EVAL_MODEL,
            temperature=0,
            max_tokens=700,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user',   'content': user_content},
            ]
        )
        result = json.loads(response.choices[0].message.content.strip())
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ── POST /api/evaluate-part ──────────────────────────────────

@csrf_exempt
@require_POST
def evaluate_part(request):
    if not client:
        return JsonResponse({'error': 'OPENAI_API_KEY not configured.'}, status=503)
    try:
        body       = json.loads(request.body)
        dimension  = body.get('dimension', '')
        field_text = body.get('fieldText', '')
        prefix     = body.get('prefix', '')

        rubrics = {
            'goal':        'Does it state what students will learn, use a measurable action verb (not "understand"/"learn"), name a topic, and imply success criteria?',
            'context':     'Does it specify grade/age, proficiency level, and at least one concrete student detail (prior knowledge, difficulty, learning need)?',
            'task':        'Does it clearly state what to produce, include a time/duration, and mention at least two components (activities, materials, steps, or assessment)?',
            'constraints': 'Does it include at least one actionable constraint — language level, pedagogical rule, format rule, or content boundary? Ignore vague words like "engaging".',
            'output':      'Does it specify structure (sections/headings), a format type (bullets/table/step-by-step), and name the required elements?',
        }

        full_text = f'{prefix} {field_text}' if prefix else field_text
        rubric    = rubrics.get(dimension, 'Evaluate quality and specificity.')

        system_prompt = f"""You give brief feedback on one part of a language teacher's AI prompt.
Dimension: {dimension}
Rubric question: {rubric}

Scoring (0–3):
3 = all rubric conditions met
2 = partially met (missing one key element)
1 = vague or minimal attempt
0 = nothing relevant or gibberish

Rules:
- Return ONLY valid JSON, no markdown.
- "feedback": max 20 words — one sentence on what is good, then "BUT" + one concrete actionable improvement naming the exact missing element.
- "score": integer 0–3.
- If gibberish: {{"score":0,"feedback":"Please write a real teaching prompt for this part."}}"""

        response = client.chat.completions.create(
            model=settings.EVAL_MODEL,
            temperature=0,
            max_tokens=80,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user',   'content': f'Evaluate this {dimension} part:\n"{full_text}"'},
            ]
        )
        result = json.loads(response.choices[0].message.content.strip())
        return JsonResponse({'feedback': result.get('feedback'), 'score': result.get('score')})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
