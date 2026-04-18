"""
Import PDR questions from parsed JSON file.
Usage: python manage.py import_pdr /path/to/pdr_questions.json
"""

import json
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.testing.models import TestCategory, Question, Answer


class Command(BaseCommand):
    help = 'Import PDR questions from JSON file'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str)
        parser.add_argument('--clear', action='store_true', help='Clear existing data before import')

    def handle(self, *args, **options):
        json_file = options['json_file']

        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if options['clear']:
            self.stdout.write('Clearing existing data...')
            AttemptAnswer = Answer  # just for safety
            Answer.objects.all().delete()
            Question.objects.all().delete()
            TestCategory.objects.all().delete()

        meta = data.get('meta', {})
        self.stdout.write(f"Source: {meta.get('source')}, parsed: {meta.get('parsed_at')}")
        self.stdout.write(f"Total questions in file: {meta.get('total_questions')}")

        # Import categories
        theme_map = {}
        for i, theme in enumerate(data.get('themes', [])):
            cat, created = TestCategory.objects.update_or_create(
                slug=slugify(f"theme-{theme['id']}"),
                defaults={
                    'name': theme['name'],
                    'order': i,
                    'question_count': theme.get('question_count', 0),
                },
            )
            theme_map[theme['id']] = cat
            status = 'created' if created else 'updated'
            self.stdout.write(f'  [{status}] {cat.name} ({cat.question_count} questions)')

        # Import questions
        created_count = 0
        skipped_count = 0
        no_correct_count = 0

        for q_data in data.get('questions', []):
            if not q_data.get('answers'):
                skipped_count += 1
                continue

            has_correct = any(a['is_correct'] for a in q_data['answers'])
            if not has_correct:
                no_correct_count += 1

            category = theme_map.get(q_data.get('theme_id'))
            if not category:
                skipped_count += 1
                continue

            question, created = Question.objects.update_or_create(
                number=q_data['number'],
                defaults={
                    'category': category,
                    'text': q_data['text'],
                    'image': q_data.get('image_url'),
                    'explanation': q_data.get('explanation'),
                },
            )

            if created:
                created_count += 1

            # Update or create answers by (question, order) so that existing
            # Answer PKs are preserved. This keeps AttemptAnswer.selected_answer
            # references alive (FK is CASCADE). Drop any extra old answers.
            new_count = len(q_data['answers'])
            for idx, a_data in enumerate(q_data['answers']):
                Answer.objects.update_or_create(
                    question=question,
                    order=idx,
                    defaults={
                        'text': a_data['text'],
                        'is_correct': a_data.get('is_correct', False),
                    },
                )
            question.answers.filter(order__gte=new_count).delete()

        # Update category question counts
        for cat in TestCategory.objects.all():
            cat.question_count = cat.questions.count()
            cat.save(update_fields=['question_count'])

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Created: {created_count}, skipped: {skipped_count}, '
            f'without correct answer: {no_correct_count}'
        ))
