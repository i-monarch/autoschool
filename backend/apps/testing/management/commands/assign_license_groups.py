import re

from django.core.management.base import BaseCommand

from apps.testing.models import TestCategory


GROUP_PATTERNS = [
    (re.compile(r'A1/A'), ['A1A']),
    (re.compile(r'B1/B'), ['B1B']),
    (re.compile(r'C1/C'), ['C1C']),
    (re.compile(r'D1/D'), ['D1D']),
    (re.compile(r'BE/CE/DE'), ['BECEDE']),
    (re.compile(r'Додаткові питання\s+T(\s|$)'), ['T']),
]


def groups_for_name(name: str) -> list[str]:
    for pattern, groups in GROUP_PATTERNS:
        if pattern.search(name):
            return groups
    return []


class Command(BaseCommand):
    help = 'Assign license groups to test categories based on category names.'

    def handle(self, *args, **options):
        updated = 0
        for category in TestCategory.objects.all():
            license_groups = groups_for_name(category.name)
            if category.license_groups == license_groups:
                continue
            category.license_groups = license_groups
            category.save(update_fields=['license_groups'])
            updated += 1

        self.stdout.write(self.style.SUCCESS(f'Updated {updated} categories.'))
