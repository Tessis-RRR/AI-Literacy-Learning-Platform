from django.contrib import admin
from .models import Participant, LogEvent, StepTime, ButtonClick, PromptSubmission, Module2Session, GlobalContextSurvey


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
    list_display  = ('participant_id', 'submission_type', 'attempt_number', 'total_score',
                     'score_desired_results', 'score_learner_context',
                     'score_evidence_of_learning', 'score_instructional_plan',
                     'score_output_requirements', 'submitted_at')
    list_filter   = ('submission_type',)
    search_fields = ('participant_id',)
    ordering      = ('submitted_at',)


# ── Module 2: Lesson Builder ───────────────────────────────

@admin.register(Module2Session)
class Module2SessionAdmin(admin.ModelAdmin):
    list_display  = ('id', 'participant_id', 'current_step', 'completion_status', 'started_at', 'completed_at')
    list_filter   = ('current_step', 'completion_status', 'started_at')
    search_fields = ('participant_id', 'user__username')
    ordering      = ('-started_at',)
    readonly_fields = ('started_at', 'completed_at')

    fieldsets = (
        ('Session Info', {
            'fields': ('user', 'participant_id', 'started_at', 'completed_at')
        }),
        ('Status', {
            'fields': ('current_step', 'completion_status')
        }),
        ('Context Data', {
            'fields': ('global_context_json',),
            'classes': ('collapse',)
        }),
        ('Generated Lesson', {
            'fields': ('generated_lesson_json',),
            'classes': ('collapse',)
        }),
        ('Revised Lesson', {
            'fields': ('revised_lesson_json',),
            'classes': ('collapse',)
        }),
        ('Final Lesson', {
            'fields': ('final_lesson_json',),
            'classes': ('collapse',)
        }),
        ('Section Feedback', {
            'fields': ('section_feedback_json',),
            'classes': ('collapse',)
        }),
    )


@admin.register(GlobalContextSurvey)
class GlobalContextSurveyAdmin(admin.ModelAdmin):
    list_display  = ('session_id', 'created_at', 'updated_at')
    list_filter   = ('created_at', 'updated_at')
    search_fields = ('session__participant_id',)
    ordering      = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Session', {
            'fields': ('session',)
        }),
        ('Required Responses', {
            'fields': ('required_learning_goal_text', 'required_local_context_text')
        }),
        ('Desired Results', {
            'fields': ('desired_results',),
            'classes': ('collapse',)
        }),
        ('Learner & Context', {
            'fields': ('learner_context',),
            'classes': ('collapse',)
        }),
        ('Evidence of Learning', {
            'fields': ('evidence_of_learning',),
            'classes': ('collapse',)
        }),
        ('Instructional Plan', {
            'fields': ('instructional_plan',),
            'classes': ('collapse',)
        }),
        ('Output Requirements', {
            'fields': ('output_requirements',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
