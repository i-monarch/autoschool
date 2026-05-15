from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('testing', '0002_testcategory_license_groups'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='is_hard',
            field=models.BooleanField(db_index=True, default=False, verbose_name='hard question'),
        ),
    ]
