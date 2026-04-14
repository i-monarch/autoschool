from django.urls import path
from . import views

urlpatterns = [
    path('slots/', views.AvailableSlotsView.as_view()),
    path('bookings/', views.MyBookingsView.as_view()),
    path('bookings/create/', views.CreateBookingView.as_view()),
    path('bookings/<int:pk>/cancel/', views.CancelBookingView.as_view()),
]
