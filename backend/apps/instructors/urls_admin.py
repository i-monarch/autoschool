from django.urls import path

from . import views_admin

urlpatterns = [
    path('', views_admin.AdminInstructorListView.as_view()),
    path('stats/', views_admin.AdminInstructorStatsView.as_view()),
    path('<int:pk>/', views_admin.AdminInstructorDetailView.as_view()),
    path('<int:pk>/verify/', views_admin.AdminInstructorVerifyView.as_view()),
    path('<int:pk>/reject/', views_admin.AdminInstructorRejectView.as_view()),
]
