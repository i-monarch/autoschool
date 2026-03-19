from django.urls import path
from . import views

urlpatterns = [
    path('sections/', views.SectionListView.as_view()),
    path('sections/<slug:section_slug>/chapters/', views.ChapterListView.as_view()),
    path('sections/<slug:section_slug>/chapters/<path:chapter_slug>/', views.ChapterDetailView.as_view()),
]
