from django.urls import path

from . import views

urlpatterns = [
    path('tariffs/', views.TariffListView.as_view()),
    path('me/', views.MySubscriptionView.as_view()),
    path('subscribe/', views.SubscribeView.as_view()),
]
