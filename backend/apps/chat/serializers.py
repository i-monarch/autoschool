import magic
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import ChatParticipant, ChatRoom, Message, MessageAttachment

User = get_user_model()

ALLOWED_EXTENSIONS = {
    'jpg', 'jpeg', 'png', 'gif', 'webp',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip',
}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


class ChatUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'avatar', 'role')
        read_only_fields = fields


class ParticipantSerializer(serializers.ModelSerializer):
    user = ChatUserSerializer(read_only=True)

    class Meta:
        model = ChatParticipant
        fields = ('id', 'user', 'role', 'joined_at')
        read_only_fields = fields


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageAttachment
        fields = ('id', 'file', 'filename', 'file_size', 'content_type', 'thumbnail')
        read_only_fields = fields


class MessageSerializer(serializers.ModelSerializer):
    sender = ChatUserSerializer(read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    parent_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    attachment_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Message
        fields = (
            'id', 'room', 'sender', 'type', 'text', 'parent', 'parent_id',
            'attachments', 'attachment_ids', 'is_edited', 'is_deleted',
            'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'room', 'sender', 'parent', 'is_edited', 'is_deleted',
            'created_at', 'updated_at',
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.is_deleted:
            data['text'] = ''
            data['attachments'] = []
        if instance.parent_id:
            data['parent'] = {
                'id': instance.parent.id,
                'text': instance.parent.text[:100] if instance.parent.text else '',
                'sender': ChatUserSerializer(instance.parent.sender).data if instance.parent.sender else None,
            }
        return data


class RoomListSerializer(serializers.ModelSerializer):
    participants = ParticipantSerializer(many=True, read_only=True)
    last_message_text = serializers.CharField(read_only=True, default='')
    last_message_type = serializers.CharField(read_only=True, default='text')
    last_message_at = serializers.DateTimeField(read_only=True, default=None)
    last_message_sender_id = serializers.IntegerField(read_only=True, default=None)
    unread_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = ChatRoom
        fields = (
            'id', 'type', 'title', 'avatar', 'write_access', 'is_active',
            'participants', 'last_message_text', 'last_message_type',
            'last_message_at', 'last_message_sender_id', 'unread_count',
            'created_at', 'updated_at',
        )
        read_only_fields = fields


class RoomDetailSerializer(serializers.ModelSerializer):
    participants = ParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = ChatRoom
        fields = ('id', 'type', 'title', 'avatar', 'write_access', 'participants', 'created_by', 'created_at', 'updated_at')
        read_only_fields = fields


class CreateDirectRoomSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        if not User.objects.filter(pk=value, is_active=True).exists():
            raise serializers.ValidationError('User not found.')
        if value == self.context['request'].user.pk:
            raise serializers.ValidationError('Cannot create chat with yourself.')
        return value


class CreateGroupRoomSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(), min_length=1
    )

    def validate_participant_ids(self, value):
        existing = set(
            User.objects.filter(pk__in=value, is_active=True).values_list('pk', flat=True)
        )
        invalid = set(value) - existing
        if invalid:
            raise serializers.ValidationError(f'Users not found: {invalid}')
        return value


class CreateRoomSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=['direct', 'group'])
    user_id = serializers.IntegerField(required=False)
    title = serializers.CharField(max_length=255, required=False, default='')
    write_access = serializers.ChoiceField(choices=['all', 'staff'], required=False, default='all')
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, default=list
    )

    def validate(self, attrs):
        if attrs['type'] == 'direct':
            if not attrs.get('user_id'):
                raise serializers.ValidationError({'user_id': 'Required for direct chat.'})
            if attrs['user_id'] == self.context['request'].user.pk:
                raise serializers.ValidationError({'user_id': 'Cannot create chat with yourself.'})
            if not User.objects.filter(pk=attrs['user_id'], is_active=True).exists():
                raise serializers.ValidationError({'user_id': 'User not found.'})
        elif attrs['type'] == 'group':
            if not attrs.get('title'):
                raise serializers.ValidationError({'title': 'Required for group chat.'})
            if not attrs.get('participant_ids'):
                raise serializers.ValidationError({'participant_ids': 'At least one participant required.'})
            participant_ids = attrs['participant_ids']
            existing = User.objects.filter(pk__in=participant_ids, is_active=True).count()
            if existing != len(set(participant_ids)):
                raise serializers.ValidationError({'participant_ids': 'Деякі користувачі не знайдені.'})
        return attrs


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        if value.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(f'File too large. Max {MAX_FILE_SIZE // (1024*1024)}MB.')

        ext = value.name.rsplit('.', 1)[-1].lower() if '.' in value.name else ''
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(f'File type .{ext} not allowed.')

        mime = magic.from_buffer(value.read(2048), mime=True)
        value.seek(0)
        allowed_mimes = {
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip',
        }
        if mime not in allowed_mimes:
            raise serializers.ValidationError(f'MIME type {mime} not allowed.')

        return value


class AddParticipantSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        if not User.objects.filter(pk=value, is_active=True).exists():
            raise serializers.ValidationError('User not found.')
        return value
