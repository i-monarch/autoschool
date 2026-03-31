import json
import time

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone

from .models import ChatParticipant, ChatRoom, Message, MessageAttachment
from .serializers import ChatUserSerializer, MessageSerializer


class ChatConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.room_groups = set()
        self.user_group = None
        self._msg_timestamps = []

    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or isinstance(self.user, AnonymousUser):
            await self.close()
            return

        await self.accept()

        self.user_group = f'user_{self.user.pk}'
        await self.channel_layer.group_add(self.user_group, self.channel_name)

        room_ids = await self._get_user_room_ids()
        for room_id in room_ids:
            group = f'room_{room_id}'
            self.room_groups.add(group)
            await self.channel_layer.group_add(group, self.channel_name)

        await self._set_online(True)

    async def disconnect(self, code):
        if self.user and not isinstance(self.user, AnonymousUser):
            await self._set_online(False)

        for group in self.room_groups:
            await self.channel_layer.group_discard(group, self.channel_name)
        if self.user_group:
            await self.channel_layer.group_discard(self.user_group, self.channel_name)

    async def receive_json(self, content, **kwargs):
        msg_type = content.get('type')
        if not msg_type:
            return

        if msg_type == 'message.send':
            await self._handle_message_send(content)
        elif msg_type == 'message.read':
            await self._handle_message_read(content)
        elif msg_type == 'typing.start':
            await self._handle_typing(content, True)
        elif msg_type == 'typing.stop':
            await self._handle_typing(content, False)

    async def _handle_message_send(self, content):
        if not self._rate_check():
            await self.send_json({'type': 'error', 'detail': 'Rate limit exceeded.'})
            return

        room_id = content.get('room_id')
        text = content.get('text', '').strip()
        msg_type = content.get('msg_type', 'text')
        parent_id = content.get('parent_id')
        attachment_ids = content.get('attachment_ids', [])

        if not room_id or (not text and not attachment_ids):
            return

        is_participant = await self._is_participant(room_id)
        if not is_participant:
            return

        can_write = await self._can_write(room_id)
        if not can_write:
            await self.send_json({'type': 'error', 'detail': 'Read-only channel.'})
            return

        msg_data = await self._create_message(
            room_id, text, msg_type, parent_id, attachment_ids
        )
        if not msg_data:
            return

        group = f'room_{room_id}'
        if group not in self.room_groups:
            self.room_groups.add(group)
            await self.channel_layer.group_add(group, self.channel_name)

        await self.channel_layer.group_send(group, {
            'type': 'chat.message',
            'data': msg_data,
        })

    async def _handle_message_read(self, content):
        room_id = content.get('room_id')
        if not room_id:
            return
        await self._mark_read(room_id)
        await self.channel_layer.group_send(f'room_{room_id}', {
            'type': 'chat.read',
            'data': {'room_id': room_id, 'user_id': self.user.pk},
        })

    async def _handle_typing(self, content, is_typing):
        room_id = content.get('room_id')
        if not room_id:
            return
        await self.channel_layer.group_send(f'room_{room_id}', {
            'type': 'chat.typing',
            'data': {
                'room_id': room_id,
                'user_id': self.user.pk,
                'is_typing': is_typing,
            },
        })

    # --- Group message handlers ---

    async def chat_message(self, event):
        await self.send_json({'type': 'message.new', 'data': event['data']})

    async def chat_read(self, event):
        await self.send_json({'type': 'message.read', 'data': event['data']})

    async def chat_typing(self, event):
        if event['data']['user_id'] != self.user.pk:
            await self.send_json({'type': 'typing.update', 'data': event['data']})

    async def chat_room_created(self, event):
        room_id = event['data'].get('room_id')
        if room_id:
            group = f'room_{room_id}'
            self.room_groups.add(group)
            await self.channel_layer.group_add(group, self.channel_name)
        await self.send_json({'type': 'room.created', 'data': event['data']})

    async def chat_online(self, event):
        if event['data']['user_id'] != self.user.pk:
            await self.send_json({'type': 'status.online', 'data': event['data']})

    # --- DB helpers ---

    @sync_to_async
    def _is_admin(self):
        return self.user.role == 'admin'

    @sync_to_async
    def _get_user_room_ids(self):
        if self.user.role == 'admin':
            return list(
                ChatRoom.objects.filter(is_active=True)
                .values_list('id', flat=True)
            )
        return list(
            ChatParticipant.objects.filter(user=self.user)
            .values_list('room_id', flat=True)
        )

    @sync_to_async
    def _is_participant(self, room_id):
        return ChatParticipant.objects.filter(
            room_id=room_id, user=self.user
        ).exists()

    @sync_to_async
    def _can_write(self, room_id):
        try:
            room = ChatRoom.objects.get(pk=room_id)
        except ChatRoom.DoesNotExist:
            return False
        if room.write_access == 'all':
            return True
        return self.user.role in ('admin', 'teacher')

    @sync_to_async
    def _create_message(self, room_id, text, msg_type, parent_id, attachment_ids):
        try:
            room = ChatRoom.objects.get(pk=room_id, is_active=True)
            msg = Message.objects.create(
                room=room, sender=self.user, type=msg_type,
                text=text, parent_id=parent_id,
            )
            if attachment_ids:
                MessageAttachment.objects.filter(
                    pk__in=attachment_ids, message__isnull=True
                ).update(message=msg)

            ChatRoom.objects.filter(pk=room_id).update(updated_at=timezone.now())

            msg = Message.objects.select_related(
                'sender', 'parent', 'parent__sender'
            ).prefetch_related('attachments').get(pk=msg.pk)

            return MessageSerializer(msg).data
        except ChatRoom.DoesNotExist:
            return None

    @sync_to_async
    def _mark_read(self, room_id):
        ChatParticipant.objects.filter(
            room_id=room_id, user=self.user
        ).update(last_read_at=timezone.now())

    async def _set_online(self, online):
        room_ids = await self._get_user_room_ids()
        for room_id in room_ids:
            await self.channel_layer.group_send(f'room_{room_id}', {
                'type': 'chat.online',
                'data': {'user_id': self.user.pk, 'is_online': online},
            })

    def _rate_check(self):
        now = time.time()
        self._msg_timestamps = [t for t in self._msg_timestamps if now - t < 60]
        if len(self._msg_timestamps) >= 30:
            return False
        self._msg_timestamps.append(now)
        return True
