from django.contrib import admin

from .models import City


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'order', 'is_active')
    search_fields = ('name',)
    list_editable = ('order', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
