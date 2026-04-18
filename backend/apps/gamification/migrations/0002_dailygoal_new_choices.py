from django.db import migrations, models


def upgrade_existing_goals(apps, schema_editor):
    DailyGoal = apps.get_model('gamification', 'DailyGoal')
    DailyGoal.objects.filter(target_questions__in=[5, 10]).update(target_questions=20)


class Migration(migrations.Migration):

    dependencies = [
        ('gamification', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(upgrade_existing_goals, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='dailygoal',
            name='target_questions',
            field=models.PositiveIntegerField(
                choices=[(20, '20'), (30, '30'), (40, '40'), (50, '50'), (60, '60')],
                default=20,
            ),
        ),
    ]
