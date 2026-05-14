from django.db import migrations, models
import apps.users.models


def backfill_license_categories(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(license_categories=[]).update(license_categories=['B'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_user_access_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='license_categories',
            field=models.JSONField(default=apps.users.models.list_with_b_default),
        ),
        migrations.RunPython(backfill_license_categories, migrations.RunPython.noop),
    ]
