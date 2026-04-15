from django.urls import path
from . import views

urlpatterns = [
    path('', views.PartnerSchoolListView.as_view()),
]
