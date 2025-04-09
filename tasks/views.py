# views.py

import logging
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.utils.translation import gettext as _
from rest_framework import viewsets, generics, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.views import APIView
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import Group, CustomUser
from .models import Task, Comment
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .serializers import *

# Логгирование
logger = logging.getLogger(__name__)

# Объединение групп для доступа к общим функциям
GROUP_NAMES = getattr(settings, 'TASK_ASSIGN_GROUPS', ['Руководители проектов', 'Назначающие задания'])
HEAD_GROUP_NAMES = getattr(settings, 'CONTROL_GROUPS', ['Администраторы', 'Руководители проектов'])
ADMIN_GROUP = 'Администраторы'

# Восстановление пароля (форма в письме для восстановления пароля)
class PasswordResetConfirmView(APIView):
    def post(self, request, uidb64, token):
        logger.info(f"UIDb64: {uidb64}, Token: {token}")
        
        serializer = PasswordResetConfirmSerializer(data=request.data)

        if serializer.is_valid():
            try:
                logger.info(f"Сериализатор прошел валидацию. Данные: {serializer.validated_data}")
                serializer.save(uidb64=uidb64, token=token)
                return Response({"message": "Пароль успешно изменен"}, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Ошибка при сбросе пароля: {e}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        logger.error(f"Ошибка в сериализаторе: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Восстановление пароля (отправление письма по email с восстановлением пароля)
class PasswordResetView(APIView):
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = CustomUser.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_link = f"{settings.FRONTEND_URL}/password-reset-confirm/{uid}/{token}/"

            send_mail(
                "Восстановление пароля",
                f"Перейдите по ссылке для сброса пароля: {reset_link}",
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            return Response({"detail": "На ваш email отправлено письмо с инструкциями по восстановлению пароля."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Профиль (изменение данных профиля, удаление аккаунта)
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

# Понижение руководителя проектов до назначающего задачи
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def demote_user_from_project_leader(request, user_id):
    user = request.user

    if not user.group.name == ADMIN_GROUP:
        return Response({'detail': 'У вас нет прав для понижения пользователей.'}, status=403)
    
    try:
        user_to_demote = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({'detail': 'Пользователь не найден.'}, status=404)

    if not user_to_demote.group.name == 'Руководители проектов':
        return Response({'detail': 'Этот пользователь не является руководителем проектов.'}, status=400)

    user_group = get_object_or_404(Group, name='Назначающие задания')
    user_to_demote.group = user_group
    user_to_demote.save()

    return Response({'detail': 'Пользователь успешно понижен до назначающего задания.'}, status=200)


# Повышение пользователя до руководителя проектов
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def promote_user_to_project_leader(request, user_id):
    user = request.user

    if not user.group.name == ADMIN_GROUP:
        return Response({'detail': 'У вас нет прав для повышения пользователей.'}, status=403)
    
    try:
        user_to_promote = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({'detail': 'Пользователь не найден.'}, status=404)

    if user_to_promote.group.name in HEAD_GROUP_NAMES:
        return Response({'detail': 'Этот пользователь либо администратор, либо уже является руководителем проектов.'}, status=400)

    leader_group = get_object_or_404(Group, name='Руководители проектов')
    user_to_promote.group = leader_group
    user_to_promote.save()
    
    return Response({'detail': 'Пользователь успешно повышен до руководителя проектами.'}, status=200)


# Понижение назначающего задания до пользователя
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def demote_user_from_task_assigner(request, user_id):
    user = request.user

    if user.group.name != 'Руководители проектов':
        return Response({'detail': 'У вас нет прав для понижения пользователей.'}, status=403)

    user_to_demote = get_object_or_404(CustomUser, id=user_id)

    if user_to_demote.group.name != 'Назначающие задания':
        return Response({'detail': 'Этот пользователь не является назначающим задачи.'}, status=400)

    Task.objects.filter(created_by=user_to_demote).exclude(assigned_to=user_to_demote).delete()

    user_group = get_object_or_404(Group, name='Пользователи')
    user_to_demote.group = user_group
    user_to_demote.save()

    return Response({'detail': 'Пользователь успешно понижен до пользователя, и его задачи удалены.'}, status=200)


# Повышение пользователя до назначающего задания
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def promote_user_to_task_assigner(request, user_id):
    user = request.user

    if user.group.name != 'Руководители проектов':
        return Response({'detail': 'У вас нет прав для повышения пользователей.'}, status=403)

    user_to_promote = get_object_or_404(CustomUser, id=user_id)

    if user_to_promote.group.name != 'Пользователи':
        return Response({'detail': 'Этот пользователь не является базовым пользователем, его нельзя повысить.'}, status=400)

    assigner_group = get_object_or_404(Group, name='Назначающие задания')
    user_to_promote.group = assigner_group
    user_to_promote.save()
    
    return Response({'detail': 'Пользователь успешно повышен до назначающего задачи.'}, status=200)


# Удаление комментария
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    try:
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return Response({'detail': 'Комментарий не найден.'}, status=404)
    
    if comment.user != request.user:
        return Response({'detail': 'Вы не можете удалить этот комментарий.'}, status=403)
    
    comment.delete()
    return Response({'detail': 'Комментарий удален.'}, status=204)


# Обновление (изменение) комментария
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_comment(request, comment_id):
    try:
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return Response({'detail': 'Комментарий не найден.'}, status=404)
    
    if comment.user != request.user:
        return Response({'detail': 'Вы не можете редактировать этот комментарий.'}, status=403)
    
    text = request.data.get('text')
    if text:
        comment.text = text
        comment.is_edited = True
        comment.save()
        serializer = CommentSerializer(comment)
        return Response(serializer.data)
    return Response({'detail': 'Текст комментария обязателен.'}, status=400)


# Получение комментариев к задаче
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_comments(request, task_id):
    task = Task.objects.get(id=task_id)
    comments = task.comment_set.all()
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)


# Создание комментария
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request, task_id):
    task = Task.objects.get(id=task_id)
    user = request.user
    text = request.data.get('text')

    if not (task.created_by == user or task.assigned_to == user or user.group.name == 'Руководители проектов'):
        return Response({'detail': 'Вам запрещено оставлять комментарии здесь.'}, status=403)
    
    if not text:
        return Response({'detail': 'Текст комментария обязателен.'}, status=400)
    
    comment = Comment.objects.create(task=task, user=user, text=text)
    serializer = CommentSerializer(comment)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# Список всех задач
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_tasks_view(request):
    user = request.user
    can_control = user.group.name in HEAD_GROUP_NAMES

    if can_control:
        tasks = Task.objects  # Получаем все задачи
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    else:
        return Response({'detail': 'Доступ запрещен.'}, status=403)


# Список задач, назначенных пользователем
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assigned_tasks_view(request):
    user = request.user
    can_assign_to_others = user.group.name in GROUP_NAMES

    if can_assign_to_others:
        tasks = Task.objects.filter(created_by=user).exclude(assigned_to=user) 
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    else:
        return Response({'detail': 'Доступ запрещен.'}, status=403)


# Класс для проверки прав на изменение и удаление задачи
class TaskPermissionMixin:
    def check_permissions_for_task(self, task):
        if not (task.created_by == self.request.user):
            raise PermissionDenied(_('Вы не можете изменить или удалить эту задачу, так как вы не являетесь ее автором'))


# Удаление задачи
class TaskDeleteView(TaskPermissionMixin, generics.DestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        self.check_permissions_for_task(instance)
        instance.delete()


# Обновление задачи
class TaskUpdateView(TaskPermissionMixin, generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        task = self.get_object()
        self.check_permissions_for_task(task)
        serializer.save()


# Обновление статуса задачи
class TaskUpdateStatusView(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        task = self.get_object()
        user = self.request.user
        
        if not (task.created_by == user or task.assigned_to == user or user.group.name == 'Руководители проектов'):
            raise PermissionDenied('У вас нет прав на изменение статуса этой задачи.')

        serializer.save()


# Получение информации о задаче
class TaskDetailView(generics.RetrieveAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


# Список задач пользователя
class UserTaskListView(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(assigned_to=self.request.user.id)


# Получение данных о пользователе
class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_group = user.group.name

        can_assign_tasks = user_group in GROUP_NAMES
        can_control = user_group in HEAD_GROUP_NAMES
        is_admin = user_group == ADMIN_GROUP
        is_leader = user_group == 'Руководители проектов'

        user_data = {
            "id": user.id,
            "username": user.username,
            "can_assign_tasks": can_assign_tasks,
            "can_control": can_control,
            "is_admin": is_admin,
            "is_leader": is_leader,
        }

        return Response(user_data)


# Создание задач
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        is_admin = user.group.name == ADMIN_GROUP
        if is_admin:
            raise serializers.ValidationError(_("Администраторам запрещено создавать задачи."))
        can_assign_to_others = user.group.name in GROUP_NAMES
        assigned_to = serializer.validated_data.get('assigned_to')
        if assigned_to and not can_assign_to_others:
            raise serializers.ValidationError(_("У вас нет прав назначать задачи другим пользователям."))
        if not can_assign_to_others:
            serializer.save(created_by=user, assigned_to=user)
        else:
            serializer.save(created_by=user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def available_assignees(self, request):
        user = request.user
        can_assign_to_others = user.group.name in GROUP_NAMES
        if can_assign_to_others:
            users = CustomUser.objects.all()
        else:
            users = CustomUser.objects.filter(id=user.id)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


# Получение списка пользователей
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    users = CustomUser.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


# Регистрация пользователя
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            try:
                group = Group.objects.get(id=4)
                user.group = group 
                user.save() 
            except Group.DoesNotExist:
                logger.error(f"Group with id {4} does not exist.")
                return Response({"error": _("Group with id 4 does not exist.")}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"message": _("User registered successfully.")}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Авторизация пользователя с обновлением времени последнего входа
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        try:
            decoded_token = AccessToken(response.data['access'])
            user_id = decoded_token['user_id']
            User = get_user_model()
            user = User.objects.get(id=user_id)
            user.last_login = timezone.now()
            user.save()
        except Exception as e:
            logger.error(f"Error updating last_login: {e}")
        return response
