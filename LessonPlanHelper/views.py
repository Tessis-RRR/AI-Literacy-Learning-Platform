import json
import re

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from openai import OpenAI
from .models import Participant, LogEvent, StepTime, ButtonClick, PromptSubmission

# ── OpenAI client ────────────────────────────────────────────
client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None


# ── Helpers ──────────────────────────────────────────────────

def strip_markdown(text):
    t = text or ''
    t = re.sub(r'^#{1,6}\s+', '', t, flags=re.MULTILINE)   # headings
    t = re.sub(r'\*{2,3}(.*?)\*{2,3}', r'\1', t)           # bold / bold-italic
    t = re.sub(r'_{2,3}(.*?)_{2,3}', r'\1', t)             # __bold__
    t = re.sub(r'\*(.*?)\*', r'\1', t)                     # *italic*
    t = re.sub(r'_(.*?)_', r'\1', t)                       # _italic_
    t = re.sub(r'`{3}.*?`{3}', '', t, flags=re.DOTALL)     # fenced code blocks
    t = re.sub(r'`([^`]+)`', r'\1', t)                     # inline code
    t = re.sub(r'^[-*_]{3,}\s*$', '', t, flags=re.MULTILINE)  # horizontal rules
    t = re.sub(r'^\s*[-*+]\s+', '', t, flags=re.MULTILINE)    # unordered list bullets
    t = re.sub(r'^\s*\d+\.\s+', '', t, flags=re.MULTILINE)    # ordered list numbers
    t = re.sub(r'^>\s*', '', t, flags=re.MULTILINE)            # blockquotes
    t = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', t)             # links
    t = re.sub(r'\n{3,}', '\n\n', t)                           # excess blank lines
    return t.strip()


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

        # ── Raw audit log ─────────────────────────────────────
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

        # ── Normalized event routing ──────────────────────────
        if event == 'time_on_step':
            from datetime import timezone as tz, datetime
            entered_iso = data.get('enteredAt')
            entered_at  = datetime.fromisoformat(entered_iso) if entered_iso else None
            StepTime.objects.create(
                participant_id=participant_id,
                module_id=data.get('moduleId'), step_index=data.get('stepIndex'),
                step_type=data.get('stepType'),
                entered_at=entered_at, exited_at=now,
                duration_seconds=data.get('duration_seconds'),
            )

        elif event in ('submit_pretest', 'submit_posttest'):
            s = (data.get('evalResult') or {}).get('scores', {})
            sub_type = 'pretest' if event == 'submit_pretest' else 'posttest'
            PromptSubmission.objects.create(
                participant_id=participant_id,
                submission_type=sub_type, attempt_number=1,
                prompt_text=data.get('prompt'),
                score_desired_results=(s.get('desired_results') or {}).get('score'),
                score_learner_context=(s.get('learner_context') or {}).get('score'),
                score_evidence_of_learning=(s.get('evidence_of_learning') or {}).get('score'),
                score_instructional_plan=(s.get('instructional_plan') or {}).get('score'),
                score_output_requirements=(s.get('output_requirements') or {}).get('score'),
                total_score=(data.get('evalResult') or {}).get('total_score'),
                overall_feedback=(data.get('evalResult') or {}).get('overall_judgment'),
                strengths=(data.get('evalResult') or {}).get('strengths'),
                priority_improvements=(data.get('evalResult') or {}).get('priority_improvements'),
                revision_feedback=(data.get('evalResult') or {}).get('revision_feedback'),
                submitted_at=now,
            )

        elif event == 'fullpractice_attempt':
            s = data.get('scores', {})
            PromptSubmission.objects.create(
                participant_id=participant_id,
                submission_type='fullpractice', attempt_number=data.get('attempt', 1),
                prompt_text=data.get('prompt'),
                score_desired_results=(s.get('desired_results') or {}).get('score'),
                score_learner_context=(s.get('learner_context') or {}).get('score'),
                score_evidence_of_learning=(s.get('evidence_of_learning') or {}).get('score'),
                score_instructional_plan=(s.get('instructional_plan') or {}).get('score'),
                score_output_requirements=(s.get('output_requirements') or {}).get('score'),
                total_score=data.get('total_score'),
                overall_feedback=data.get('overall_judgment'),
                strengths=data.get('strengths'),
                priority_improvements=data.get('priority_improvements'),
                revision_feedback=data.get('revision_feedback'),
                edited_fields=data.get('editedFields') or [],
                submitted_at=now,
            )

        elif event == 'button_click':
            ButtonClick.objects.create(
                participant_id=participant_id,
                button_name=data.get('button'),
                clicked_at=now,
                module_id=data.get('moduleId'), step_index=data.get('stepIndex'),
                step_type=data.get('stepType'),
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
        body   = json.loads(request.body)
        prompt = body.get('prompt', '')

        response = client.chat.completions.create(
            model=settings.GENERATE_MODEL,
            max_tokens=settings.GENERATE_MAX_TOKENS,
            messages=[
                {'role': 'user', 'content': prompt},
            ]
        )
        content = strip_markdown(response.choices[0].message.content)
        return JsonResponse({'content': content})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ── POST /api/evaluate ───────────────────────────────────────

@csrf_exempt
@require_POST
def evaluate(request):
    if not client:
        return JsonResponse({'error': 'OPENAI_API_KEY not configured.'}, status=503)
    try:
        body       = json.loads(request.body)
        prompt     = body.get('prompt', '')
        user_typed = body.get('userTypedParts')

        system_prompt = """You are an experienced teacher with deep lesson planning expertise who also uses AI fluently to create lesson plans. You are training new teachers to collaborate with LLMs/AI.

Your job is to score the prompt using the 5-Part Prompt Quality Rubric and provide feedback that helps the learner improve the prompt.

Evaluate the learner's prompt only based on the information written in the prompt itself. Do not assume missing details. Do not reward intentions that are not explicitly stated.

GIBBERISH CHECK — run this first.
If the learner-typed input is random characters, keyboard mashing, or clearly unrelated to teaching (e.g. "asdf", "pizza", "idk"), return ONLY:
{"gibberish":true,"scores":{"desired_results":{"score":0,"reason":""},"learner_context":{"score":0,"reason":""},"evidence_of_learning":{"score":0,"reason":""},"instructional_plan":{"score":0,"reason":""},"output_requirements":{"score":0,"reason":""}},"total_score":0,"overall_judgment":"Beginning","strengths":[],"priority_improvements":[],"revision_feedback":{"keep":[],"add_or_clarify":[],"next_best_revision":"Please write a real teaching prompt based on the scenario."}}

RUBRIC DIMENSIONS — score each from 0–3.

1. desired_results
Evaluate how clearly the prompt states what students should learn or be able to do by the end of the lesson.
Strong prompts use student-centered, specific, observable learning goals.
A topic is not the same as a goal. Teacher action is not the same as student learning.
3 = clear, student-centered, specific, observable, realistic learning goal
2 = learning goal is present but somewhat broad, vague, or not fully measurable
1 = topic or teaching intention is present, but student outcome is unclear
0 = no meaningful learning goal is stated

2. learner_context
Evaluate how well the prompt describes the learners and teaching context.
Useful context: grade level, language proficiency, class size, prior knowledge, learning needs, first language, time available, classroom constraints.
3 = multiple relevant learner/context details that meaningfully shape the lesson
2 = some useful context, but important details are missing
1 = minimal context with weak guidance
0 = no meaningful learner or classroom context

3. evidence_of_learning
Evaluate how clearly the prompt tells the AI how students will show they met the goal.
This may include exit ticket, short written response, quiz, discussion product, presentation, or success criteria. Evidence must match the goal.
3 = clear evidence of learning aligned to the goal
2 = check for understanding is included, but broad or only partly aligned
1 = vague mention of assessment without saying what students show
0 = no evidence of learning is included

4. instructional_plan
Evaluate how clearly the prompt describes how the lesson should unfold.
This may include lesson sequence, teaching approach, grouping, modeling, guided practice, independent practice, scaffolds, differentiation.
An activity is not the same as an instructional plan.
3 = clear lesson flow with relevant scaffolds/supports matched to learners
2 = general lesson flow is present, but broad or incomplete
1 = one activity or one instructional move is mentioned, but not a full sequence
0 = no instructional process is specified

5. output_requirements
Evaluate how clearly the prompt tells the AI what to generate and how it should be structured.
This may include lesson plan, worksheet, vocabulary list, time length, format, required components, materials, tone, or organization.
3 = deliverable and structure are clearly specified
2 = deliverable is clear and some requirements are included, but important details are missing
1 = product is requested, but structure is minimally specified
0 = requested output is unclear or absent

SCORING RULES
- Score strictly based on what is explicitly written. Do not infer missing details.
- Use the full range 0–3. Be consistent and rubric-aligned.
- If a dimension is weak, explain exactly what is missing.
- Feedback should help the learner revise, not just describe the score.
- overall_judgment: "Strong" 13-15 | "Proficient" 10-12 | "Developing" 6-9 | "Beginning" 0-5
- total_score must equal the sum of the five dimension scores.
- Each reason: 1–3 concise sentences.
- next_best_revision: one concrete sentence on what to revise first.

Return ONLY valid JSON — no markdown, no extra text:
{"scores":{"desired_results":{"score":0,"reason":""},"learner_context":{"score":0,"reason":""},"evidence_of_learning":{"score":0,"reason":""},"instructional_plan":{"score":0,"reason":""},"output_requirements":{"score":0,"reason":""}},"total_score":0,"overall_judgment":"","strengths":[""],"priority_improvements":[{"dimension":"","why_it_matters":"","how_to_improve":""}],"revision_feedback":{"keep":[""],"add_or_clarify":[""],"next_best_revision":""}}"""

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
            max_tokens=900,
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
            'desired_results':     'Does it state a student-centered, specific, observable learning goal using a measurable action verb (not "learn"/"understand")? Is it realistic and clearly outcomes-focused?',
            'learner_context':     'Does it specify grade/age, language proficiency level, and at least one concrete student detail (prior knowledge, difficulty, learning need, class size, or first language)?',
            'evidence_of_learning':'Does it describe how students will demonstrate they met the goal — e.g. exit ticket, short written response, quiz, discussion product, or success criteria? Does it match the goal?',
            'instructional_plan':  'Does it describe a lesson sequence or flow — e.g. modeling, guided practice, independent practice, grouping, scaffolds, or differentiation? One activity alone is not enough.',
            'output_requirements': 'Does it specify what the AI should produce (lesson plan, worksheet, vocabulary list), how long it should be, and how it should be structured (table, bullets, headings, required sections)?',
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


# ── POST /api/highlight ──────────────────────────────────────
# Chunk-based semantic comparison (ESL Co-Pilot “meaningful changes”).

def _strip_json_fence(raw):
    t = (raw or '').strip()
    if t.startswith('```'):
        t = re.sub(r'^```\w*\s*', '', t)
        t = re.sub(r'\s*```$', '', t)
    return t.strip()


def _trim_chunks(chunks, max_each=1000):
    out = []
    for c in chunks or []:
        cid = str((c or {}).get('id') or '')[:48]
        txt = str((c or {}).get('text') or '')[:max_each]
        if cid and txt.strip():
            out.append({'id': cid, 'text': txt})
    return out


@csrf_exempt
@require_POST
def highlight(request):
    if not client:
        return JsonResponse({'error': 'OPENAI_API_KEY not configured.'}, status=503)
    try:
        body = json.loads(request.body)

        previous_prompt = body.get('previousPrompt') or ''
        revised_prompt = body.get('revisedPrompt') or ''
        previous_output = body.get('previousOutput') or ''
        revised_output = body.get('revisedOutput') or ''
        previous_chunks = _trim_chunks(body.get('previousChunks'))
        revised_chunks = _trim_chunks(body.get('revisedChunks'))

        if not revised_chunks or not revised_output.strip():
            return JsonResponse({'highlights': []})

        valid_ids = {c['id'] for c in revised_chunks}
        prev_json = json.dumps(previous_chunks, ensure_ascii=False)
        rev_json = json.dumps(revised_chunks, ensure_ascii=False)

        system_prompt = """You compare two AI-generated lesson-plan outputs for language teachers.
Do not perform word-level or token-level diff.
The teacher revised their prompt and received a new lesson output.

Identify 2 to 4 chunks in the REVISED output whose MEANING changed the most compared with the previous output — instructional significance, not wording tweaks.

Prioritize: clearer learning goals; better alignment to goals; added or improved scaffolds/supports; clearer or more explicit assessment; better fit to learner context; important structural or pedagogical shifts; meaningful materials, grouping, or language-support changes.

Ignore: tiny wording edits, formatting-only changes, superficial rephrasing.

Return ONLY valid JSON (no markdown fences):
{"highlights":[{"chunkId":"<id from revised chunk list only>","changeStrength":2,"changeType":"alignment","label":"Short label","rationale":"1-2 sentences.","beforeSummary":"optional","afterSummary":"optional"}]}

Rules:
- chunkId MUST be copied exactly from the revised chunk id list.
- Return 2 to 4 highlights (or fewer only if fewer than 2 chunks truly qualify).
- changeStrength: 1 = moderate, 2 = strong, 3 = largest meaningful instructional shift.
- changeType: one of specificity, alignment, scaffold, assessment, learner_fit, structure, materials, language_support.
- Labels should be short and user-facing (e.g. "More specific objective", "Added learner support", "Clearer assessment", "Improved alignment")."""

        user_content = f"""Previous prompt:
{previous_prompt[:4500]}

Revised prompt:
{revised_prompt[:4500]}

Previous output (full):
{previous_output[:6500]}

Revised output (full):
{revised_output[:6500]}

Previous output chunks (id + text):
{prev_json}

Revised output chunks (id + text) — use ONLY these ids for chunkId:
{rev_json}

Return JSON only."""

        model = getattr(settings, 'HIGHLIGHT_MODEL', None) or settings.EVAL_MODEL
        response = client.chat.completions.create(
            model=model,
            temperature=0,
            max_tokens=1400,
            response_format={'type': 'json_object'},
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_content},
            ]
        )
        raw = _strip_json_fence(response.choices[0].message.content)
        result = json.loads(raw)
        highlights = result.get('highlights') or []

        def _strength(v):
            try:
                n = int(v)
            except (TypeError, ValueError):
                return 2
            return max(1, min(3, n))

        cleaned = []
        for h in highlights:
            cid = h.get('chunkId') or h.get('chunk_id')
            if not cid or cid not in valid_ids:
                continue
            cleaned.append({
                'chunkId': cid,
                'changeStrength': _strength(h.get('changeStrength')),
                'changeType': str(h.get('changeType') or 'alignment')[:48],
                'label': str(h.get('label') or 'Meaningful change')[:80],
                'rationale': str(h.get('rationale') or '')[:520],
                'beforeSummary': str(h.get('beforeSummary') or '')[:320],
                'afterSummary': str(h.get('afterSummary') or '')[:320],
            })

        cleaned.sort(key=lambda x: -x['changeStrength'])
        cleaned = cleaned[:4]

        return JsonResponse({'highlights': cleaned})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
