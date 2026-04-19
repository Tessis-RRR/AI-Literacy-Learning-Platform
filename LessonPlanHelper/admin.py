from django.contrib import admin
from .models import Participant, LogEvent, StepTime, ButtonClick, PromptSubmission


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display  = ('participant_id', 'first_seen_at')
    search_fields = ('participant_id',)
    ordering      = ('first_seen_at',)


@admin.register(LogEvent)
class LogEventAdmin(admin.ModelAdmin):
    list_display    = ('timestamp', 'participant_id', 'event', 'session_id', 'ip')
    list_filter     = ('event',)
    search_fields   = ('participant_id', 'event')
    ordering        = ('-timestamp',)
    readonly_fields = ('timestamp',)


@admin.register(StepTime)
class StepTimeAdmin(admin.ModelAdmin):
    list_display  = ('participant_id', 'step_type', 'step_index', 'entered_at', 'exited_at', 'duration_seconds')
    list_filter   = ('step_type',)
    search_fields = ('participant_id',)
    ordering      = ('entered_at',)


@admin.register(ButtonClick)
class ButtonClickAdmin(admin.ModelAdmin):
    list_display  = ('participant_id', 'button_name', 'clicked_at', 'step_type')
    list_filter   = ('button_name', 'step_type')
    search_fields = ('participant_id', 'button_name')
    ordering      = ('clicked_at',)


@admin.register(PromptSubmission)
class PromptSubmissionAdmin(admin.ModelAdmin):
    list_display  = ('participant_id', 'submission_type', 'attempt_number',
                     'total_score', 'score_goal', 'score_context',
                     'score_task', 'score_constraints', 'score_output', 'submitted_at')
    list_filter   = ('submission_type',)
    search_fields = ('participant_id',)
    ordering      = ('submitted_at',)
