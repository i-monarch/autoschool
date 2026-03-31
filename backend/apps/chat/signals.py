from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import ChatRoom, Message


@receiver(post_save, sender=Message)
def update_room_timestamp(sender, instance, created, **kwargs):
    if created:
        ChatRoom.objects.filter(pk=instance.room_id).update(updated_at=timezone.now())
