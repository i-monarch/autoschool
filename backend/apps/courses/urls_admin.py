from django.urls import path
from . import views_admin as views

urlpatterns = [
    # Stats
    path('stats/', views.AdminCoursesStatsView.as_view()),

    # Courses
    path('courses/', views.AdminCourseListCreateView.as_view()),
    path('courses/<int:pk>/', views.AdminCourseDetailView.as_view()),
    path('courses/reorder/', views.AdminCourseReorderView.as_view()),

    # Lessons
    path('lessons/', views.AdminLessonListView.as_view()),
    path('lessons/create/', views.AdminLessonCreateView.as_view()),
    path('lessons/<int:pk>/', views.AdminLessonDetailView.as_view()),
    path('lessons/reorder/', views.AdminLessonReorderView.as_view()),
]
