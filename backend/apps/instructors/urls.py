from django.urls import path

from . import views

urlpatterns = [
    path('', views.InstructorPublicListView.as_view(), name='instructor-list'),
    path('me/', views.InstructorMeView.as_view(), name='instructor-me'),
]
