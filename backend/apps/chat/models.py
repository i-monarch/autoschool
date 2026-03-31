from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class ChatRoom(models.Model):
    ROOM_TYPES = [
        ('direct', _('Direct')),
        ('group', _('Group')),
    ]
    WRITE_ACCESS_CHOICES = [
        ('all', _('All participants')),
        ('staff', _('Admins and teachers only')),
    ]

    type = models.CharField(max_length=10, choices=ROOM_TYPES)
    title = models.CharField(max_length=255, blank=True)
    write_access = models.CharField(max_length=10, choices=WRITE_ACCESS_CHOICES, default='all')
    avatar = models.ImageField(upload_to='chat/avatars/', blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_rooms',
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_rooms'
        ordering = ['-updated_at']

    def __str__(self):
        if self.type == 'group':
            return self.title or f'Group #{self.pk}'
        return f'DM #{self.pk}'


class ChatParticipant(models.Model):
    ROLE_CHOICES = [
        ('member', _('Member')),
        ('admin', _('Admin')),
    ]

    room = models.ForeignKey(
        ChatRoom, on_delete=models.CASCADE, related_name='participants'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_participations',
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    last_read_at = models.DateTimeField(null=True, blank=True)
    is_muted = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_participants'
        unique_together = ['room', 'user']

    def __str__(self):
        return f'{self.user} in {self.room}'


class Message(models.Model):
    MSG_TYPES = [
        ('text', _('Text')),
        ('file', _('File')),
        ('image', _('Image')),
        ('system', _('System')),
    ]

    room = models.ForeignKey(
        ChatRoom, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_messages',
    )
    type = models.CharField(max_length=10, choices=MSG_TYPES, default='text')
    text = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies'
    )
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
        ]

    def __str__(self):
        return f'Message #{self.pk} by {self.sender}'


class MessageAttachment(models.Model):
    message = models.ForeignKey(
        Message, on_delete=models.CASCADE, related_name='attachments',
        null=True, blank=True,
    )
    file = models.FileField(upload_to='chat/attachments/%Y/%m/')
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=100)
    thumbnail = models.ImageField(
        upload_to='chat/thumbnails/%Y/%m/', blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_attachments'

    def __str__(self):
        return self.filename
