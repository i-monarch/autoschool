from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from apps.testing.models import TestAttempt
from .models import StudyStreak, DailyProgress, UserXP, UserAchievement, Achievement


@receiver(post_save, sender=TestAttempt)
def on_test_finished(sender, instance, **kwargs):
    if not instance.finished_at:
        return

    user = instance.user
    if user.role != 'student':
        return

    today = timezone.localdate()

    streak, _ = StudyStreak.objects.get_or_create(user=user)
    streak.record_activity()

    progress, _ = DailyProgress.objects.get_or_create(user=user, date=today)
    progress.questions_answered += instance.total
    progress.correct_answers += instance.score
    progress.tests_completed += 1
    if instance.started_at and instance.finished_at:
        minutes = int((instance.finished_at - instance.started_at).total_seconds() / 60)
        progress.study_minutes += max(minutes, 1)

    xp_amount = instance.score * 10
    if instance.is_passed:
        xp_amount += 50
    progress.xp_earned += xp_amount
    progress.save()

    user_xp, _ = UserXP.objects.get_or_create(user=user)
    user_xp.add_xp(xp_amount)

    check_achievements(user)


def check_achievements(user):
    earned_codes = set(
        UserAchievement.objects.filter(user=user).values_list('achievement__code', flat=True)
    )
    achievements = Achievement.objects.exclude(code__in=earned_codes)

    from apps.testing.models import TestAttempt
    streak = StudyStreak.objects.filter(user=user).first()
    user_xp = UserXP.objects.filter(user=user).first()

    for ach in achievements:
        earned = False
        ct = ach.condition_type
        cv = ach.condition_value

        if ct == 'tests_completed':
            count = TestAttempt.objects.filter(user=user, finished_at__isnull=False).count()
            earned = count >= cv
        elif ct == 'tests_passed':
            count = TestAttempt.objects.filter(user=user, finished_at__isnull=False, is_passed=True).count()
            earned = count >= cv
        elif ct == 'perfect_score':
            from django.db.models import F
            earned = TestAttempt.objects.filter(
                user=user, finished_at__isnull=False, score=F('total'), total__gte=cv,
            ).exists()
        elif ct == 'current_streak' and streak:
            earned = streak.current_streak >= cv
        elif ct == 'total_study_days' and streak:
            earned = streak.total_study_days >= cv
        elif ct == 'total_xp' and user_xp:
            earned = user_xp.total_xp >= cv
        elif ct == 'level' and user_xp:
            earned = user_xp.level >= cv
        elif ct == 'total_correct':
            from django.db.models import Sum
            total = TestAttempt.objects.filter(
                user=user, finished_at__isnull=False,
            ).aggregate(s=Sum('score'))['s'] or 0
            earned = total >= cv

        if earned:
            ua, created = UserAchievement.objects.get_or_create(user=user, achievement=ach)
            if created and ach.xp_reward and user_xp:
                user_xp.add_xp(ach.xp_reward)
