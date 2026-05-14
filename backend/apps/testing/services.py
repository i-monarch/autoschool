from django.db.models import Q

from apps.gamification.models import Achievement, UserAchievement

from .models import AttemptAnswer, Question, TestAttempt, TestCategory

USER_CAT_TO_GROUPS = {
    'A': ['A1A'],
    'A1': ['A1A'],
    'B': ['B1B'],
    'B1': ['B1B'],
    'C': ['C1C'],
    'C1': ['C1C'],
    'D': ['D1D'],
    'D1': ['D1D'],
    'BE': ['BECEDE'],
    'CE': ['BECEDE'],
    'DE': ['BECEDE'],
    'C1E': ['BECEDE', 'C1C'],
    'D1E': ['BECEDE', 'D1D'],
    'T': ['T'],
}

ALL_USER_CATS = set(USER_CAT_TO_GROUPS.keys())


def groups_for_user(user) -> set:
    categories = getattr(user, 'license_categories', None) or ['B']
    groups = set()
    for category in categories:
        groups.update(USER_CAT_TO_GROUPS.get(category, []))
    return groups or set(USER_CAT_TO_GROUPS['B'])


def license_group_filter(groups: set, field_name: str = 'license_groups') -> Q:
    group_list = sorted(groups)
    query = Q(**{field_name: []})
    if group_list:
        query |= Q(**{f'{field_name}__has_any_keys': group_list})
    return query


def user_categories_queryset(user, include_empty_name: bool = True):
    queryset = TestCategory.objects.filter(question_count__gt=0)
    if not include_empty_name:
        queryset = queryset.exclude(name='Без теми')
    if getattr(user, 'is_authenticated', False):
        queryset = queryset.filter(license_group_filter(groups_for_user(user)))
    return queryset


def user_questions_queryset(user):
    queryset = Question.objects.filter(category__question_count__gt=0)
    if getattr(user, 'is_authenticated', False):
        queryset = queryset.filter(
            license_group_filter(groups_for_user(user), 'category__license_groups')
        )
    return queryset


def build_test_stats(user) -> dict:
    attempts = TestAttempt.objects.filter(user=user, finished_at__isnull=False)
    categories = list(user_categories_queryset(user, include_empty_name=False))
    pool_questions = user_questions_queryset(user).exclude(category__name='Без теми')
    total_pool_questions = pool_questions.count()

    answered = AttemptAnswer.objects.filter(
        attempt__user=user,
        attempt__finished_at__isnull=False,
        question__in=pool_questions,
        selected_answer__isnull=False,
    )

    total_attempts = attempts.count()
    total_correct = sum(attempt.score for attempt in attempts)
    total_questions = sum(attempt.total for attempt in attempts)
    total_wrong = total_questions - total_correct
    avg_percent = round(total_correct / total_questions * 100) if total_questions else 0
    passed_count = attempts.filter(is_passed=True).count()
    failed_count = total_attempts - passed_count
    unique_answered = answered.values('question_id').distinct().count()
    unique_correct = answered.filter(is_correct=True).values('question_id').distinct().count()
    overall_progress_percent = (
        round(unique_answered / total_pool_questions * 100)
        if total_pool_questions else 0
    )

    category_stats = []
    for category in categories:
        category_answers = answered.filter(question__category=category)
        category_total = category_answers.count()
        category_correct = category_answers.filter(is_correct=True).count()
        category_wrong = category_total - category_correct
        total_in_topic = category.questions.count()
        category_unique_answered = category_answers.values('question_id').distinct().count()
        category_unique_correct = (
            category_answers.filter(is_correct=True).values('question_id').distinct().count()
        )
        category_percent = (
            round(category_correct / category_total * 100)
            if category_total else 0
        )
        completion_percent = (
            round(category_unique_answered / total_in_topic * 100)
            if total_in_topic else 0
        )
        category_stats.append({
            'category_id': category.id,
            'category_name': category.name,
            'attempts': category_answers.values('attempt_id').distinct().count(),
            'correct': category_correct,
            'wrong': category_wrong,
            'total': category_total,
            'percent': category_percent,
            'total_in_topic': total_in_topic,
            'unique_answered': category_unique_answered,
            'unique_correct': category_unique_correct,
            'completion_percent': completion_percent,
        })

    attempted_categories = [item for item in category_stats if item['attempts'] > 0]
    weakest = min(attempted_categories, key=lambda item: item['percent'], default=None)
    if weakest is None and category_stats:
        weakest = category_stats[0]

    category_stats.sort(key=lambda item: (item['percent'], item['category_name']))

    return {
        'total_attempts': total_attempts,
        'total_correct': total_correct,
        'total_wrong': total_wrong,
        'total_questions': total_questions,
        'avg_percent': avg_percent,
        'passed_count': passed_count,
        'failed_count': failed_count,
        'overall_progress_percent': overall_progress_percent,
        'unique_questions_answered': unique_answered,
        'unique_questions_correct': unique_correct,
        'total_pool_questions': total_pool_questions,
        'weakest_topic': {
            'category_id': weakest['category_id'],
            'category_name': weakest['category_name'],
            'percent': weakest['percent'],
        } if weakest else None,
        'achievements_earned': UserAchievement.objects.filter(user=user).count(),
        'achievements_total': Achievement.objects.count(),
        'by_category': category_stats,
    }
