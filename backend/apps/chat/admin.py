from django.contrib import admin

from .models import ChatParticipant, ChatRoom, Message, MessageAttachment


class ParticipantInline(admin.TabularInline):
    model = ChatParticipant
    extra = 0
    raw_id_fields = ('user',)


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'title', 'created_by', 'is_active', 'created_at')
    list_filter = ('type', 'is_active')
    search_fields = ('title',)
    raw_id_fields = ('created_by',)
    inlines = [ParticipantInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'sender', 'type', 'short_text', 'is_deleted', 'created_at')
    list_filter = ('type', 'is_deleted')
    search_fields = ('text',)
    raw_id_fields = ('room', 'sender', 'parent')

    def short_text(self, obj):
        return obj.text[:80] if obj.text else ''
    short_text.short_description = 'Text'


@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'filename', 'content_type', 'file_size', 'created_at')
    raw_id_fields = ('message',)
