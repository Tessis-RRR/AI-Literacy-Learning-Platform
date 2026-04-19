from django.contrib import admin
from .models import (
    LogEvent, Participant, Session, StepTime,
    PromptSubmission, ButtonClick, AnnotatedDrop, GenerateEvent,
)


@admin.register(LogEvent)
class LogEventAdmin(admin.ModelAdmin):
    list_display    = ('timestamp', 'participant_id', 'event', 'session_id', 'ip')
    list_filter     = ('event', 'participant_id')
    search_fields   = ('participant_id', 'session_id', 'event')
    ordering        = ('-timestamp',)
    readonly_fields = ('timestamp',)


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display  = ('participant_id', 'first_seen_at')
    search_fields = ('participant_id',)
    ordering      = ('first_seen_at',)


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display  = ('session_id', 'participant', 'started_at', 'screen_w', 'screen_h')
    search_fields = ('session_id', 'participant__participant_id')
    ordering      = ('-started_at',)


@admin.register(StepTime)
class StepTimeAdmin(admin.ModelAdmin):
    list_display  = ('participant_id', 'step_type', 'step_index', 'duration_seconds', 'recorded_at')
    list_filter   = ('step_type',)
    search_fields = ('participant_id',)
    ordering      = ('-recorded_at',)


@admin.register(PromptSubmission)
class PromptSubmissionAdmin(admin.ModelAdmin):
    list_display  = ('participant_id', 'submission_type', 'attempt_number',
                     'total_score', 'score_goal', 'score_context',
                     'score_task', 'score_constraints', 'score_output', 'submitted_at')
    list_filter   = ('submission_type',)
    search_fields = ('participant_id',)
    ordering      = ('-submitted_at',)


@admin.register(ButtonClick)
class ButtonClickAdmin(admin.ModelAdmin):
    list_display  = ('participant_id', 'button_name', 'total_clicks', 'step_type', 'clicked_at')
    list_filter   = ('button_name', 'step_type')
    search_fields = ('participant_id', 'button_name')
    ordering      = ('-clicked_at',)


@admin.register(AnnotatedDrop)
class AnnotatedDropAdmin(admin.ModelAdmin):
    list_display  = ('participant_id', 'expected_type', 'dragged_type', 'correct', 'dropped_at')
    list_filter   = ('correct',)
    search_fields = ('participant_id',)
    ordering      = ('-dropped_at',)


@admin.register(GenerateEvent)
class GenerateEventAdmin(admin.ModelAdmin):
    list_display  = ('participant_id', 'generate_type', 'generated_at')
    list_filter   = ('generate_type',)
    search_fields = ('participant_id',)
    ordering      = ('-generated_at',)
