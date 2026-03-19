from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class TestCategory(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    order = models.PositiveIntegerField(default=0)
    question_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'test categories'

    def __str__(self):
        return self.name


class Question(models.Model):
    category = models.ForeignKey(TestCategory, on_delete=models.CASCADE, related_name='questions')
    number = models.PositiveIntegerField(unique=True, help_text='Original question number from source')
    text = models.TextField()
    image = models.URLField(blank=True, null=True)
    explanation = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['number']

    def __str__(self):
        return f'#{self.number}: {self.text[:60]}'


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        mark = 'V' if self.is_correct else 'X'
        return f'[{mark}] {self.text[:50]}'


class Test(models.Model):
    class TestType(models.TextChoices):
        TOPIC = 'topic', _('За темою')
        EXAM = 'exam', _('Екзамен')
        MARATHON = 'marathon', _('Марафон')

    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TestType.choices)
    category = models.ForeignKey(TestCategory, on_delete=models.SET_NULL, null=True, blank=True)
    questions_count = models.PositiveIntegerField(default=20)
    time_limit_minutes = models.PositiveIntegerField(null=True, blank=True)
    pass_percent = models.PositiveIntegerField(default=80)
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class TestAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='test_attempts')
    test_type = models.CharField(max_length=20, choices=Test.TestType.choices)
    category = models.ForeignKey(TestCategory, on_delete=models.SET_NULL, null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    score = models.PositiveIntegerField(default=0)
    total = models.PositiveIntegerField(default=0)
    is_passed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f'{self.user} — {self.test_type} — {self.score}/{self.total}'


class AttemptAnswer(models.Model):
    attempt = models.ForeignKey(TestAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.ForeignKey(Answer, on_delete=models.CASCADE, null=True, blank=True)
    is_correct = models.BooleanField(default=False)

    class Meta:
        unique_together = ['attempt', 'question']
