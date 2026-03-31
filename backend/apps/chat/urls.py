from django.urls import path

from . import views

app_name = 'chat'

urlpatterns = [
    path('rooms/', views.RoomListView.as_view(), name='room-list'),
    path('rooms/<int:pk>/', views.RoomDetailView.as_view(), name='room-detail'),
    path('rooms/<int:room_id>/messages/', views.MessageListView.as_view(), name='message-list'),
    path('rooms/<int:room_id>/messages/<int:pk>/edit/', views.MessageUpdateView.as_view(), name='message-edit'),
    path('rooms/<int:room_id>/messages/<int:pk>/delete/', views.MessageDeleteView.as_view(), name='message-delete'),
    path('rooms/<int:room_id>/read/', views.MarkAsReadView.as_view(), name='mark-read'),
    path('rooms/<int:room_id>/participants/', views.ParticipantAddView.as_view(), name='participant-add'),
    path('rooms/<int:room_id>/participants/<int:user_id>/', views.ParticipantRemoveView.as_view(), name='participant-remove'),
    path('upload/', views.FileUploadView.as_view(), name='file-upload'),
    path('users/', views.UserSearchView.as_view(), name='user-search'),
    path('search/', views.MessageSearchView.as_view(), name='message-search'),
]
