from django.db import models
from django.contrib.postgres.fields import ArrayField


class Participant(models.Model):
    participant_id = models.TextField(unique=True)
    first_seen_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'participants'

    def __str__(self):
        return self.participant_id


class LogEvent(models.Model):
    """Raw catch-all — one row per incoming event."""
    session_id     = models.CharField(max_length=200)
    participant_id = models.CharField(max_length=200, null=True, blank=True)
    event          = models.CharField(max_length=100)
    data           = models.JSONField(default=dict)
    ip             = models.GenericIPAddressField(null=True, blank=True, unpack_ipv4=True)
    timestamp      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'log_events'
        ordering = ['-timestamp']
        indexes  = [
            models.Index(fields=['participant_id']),
            models.Index(fields=['event']),
        ]

    def __str__(self):
        return f'{self.participant_id} | {self.event} | {self.timestamp:%Y-%m-%d %H:%M}'


class StepTime(models.Model):
    """Time spent on each step — two timestamps + computed duration."""
    participant_id   = models.TextField(null=True, blank=True)
    module_id        = models.IntegerField(null=True, blank=True)
    step_index       = models.IntegerField(null=True, blank=True)
    step_type        = models.TextField(null=True, blank=True)
    entered_at       = models.DateTimeField(null=True, blank=True)
    exited_at        = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'step_times'
        ordering = ['entered_at']

    def __str__(self):
        return f'{self.participant_id} | {self.step_type} | {self.duration_seconds}s'


class ButtonClick(models.Model):
    """Every tracked button press."""
    participant_id = models.TextField(null=True, blank=True)
    button_name    = models.TextField(null=True, blank=True)
    clicked_at     = models.DateTimeField(null=True, blank=True)
    module_id      = models.IntegerField(null=True, blank=True)
    step_index     = models.IntegerField(null=True, blank=True)
    step_type      = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'button_clicks'
        ordering = ['clicked_at']

    def __str__(self):
        return f'{self.participant_id} | {self.button_name} @ {self.clicked_at}'


class PromptSubmission(models.Model):
    """Every evaluated prompt — text, all dimension scores, and feedback."""
    TYPES = [
        ('pretest',      'Pretest'),
        ('fullpractice', 'Full Practice'),
        ('posttest',     'Posttest'),
    ]
    participant_id           = models.TextField(null=True, blank=True)
    submission_type          = models.TextField(choices=TYPES)
    attempt_number           = models.IntegerField(default=1)
    prompt_text              = models.TextField(null=True, blank=True)
    score_desired_results    = models.IntegerField(null=True, blank=True)
    score_learner_context    = models.IntegerField(null=True, blank=True)
    score_evidence_of_learning = models.IntegerField(null=True, blank=True)
    score_instructional_plan = models.IntegerField(null=True, blank=True)
    score_output_requirements = models.IntegerField(null=True, blank=True)
    total_score              = models.IntegerField(null=True, blank=True)
    overall_feedback         = models.TextField(null=True, blank=True)
    strengths                = models.JSONField(null=True, blank=True)
    priority_improvements    = models.JSONField(null=True, blank=True)
    revision_feedback        = models.JSONField(null=True, blank=True)
    edited_fields            = ArrayField(models.TextField(), null=True, blank=True)
    submitted_at             = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'prompt_submissions'
        ordering = ['submitted_at']

    def __str__(self):
        return f'{self.participant_id} | {self.submission_type} #{self.attempt_number} | {self.total_score}/15 ({self.overall_feedback})'


# ── Module 2: Lesson Builder ────────────────────────────────

class Module2Session(models.Model):
    """Tracks a Module 2 Lesson Builder session."""
    STEP_CHOICES = [
        ('opening', 'Opening'),
        ('desired_results', 'Desired Results'),
        ('learner_context', 'Learner & Context'),
        ('evidence_of_learning', 'Evidence of Learning'),
        ('instructional_plan', 'Instructional Plan'),
        ('output_requirements', 'Output Requirements'),
        ('context_summary', 'Context Summary'),
        ('lesson_generation', 'Lesson Generation'),
        ('local_adjustment', 'Local Adjustment'),
        ('final_review', 'Final Review'),
        ('completed', 'Completed'),
    ]
    COMPLETION_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]

    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='module2_sessions', null=True, blank=True)
    participant_id = models.TextField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    current_step = models.CharField(max_length=100, choices=STEP_CHOICES, default='opening')
    completion_status = models.CharField(max_length=50, choices=COMPLETION_CHOICES, default='in_progress')

    global_context_json = models.JSONField(default=dict)
    generated_lesson_json = models.JSONField(default=dict)
    revised_lesson_json = models.JSONField(default=dict)
    final_lesson_json = models.JSONField(default=dict)
    section_feedback_json = models.JSONField(default=dict)

    class Meta:
        db_table = 'module2_sessions'
        ordering = ['-started_at']

    def __str__(self):
        return f'Module2Session {self.id} | {self.participant_id} | {self.current_step}'


class GlobalContextSurvey(models.Model):
    """Stores the five-part framework responses for a Module 2 session."""
    session = models.OneToOneField(Module2Session, on_delete=models.CASCADE, related_name='context_survey')

    # Five framework parts (stored as JSON for flexibility)
    desired_results = models.JSONField(default=dict)
    learner_context = models.JSONField(default=dict)
    evidence_of_learning = models.JSONField(default=dict)
    instructional_plan = models.JSONField(default=dict)
    output_requirements = models.JSONField(default=dict)

    # Required open-ended responses
    required_learning_goal_text = models.TextField(blank=True)
    required_local_context_text = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'global_context_surveys'

    def __str__(self):
        return f'ContextSurvey for Session {self.session_id}'
