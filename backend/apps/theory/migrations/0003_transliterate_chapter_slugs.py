import re

from django.db import migrations
from django.utils.text import slugify


_UK_TRANSLIT = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g',
    'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
    'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k',
    'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
    'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ь': '', 'ю': 'yu', 'я': 'ya', '\u0027': '', '\u2019': '',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G',
    'Д': 'D', 'Е': 'E', 'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z',
    'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K',
    'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
    'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
    'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ь': '', 'Ю': 'Yu', 'Я': 'Ya',
}

_CYRILLIC_RE = re.compile('[а-яА-ЯіїєґІЇЄҐ]')


def _transliterate(text):
    return ''.join(_UK_TRANSLIT.get(c, c) for c in text)


def forwards(apps, schema_editor):
    TheoryChapter = apps.get_model('theory', 'TheoryChapter')

    for chapter in TheoryChapter.objects.all():
        if not _CYRILLIC_RE.search(chapter.slug):
            continue

        new_slug = slugify(_transliterate(chapter.title[:60]))[:190]
        if not new_slug:
            new_slug = f'chapter-{chapter.number}'

        # resolve duplicates within section
        existing = set(
            TheoryChapter.objects.filter(section=chapter.section)
            .exclude(pk=chapter.pk)
            .values_list('slug', flat=True)
        )
        final_slug = new_slug
        counter = 2
        while final_slug in existing:
            suffix = f'-{counter}'
            final_slug = new_slug[:190 - len(suffix)] + suffix
            counter += 1

        chapter.slug = final_slug
        chapter.save(update_fields=['slug'])


class Migration(migrations.Migration):

    dependencies = [
        ('theory', '0002_alter_theorychapter_slug'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
