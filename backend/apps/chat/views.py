from rest_framework import generics, permissions, status
from rest_framework.pagination import CursorPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatParticipant, ChatRoom, Message, MessageAttachment
from .permissions import CanManageGroup, IsRoomParticipant
from .serializers import (
    AddParticipantSerializer,
    AttachmentSerializer,
    CreateRoomSerializer,
    FileUploadSerializer,
    MessageSerializer,
    RoomDetailSerializer,
    RoomListSerializer,
)
from django.contrib.auth import get_user_model

from .tasks import generate_thumbnail
from .services import (
    create_group_room,
    get_or_create_direct_room,
    get_rooms_for_user,
    mark_as_read,
    search_messages,
    send_message,
)

User = get_user_model()


class RoomListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateRoomSerializer
        return RoomListSerializer

    def get_queryset(self):
        return get_rooms_for_user(self.request.user).prefetch_related(
            'participants__user'
        )

    def create(self, request, *args, **kwargs):
        serializer = CreateRoomSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if data['type'] == 'direct':
            target_user = User.objects.get(pk=data['user_id'])
            room, created = get_or_create_direct_room(
                request.user, target_user
            )
        else:
            room = create_group_room(
                request.user, data['title'], data['participant_ids']
            )
            created = True

        room_qs = get_rooms_for_user(request.user).filter(pk=room.pk).prefetch_related(
            'participants__user'
        )
        out = RoomListSerializer(room_qs.first()).data
        return Response(out, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class RoomDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RoomDetailSerializer

    def get_queryset(self):
        qs = ChatRoom.objects.filter(is_active=True)
        if self.request.user.role != 'admin':
            qs = qs.filter(participants__user=self.request.user)
        return qs.prefetch_related('participants__user')

    def update(self, request, *args, **kwargs):
        room = self.get_object()
        if room.type != 'group':
            return Response(
                {'detail': 'Cannot update direct chat.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        self.check_object_permissions(request, room)
        room.title = request.data.get('title', room.title)
        room.save(update_fields=['title'])
        return Response(RoomDetailSerializer(room).data)


class MessagePagination(CursorPagination):
    page_size = 50
    ordering = '-created_at'
    cursor_query_param = 'cursor'


class MessageListView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessagePagination

    def get_queryset(self):
        room_id = self.kwargs['room_id']
        is_admin = self.request.user.role == 'admin'
        if not is_admin and not ChatParticipant.objects.filter(
            room_id=room_id, user=self.request.user
        ).exists():
            return Message.objects.none()
        return Message.objects.filter(
            room_id=room_id
        ).select_related('sender', 'parent', 'parent__sender').prefetch_related('attachments')

    def perform_create(self, serializer):
        room_id = self.kwargs['room_id']
        room = ChatRoom.objects.get(pk=room_id)
        send_message(
            room=room,
            sender=self.request.user,
            text=serializer.validated_data.get('text', ''),
            msg_type=serializer.validated_data.get('type', 'text'),
            parent_id=serializer.validated_data.get('parent_id'),
            attachment_ids=serializer.validated_data.get('attachment_ids'),
        )


class MessageUpdateView(generics.UpdateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(sender=self.request.user, is_deleted=False)

    def perform_update(self, serializer):
        serializer.instance.text = self.request.data.get('text', serializer.instance.text)
        serializer.instance.is_edited = True
        serializer.instance.save(update_fields=['text', 'is_edited', 'updated_at'])


class MessageDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(sender=self.request.user, is_deleted=False)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted', 'updated_at'])


class MarkAsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, room_id):
        if not ChatParticipant.objects.filter(
            room_id=room_id, user=request.user
        ).exists():
            return Response(status=status.HTTP_404_NOT_FOUND)
        room = ChatRoom.objects.get(pk=room_id)
        mark_as_read(room, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class FileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        f = serializer.validated_data['file']

        attachment = MessageAttachment.objects.create(
            message=None,
            file=f,
            filename=f.name,
            file_size=f.size,
            content_type=f.content_type or '',
        )
        if f.content_type and f.content_type.startswith('image/'):
            generate_thumbnail.delay(attachment.pk)

        return Response(
            AttachmentSerializer(attachment).data,
            status=status.HTTP_201_CREATED,
        )


class ParticipantAddView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, room_id):
        room = ChatRoom.objects.get(pk=room_id)
        if room.type != 'group':
            return Response(
                {'detail': 'Can only add participants to groups.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not ChatParticipant.objects.filter(
            room=room, user=request.user, role='admin'
        ).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = AddParticipantSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data['user_id']

        _, created = ChatParticipant.objects.get_or_create(
            room=room, user_id=user_id, defaults={'role': 'member'}
        )
        if not created:
            return Response(
                {'detail': 'Already a participant.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_201_CREATED)


class ParticipantRemoveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, room_id, user_id):
        room = ChatRoom.objects.get(pk=room_id)
        if room.type != 'group':
            return Response(status=status.HTTP_400_BAD_REQUEST)

        is_admin = ChatParticipant.objects.filter(
            room=room, user=request.user, role='admin'
        ).exists()
        is_self = request.user.pk == user_id

        if not is_admin and not is_self:
            return Response(status=status.HTTP_403_FORBIDDEN)

        ChatParticipant.objects.filter(room=room, user_id=user_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserSearchView(generics.ListAPIView):
    serializer_class = None
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        from apps.chat.serializers import ChatUserSerializer
        search = self.request.query_params.get('search', '').strip()
        qs = User.objects.filter(is_active=True).exclude(pk=self.request.user.pk)
        if search and len(search) >= 2:
            from django.db.models import Q
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(username__icontains=search)
            )
        return qs[:20]

    def list(self, request, *args, **kwargs):
        from apps.chat.serializers import ChatUserSerializer
        qs = self.get_queryset()
        serializer = ChatUserSerializer(qs, many=True)
        return Response(serializer.data)


class MessageSearchView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        q = self.request.query_params.get('q', '').strip()
        if not q or len(q) < 2:
            return Message.objects.none()
        return search_messages(self.request.user, q)
