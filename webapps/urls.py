from django.contrib import admin
from django.urls import path, include, re_path
from LessonPlanHelper.views import index

urlpatterns = [
    path('admin/',   admin.site.urls),
    path('api/',     include('LessonPlanHelper.urls')),

    # Catch-all: serve index.html for any non-API route (SPA)
    re_path(r'^(?!api/|admin/).*$', index),
]
