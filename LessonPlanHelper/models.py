from django.db import models
from django.contrib.postgres.fields import ArrayField


class LogEvent(models.Model):
    """Raw event store — one row per incoming event, data kept as JSON."""
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
            models.Index(fields=['session_id']),
        ]

    def __str__(self):
        return f'{self.participant_id} | {self.event} | {self.timestamp:%Y-%m-%d %H:%M}'


# ── Normalized relational tables ──────────────────────────────

class Participant(models.Model):
    participant_id = models.TextField(unique=True)
    first_seen_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'participants'

    def __str__(self):
        return self.participant_id


class Session(models.Model):
    session_id  = models.TextField(unique=True)
    participant = models.ForeignKey(
        Participant, on_delete=models.SET_NULL,
        null=True, blank=True,
        to_field='participant_id', db_column='participant_id',
        related_name='sessions',
    )
    started_at  = models.DateTimeField(null=True, blank=True)
    user_agent  = models.TextField(null=True, blank=True)
    screen_w    = models.IntegerField(null=True, blank=True)
    screen_h    = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'sessions'

    def __str__(self):
        return self.session_id


class StepTime(models.Model):
    session          = models.ForeignKey(
        Session, on_delete=models.CASCADE,
        to_field='session_id', db_column='session_id',
    )
    participant_id   = models.TextField(null=True, blank=True)
    module_id        = models.IntegerField(null=True, blank=True)
    step_index       = models.IntegerField(null=True, blank=True)
    step_type        = models.TextField(null=True, blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    recorded_at      = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'step_times'

    def __str__(self):
        return f'{self.participant_id} | step {self.step_index} | {self.duration_seconds}s'


class PromptSubmission(models.Model):
    TYPES = [
        ('pretest',      'Pretest'),
        ('fullpractice', 'Full Practice'),
        ('posttest',     'Posttest'),
    ]
    session           = models.ForeignKey(
        Session, on_delete=models.CASCADE,
        to_field='session_id', db_column='session_id',
    )
    participant_id    = models.TextField(null=True, blank=True)
    submission_type   = models.TextField(choices=TYPES)
    attempt_number    = models.IntegerField(default=1)
    prompt_text       = models.TextField(null=True, blank=True)
    score_goal        = models.IntegerField(null=True, blank=True)
    score_context     = models.IntegerField(null=True, blank=True)
    score_task        = models.IntegerField(null=True, blank=True)
    score_constraints = models.IntegerField(null=True, blank=True)
    score_output      = models.IntegerField(null=True, blank=True)
    total_score       = models.IntegerField(null=True, blank=True)
    overall_feedback  = models.TextField(null=True, blank=True)
    edited_fields     = ArrayField(models.TextField(), null=True, blank=True)
    submitted_at      = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'prompt_submissions'

    def __str__(self):
        return f'{self.participant_id} | {self.submission_type} #{self.attempt_number} | {self.total_score}'


class ButtonClick(models.Model):
    session        = models.ForeignKey(
        Session, on_delete=models.CASCADE,
        to_field='session_id', db_column='session_id',
    )
    participant_id = models.TextField(null=True, blank=True)
    button_name    = models.TextField(null=True, blank=True)
    total_clicks   = models.IntegerField(null=True, blank=True)
    module_id      = models.IntegerField(null=True, blank=True)
    step_index     = models.IntegerField(null=True, blank=True)
    step_type      = models.TextField(null=True, blank=True)
    clicked_at     = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'button_clicks'

    def __str__(self):
        return f'{self.participant_id} | {self.button_name} x{self.total_clicks}'


class AnnotatedDrop(models.Model):
    session        = models.ForeignKey(
        Session, on_delete=models.CASCADE,
        to_field='session_id', db_column='session_id',
    )
    participant_id = models.TextField(null=True, blank=True)
    expected_type  = models.TextField(null=True, blank=True)
    dragged_type   = models.TextField(null=True, blank=True)
    correct        = models.BooleanField(null=True, blank=True)
    dropped_at     = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'annotated_drops'

    def __str__(self):
        return f'{self.participant_id} | {self.dragged_type}→{self.expected_type} | {"✓" if self.correct else "✗"}'


class GenerateEvent(models.Model):
    session        = models.ForeignKey(
        Session, on_delete=models.CASCADE,
        to_field='session_id', db_column='session_id',
    )
    participant_id = models.TextField(null=True, blank=True)
    generate_type  = models.TextField(null=True, blank=True)
    prompt_text    = models.TextField(null=True, blank=True)
    ai_output      = models.TextField(null=True, blank=True)
    generated_at   = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'generate_events'

    def __str__(self):
        return f'{self.participant_id} | {self.generate_type}'
