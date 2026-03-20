from django.db import models


class ExamCenter(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    address = models.CharField(max_length=300)
    phone = models.CharField(max_length=50, blank=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'city', 'name']

    def __str__(self):
        return f'{self.name} ({self.city})'


class ExamRoute(models.Model):
    center = models.ForeignKey(ExamCenter, on_delete=models.CASCADE, related_name='routes')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    map_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name
