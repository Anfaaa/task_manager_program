# serializers.py 

import logging
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from .models import Task, Comment
from django.utils import timezone

User = get_user_model()
logger = logging.getLogger(__name__)


# Сериалайзер для задач
class TaskSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True) 
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'title', 
            'description', 
            'due_date', 
            'status', 
            'priority',
            'created_by',
            'assigned_to',
            'created_at',  
            'updated_at',
            'created_by_name',
            'assigned_to_name',
        ]
        extra_kwargs = {
            'description': {'required': False},
            'assigned_to': {'required': False},
        }


# Сериалайзер для регистрации
class UserRegistrationSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)  

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Этот логин уже занят.")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже зарегестрирован.")
        return value

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    

# Сериалайзер для входа в систему
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        self.user.last_login = timezone.now()
        self.user.save()

        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'group': self.user.group.name
        }
        return data
    

# Сериалайзер пользователя (информации о пользователе)
class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'groups', 'last_login', 'date_joined'
        ]

    def get_groups(self, obj):
        return obj.group.name if obj.group else None


# Сериализатор для комментариев
class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'task', 'user', 'text', 'created_at', 'is_edited', 'user_name',]
        read_only_fields = ['created_at', 'is_edited']


# Сериализатор для профиля пользователя
class UserProfileSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'current_password', 'password', 'email']

    def validate(self, data):
        user = self.context['request'].user
        current_password = data.get('current_password')

        if current_password:
            user = authenticate(username=user.username, password=current_password)
            if not user:
                raise serializers.ValidationError('Неверный текущий пароль.')

        return data
    
    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError('Этот email уже используется другим пользователем.')
        return value

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])

        instance.save()
        return instance
    

# Сериализатор для восстановления пароля
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email не найден.")
        return value
    
# Сериализатор для формы восстановления пароля
class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Пароли не совпадают.")
        return attrs

    def save(self, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_user_model().objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            raise serializers.ValidationError("Неверная ссылка для сброса пароля")

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError("Неверный токен")

        user.set_password(self.validated_data['new_password'])
        user.save()
        return user