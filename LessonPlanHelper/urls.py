from django.urls import path
from . import views

urlpatterns = [
    path('log',           views.log_event,    name='log_event'),
    path('generate',      views.generate,     name='generate'),
    path('evaluate',      views.evaluate,     name='evaluate'),
    path('evaluate-part', views.evaluate_part, name='evaluate_part'),
    path('highlight',        views.highlight,         name='highlight'),
    path('lesson-generate',  views.lesson_generate,   name='lesson_generate'),
    path('lesson-chat',      views.lesson_chat,       name='lesson_chat'),
    # Module 2: Lesson Builder
    path('module2/start',           views.module2_start,          name='module2_start'),
    path('module2/save-context',    views.module2_save_context,   name='module2_save_context'),
    path('module2/generate-lesson', views.module2_generate_lesson, name='module2_generate_lesson'),
    path('module2/evaluate-draft',  views.module2_evaluate_draft,  name='module2_evaluate_draft'),
    path('module2/revise-lesson',   views.module2_revise_lesson,   name='module2_revise_lesson'),
    path('module2/finalize',        views.module2_finalize,        name='module2_finalize'),
]
