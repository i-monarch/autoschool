from django.db import models
from django.utils.translation import gettext_lazy as _


class Tariff(models.Model):
    name = models.CharField(_('name'), max_length=100)
    description = models.TextField(_('description'), blank=True, default='')
    price = models.DecimalField(_('price'), max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField(_('duration (days)'))
    features = models.JSONField(_('features'), default=list, blank=True)
    is_popular = models.BooleanField(_('popular'), default=False)
    is_active = models.BooleanField(_('active'), default=True)
    order = models.PositiveIntegerField(_('order'), default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'price']
        verbose_name = _('tariff')
        verbose_name_plural = _('tariffs')

    def __str__(self):
        return self.name
