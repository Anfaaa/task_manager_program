# models.py

from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils.timezone import now

class Group(models.Model):
    name = models.CharField(max_length=100, unique=True)  # Название группы
    
    def __str__(self):
        return self.name

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, first_name, last_name, password=None):
        if not email:
            raise ValueError("У пользователя должен быть указан email.")
        if not username:
            raise ValueError("У пользователя должно быть уникальное имя пользователя.")
        if not first_name or not last_name:
            raise ValueError("Имя и фамилия обязательны.")

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

class CustomUser(AbstractBaseUser):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150) 
    last_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True, max_length=254)
    password = models.CharField(max_length=128)
    date_joined = models.DateTimeField(default=now)
    last_login = models.DateTimeField(null=True, blank=True)
    group = models.ForeignKey(
        Group,
        related_name="users",
        on_delete=models.PROTECT,
        null=False,
        default=4,
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'group']

    def __str__(self):
        return self.email

class Task(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'В ожидании'),
        ('in_progress', 'В процессе'),
        ('in_review', 'На проверке'),
        ('blocked', 'Заблокировано'),
        ('canceled', 'Отменено'),
        ('paused', 'Приостановлено'),
        ('completed', 'Завершено'),
        ('overdue', 'Просрочено'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Низкий'),
        ('medium', 'Средний'),
        ('high', 'Высокий'),
    ]

    title = models.CharField(max_length=200) 
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True) 
    due_date = models.DateTimeField() 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting') 
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium') 
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True) 
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='tasks_created', on_delete=models.CASCADE)

    def __str__(self):
        return self.title

class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField() 
    created_at = models.DateTimeField(auto_now_add=True) 
    is_edited = models.BooleanField(default=False) 

    def __str__(self):
        return f"Комментарий пользователя {self.user.username} на задание: {self.task.title}"
