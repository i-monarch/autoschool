from django.urls import path
from . import views

urlpatterns = [
    path('regions/', views.RegionListView.as_view()),
    path('centers/', views.ExamCenterListView.as_view()),
    path('centers/<int:pk>/', views.ExamCenterDetailView.as_view()),
]
