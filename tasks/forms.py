from django import forms
from .models import Task
from django.contrib.auth.models import User

class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['title', 'description', 'due_date', 'status', 'priority', 'assigned_to']  # Поля по умолчанию

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)  # Извлекаем пользователя из kwargs
        super(TaskForm, self).__init__(*args, **kwargs)
        
        # Проверяем, является ли пользователь членом определенных групп
        if user and not (user.groups.filter(name='Администраторы').exists() 
                         or user.groups.filter(name='Руководители проектов').exists() 
                         or user.groups.filter(name='Назначающие задания').exists()):
            # Назначаем поле assigned_to текущему пользователю
            self.fields['assigned_to'].initial = user
            # Делаем поле только для чтения, чтобы пользователь не мог его изменить
            self.fields['assigned_to'].widget.attrs['readonly'] = True
            self.fields['assigned_to'].disabled = True  # Отключаем изменение поля
            