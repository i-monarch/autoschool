from django.db import models
from django.utils.translation import gettext_lazy as _


class PartnerSchool(models.Model):
    name = models.CharField(_('name'), max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(_('description'), blank=True)
    logo = models.ImageField(_('logo'), upload_to='partners/', blank=True)
    city = models.CharField(_('city'), max_length=100)
    address = models.CharField(_('address'), max_length=300, blank=True)
    phone = models.CharField(_('phone'), max_length=30, blank=True)
    website = models.URLField(_('website'), blank=True)
    email = models.EmailField(_('email'), blank=True)
    services = models.TextField(_('services'), blank=True, help_text='Comma-separated: theory,practice,exam')
    price_from = models.PositiveIntegerField(_('price from'), null=True, blank=True)
    rating = models.DecimalField(_('rating'), max_digits=2, decimal_places=1, default=0)
    is_active = models.BooleanField(_('active'), default=True)
    order = models.PositiveIntegerField(_('order'), default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'partner_schools'
        ordering = ['order', 'name']

    def __str__(self):
        return f'{self.name} ({self.city})'
