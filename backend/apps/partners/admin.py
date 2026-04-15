from django.contrib import admin
from .models import PartnerSchool


@admin.register(PartnerSchool)
class PartnerSchoolAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'phone', 'is_active', 'order']
    list_filter = ['is_active', 'city']
    search_fields = ['name', 'city']
    prepopulated_fields = {'slug': ('name',)}
