from django.contrib import admin

from .models import Instructor


@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_verified', 'is_official', 'created_at')
    list_filter = ('is_verified', 'is_official', 'is_car_equipped')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__phone')
    readonly_fields = ('created_at', 'updated_at')
