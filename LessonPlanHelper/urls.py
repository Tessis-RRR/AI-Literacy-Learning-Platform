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
]
