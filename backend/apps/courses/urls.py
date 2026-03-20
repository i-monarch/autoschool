from django.urls import path
from . import views

urlpatterns = [
    path('', views.CourseListView.as_view()),
    path('<slug:slug>/', views.CourseDetailView.as_view()),
    path('<slug:course_slug>/lessons/<slug:lesson_slug>/', views.LessonDetailView.as_view()),
    path('<slug:course_slug>/lessons/<slug:lesson_slug>/progress/', views.update_progress),
]
