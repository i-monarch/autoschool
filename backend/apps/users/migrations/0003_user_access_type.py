from django.db import migrations, models


def sync_access_type(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(is_paid=True).update(access_type='paid')


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_user_is_paid_user_paid_until'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='access_type',
            field=models.CharField(
                choices=[('free', 'Free'), ('trial', 'Trial'), ('paid', 'Paid')],
                default='free',
                max_length=10,
                verbose_name='access type',
            ),
        ),
        migrations.RunPython(sync_access_type, migrations.RunPython.noop),
    ]
