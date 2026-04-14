from django.contrib import admin
from .models import TimeSlot, Booking


class BookingInline(admin.TabularInline):
    model = Booking
    extra = 0
    readonly_fields = ['created_at', 'cancelled_at']


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['teacher', 'date', 'start_time', 'end_time', 'lesson_type', 'status']
    list_filter = ['status', 'lesson_type', 'date']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'title']
    inlines = [BookingInline]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['student', 'slot', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'cancelled_at']
