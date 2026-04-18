from django.conf import settings
from django.db import models
from django.utils import timezone


class StudyStreak(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_streak',
    )
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    total_study_days = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'study_streaks'

    def __str__(self):
        return f'{self.user} — {self.current_streak} days'

    def record_activity(self):
        today = timezone.localdate()
        if self.last_activity_date == today:
            return

        if self.last_activity_date == today - timezone.timedelta(days=1):
            self.current_streak += 1
        elif self.last_activity_date != today:
            self.current_streak = 1

        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak

        self.last_activity_date = today
        self.total_study_days += 1
        self.save()


class Achievement(models.Model):
    CATEGORY_CHOICES = [
        ('tests', 'Tests'),
        ('streak', 'Streak'),
        ('theory', 'Theory'),
        ('courses', 'Courses'),
        ('social', 'Social'),
    ]
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    icon = models.CharField(max_length=50, help_text='SVG icon name or emoji')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    xp_reward = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    condition_type = models.CharField(max_length=50)
    condition_value = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'achievements'
        ordering = ['order']

    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements',
    )
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_achievements'
        unique_together = ['user', 'achievement']
        ordering = ['-earned_at']

    def __str__(self):
        return f'{self.user} — {self.achievement.name}'


class DailyGoal(models.Model):
    GOAL_CHOICES = [
        (20, '20'),
        (30, '30'),
        (40, '40'),
        (50, '50'),
        (60, '60'),
    ]
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_goal',
    )
    target_questions = models.PositiveIntegerField(default=20, choices=GOAL_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'daily_goals'

    def __str__(self):
        return f'{self.user} — {self.target_questions} questions/day'


class DailyProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_progress',
    )
    date = models.DateField()
    questions_answered = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    tests_completed = models.PositiveIntegerField(default=0)
    study_minutes = models.PositiveIntegerField(default=0)
    xp_earned = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'daily_progress'
        unique_together = ['user', 'date']
        ordering = ['-date']

    def __str__(self):
        return f'{self.user} — {self.date} — {self.questions_answered}q'


class UserXP(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='xp',
    )
    total_xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'user_xp'

    def __str__(self):
        return f'{self.user} — Level {self.level} ({self.total_xp} XP)'

    @staticmethod
    def xp_for_level(level):
        return level * 100

    def add_xp(self, amount):
        self.total_xp += amount
        while self.total_xp >= self.xp_for_level(self.level):
            self.level += 1
        self.save()
