from django.db import migrations

def add_groups(apps, schema_editor):
    Group = apps.get_model('tasks', 'Group')
    Group.objects.get_or_create(name='Администраторы')
    Group.objects.get_or_create(name='Руководители проектов')
    Group.objects.get_or_create(name='Назначающие задания')
    Group.objects.get_or_create(name='Пользователи')

class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_groups),
    ]