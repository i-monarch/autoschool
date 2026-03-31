from django.db import transaction
from django.db.models import Count, OuterRef, Q, Subquery, Value
from django.db.models.expressions import RawSQL
from django.utils import timezone

from .models import ChatParticipant, ChatRoom, Message, MessageAttachment


def get_or_create_direct_room(user_a, user_b):
    room = ChatRoom.objects.filter(
        type='direct',
        participants__user=user_a,
    ).filter(
        participants__user=user_b,
    ).first()

    if room:
        return room, False

    with transaction.atomic():
        room = ChatRoom.objects.create(type='direct', created_by=user_a)
        ChatParticipant.objects.create(room=room, user=user_a, role='admin')
        ChatParticipant.objects.create(room=room, user=user_b, role='admin')
    return room, True


def create_group_room(creator, title, participant_ids, write_access='all'):
    with transaction.atomic():
        room = ChatRoom.objects.create(
            type='group', title=title, write_access=write_access, created_by=creator
        )
        ChatParticipant.objects.create(room=room, user=creator, role='admin')
        for uid in participant_ids:
            if uid != creator.pk:
                ChatParticipant.objects.create(
                    room=room, user_id=uid, role='member'
                )

        Message.objects.create(
            room=room, sender=None, type='system',
            text=f'{creator.get_full_name() or creator.username} створив групу',
        )
    return room


def send_message(room, sender, text='', msg_type='text', parent_id=None, attachment_ids=None):
    with transaction.atomic():
        msg = Message.objects.create(
            room=room, sender=sender, type=msg_type,
            text=text, parent_id=parent_id,
        )
        if attachment_ids:
            MessageAttachment.objects.filter(
                pk__in=attachment_ids, message__isnull=True
            ).update(message=msg)

        ChatRoom.objects.filter(pk=room.pk).update(updated_at=timezone.now())
    return msg


def mark_as_read(room, user):
    ChatParticipant.objects.filter(
        room=room, user=user
    ).update(last_read_at=timezone.now())


def get_rooms_for_user(user):
    last_msg = Message.objects.filter(
        room=OuterRef('pk'), is_deleted=False
    ).order_by('-created_at')

    participant = ChatParticipant.objects.filter(
        room=OuterRef('pk'), user=user
    )

    unread_sql = RawSQL(
        """
        SELECT COUNT(*) FROM chat_messages m
        WHERE m.room_id = chat_rooms.id
          AND m.is_deleted = false
          AND m.sender_id != %s
          AND (m.created_at > (
                SELECT cp.last_read_at FROM chat_participants cp
                WHERE cp.room_id = chat_rooms.id AND cp.user_id = %s
              )
              OR (SELECT cp.last_read_at FROM chat_participants cp
                  WHERE cp.room_id = chat_rooms.id AND cp.user_id = %s
              ) IS NULL)
        """,
        [user.pk, user.pk, user.pk],
    )

    base_qs = ChatRoom.objects.filter(is_active=True)
    if user.role != 'admin':
        base_qs = base_qs.filter(participants__user=user)

    return base_qs.annotate(
        last_message_text=Subquery(last_msg.values('text')[:1]),
        last_message_type=Subquery(last_msg.values('type')[:1]),
        last_message_at=Subquery(last_msg.values('created_at')[:1]),
        last_message_sender_id=Subquery(last_msg.values('sender_id')[:1]),
        unread_count=unread_sql,
    ).order_by('-updated_at')


def search_messages(user, query):
    qs = Message.objects.filter(
        room__is_active=True,
        is_deleted=False,
        text__icontains=query,
    )
    if user.role != 'admin':
        qs = qs.filter(room__participants__user=user)
    return qs.select_related('sender', 'room').order_by('-created_at')[:50]
