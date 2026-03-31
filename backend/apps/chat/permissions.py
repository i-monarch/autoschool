from rest_framework.permissions import BasePermission

from .models import ChatParticipant


class IsRoomParticipant(BasePermission):
    def has_object_permission(self, request, view, obj):
        return ChatParticipant.objects.filter(
            room=obj, user=request.user
        ).exists()


class CanManageGroup(BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.type != 'group':
            return False
        return ChatParticipant.objects.filter(
            room=obj, user=request.user, role='admin'
        ).exists()
