from django.db import transaction
from django.db.models import Count, Max, OuterRef, Q, Subquery
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


def create_group_room(creator, title, participant_ids):
    with transaction.atomic():
        room = ChatRoom.objects.create(
            type='group', title=title, created_by=creator
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

    unread_subquery = Message.objects.filter(
        room=OuterRef('pk'),
        is_deleted=False,
        created_at__gt=Subquery(participant.values('last_read_at')[:1]),
    ).exclude(sender=user).order_by().values('room').annotate(c=Count('id')).values('c')

    return ChatRoom.objects.filter(
        participants__user=user, is_active=True
    ).annotate(
        last_message_text=Subquery(last_msg.values('text')[:1]),
        last_message_type=Subquery(last_msg.values('type')[:1]),
        last_message_at=Subquery(last_msg.values('created_at')[:1]),
        last_message_sender_id=Subquery(last_msg.values('sender_id')[:1]),
        unread_count=Subquery(unread_subquery),
    ).order_by('-updated_at')


def search_messages(user, query):
    return Message.objects.filter(
        room__participants__user=user,
        room__is_active=True,
        is_deleted=False,
        text__icontains=query,
    ).select_related('sender', 'room').order_by('-created_at')[:50]
