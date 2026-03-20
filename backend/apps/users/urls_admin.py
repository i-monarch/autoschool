from django.urls import path
from . import views_admin as views

urlpatterns = [
    path('stats/', views.AdminStudentStatsView.as_view()),
    path('', views.AdminStudentListView.as_view()),
    path('<int:pk>/', views.AdminStudentDetailView.as_view()),
    path('<int:pk>/payment/', views.AdminStudentPaymentView.as_view()),
]
