from django.urls import path
from . import views_teacher as views

urlpatterns = [
    path('dashboard/', views.TeacherDashboardView.as_view()),
    path('students/', views.TeacherStudentListView.as_view()),
    path('students/<int:pk>/', views.TeacherStudentDetailView.as_view()),
    path('profile/', views.TeacherProfileView.as_view()),
]
