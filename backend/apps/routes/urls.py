from django.urls import path
from . import views

urlpatterns = [
    path('centers/', views.ExamCenterListView.as_view()),
    path('centers/<int:pk>/', views.ExamCenterDetailView.as_view()),
]
