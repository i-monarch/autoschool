from django.db import models


class TheorySection(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Lucide icon name')
    order = models.PositiveIntegerField(default=0)
    chapters_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class TheoryChapter(models.Model):
    section = models.ForeignKey(TheorySection, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=200)
    number = models.PositiveIntegerField(default=0)
    content = models.TextField(help_text='HTML content')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ['section', 'slug']

    def __str__(self):
        return f'{self.section.title} — {self.title}'
