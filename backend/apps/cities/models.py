from django.db import models
from django.utils.translation import gettext_lazy as _


class City(models.Model):
    name = models.CharField(_('name'), max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    region = models.CharField(_('region'), max_length=100, blank=True)
    is_active = models.BooleanField(_('active'), default=True)
    order = models.PositiveIntegerField(_('order'), default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cities'
        ordering = ['order', 'name']
        verbose_name = _('city')
        verbose_name_plural = _('cities')

    def __str__(self):
        return self.name
