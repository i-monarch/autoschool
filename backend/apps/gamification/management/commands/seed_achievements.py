from django.core.management.base import BaseCommand
from apps.gamification.models import Achievement


ACHIEVEMENTS = [
    # Tests
    {'code': 'first_test', 'name': 'Перший крок', 'description': 'Пройти перший тест', 'icon': 'rocket', 'category': 'tests', 'xp_reward': 50, 'condition_type': 'tests_completed', 'condition_value': 1, 'order': 1},
    {'code': 'tests_10', 'name': 'Практикант', 'description': 'Пройти 10 тестів', 'icon': 'clipboard-check', 'category': 'tests', 'xp_reward': 100, 'condition_type': 'tests_completed', 'condition_value': 10, 'order': 2},
    {'code': 'tests_50', 'name': 'Досвідчений', 'description': 'Пройти 50 тестів', 'icon': 'award', 'category': 'tests', 'xp_reward': 300, 'condition_type': 'tests_completed', 'condition_value': 50, 'order': 3},
    {'code': 'tests_100', 'name': 'Майстер тестів', 'description': 'Пройти 100 тестів', 'icon': 'crown', 'category': 'tests', 'xp_reward': 500, 'condition_type': 'tests_completed', 'condition_value': 100, 'order': 4},
    {'code': 'pass_5', 'name': 'Впевнений старт', 'description': 'Здати 5 тестів', 'icon': 'check-circle', 'category': 'tests', 'xp_reward': 100, 'condition_type': 'tests_passed', 'condition_value': 5, 'order': 5},
    {'code': 'pass_25', 'name': 'Стабільний результат', 'description': 'Здати 25 тестів', 'icon': 'shield-check', 'category': 'tests', 'xp_reward': 250, 'condition_type': 'tests_passed', 'condition_value': 25, 'order': 6},
    {'code': 'perfect', 'name': 'Ідеально!', 'description': 'Відповісти на всі питання правильно', 'icon': 'star', 'category': 'tests', 'xp_reward': 200, 'condition_type': 'perfect_score', 'condition_value': 10, 'order': 7},
    {'code': 'correct_100', 'name': 'Сотня правильних', 'description': '100 правильних відповідей', 'icon': 'target', 'category': 'tests', 'xp_reward': 150, 'condition_type': 'total_correct', 'condition_value': 100, 'order': 8},
    {'code': 'correct_500', 'name': 'П\'ятсот вірних', 'description': '500 правильних відповідей', 'icon': 'zap', 'category': 'tests', 'xp_reward': 400, 'condition_type': 'total_correct', 'condition_value': 500, 'order': 9},
    {'code': 'correct_1000', 'name': 'Тисяча!', 'description': '1000 правильних відповідей', 'icon': 'flame', 'category': 'tests', 'xp_reward': 750, 'condition_type': 'total_correct', 'condition_value': 1000, 'order': 10},
    # Streaks
    {'code': 'streak_3', 'name': 'Три дні поспіль', 'description': 'Навчатися 3 дні поспіль', 'icon': 'flame', 'category': 'streak', 'xp_reward': 100, 'condition_type': 'current_streak', 'condition_value': 3, 'order': 11},
    {'code': 'streak_7', 'name': 'Тижневий марафон', 'description': 'Навчатися 7 днів поспіль', 'icon': 'flame', 'category': 'streak', 'xp_reward': 300, 'condition_type': 'current_streak', 'condition_value': 7, 'order': 12},
    {'code': 'streak_14', 'name': 'Два тижні!', 'description': 'Навчатися 14 днів поспіль', 'icon': 'flame', 'category': 'streak', 'xp_reward': 500, 'condition_type': 'current_streak', 'condition_value': 14, 'order': 13},
    {'code': 'streak_30', 'name': 'Місяць без пропусків', 'description': 'Навчатися 30 днів поспіль', 'icon': 'trophy', 'category': 'streak', 'xp_reward': 1000, 'condition_type': 'current_streak', 'condition_value': 30, 'order': 14},
    {'code': 'days_10', 'name': '10 днів навчання', 'description': 'Займатися 10 різних днів', 'icon': 'calendar', 'category': 'streak', 'xp_reward': 150, 'condition_type': 'total_study_days', 'condition_value': 10, 'order': 15},
    {'code': 'days_30', 'name': '30 днів навчання', 'description': 'Займатися 30 різних днів', 'icon': 'calendar-check', 'category': 'streak', 'xp_reward': 500, 'condition_type': 'total_study_days', 'condition_value': 30, 'order': 16},
    # XP / Level
    {'code': 'level_5', 'name': 'Рівень 5', 'description': 'Досягти 5 рівня', 'icon': 'trending-up', 'category': 'tests', 'xp_reward': 200, 'condition_type': 'level', 'condition_value': 5, 'order': 17},
    {'code': 'level_10', 'name': 'Рівень 10', 'description': 'Досягти 10 рівня', 'icon': 'medal', 'category': 'tests', 'xp_reward': 500, 'condition_type': 'level', 'condition_value': 10, 'order': 18},
    {'code': 'xp_1000', 'name': '1000 XP', 'description': 'Набрати 1000 балів досвіду', 'icon': 'sparkles', 'category': 'tests', 'xp_reward': 100, 'condition_type': 'total_xp', 'condition_value': 1000, 'order': 19},
    {'code': 'xp_5000', 'name': '5000 XP', 'description': 'Набрати 5000 балів досвіду', 'icon': 'gem', 'category': 'tests', 'xp_reward': 300, 'condition_type': 'total_xp', 'condition_value': 5000, 'order': 20},
]


class Command(BaseCommand):
    help = 'Seed achievements'

    def handle(self, *args, **options):
        created = 0
        updated = 0
        for data in ACHIEVEMENTS:
            code = data.pop('code')
            obj, was_created = Achievement.objects.update_or_create(code=code, defaults=data)
            data['code'] = code
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(f'Achievements: {created} created, {updated} updated'))
