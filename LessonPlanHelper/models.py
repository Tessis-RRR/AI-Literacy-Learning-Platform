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
        ordering = ['submitted_at']

    def __str__(self):
        return f'{self.participant_id} | {self.submission_type} #{self.attempt_number} | {self.total_score}/15'
