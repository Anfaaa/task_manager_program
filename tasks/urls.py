# tasks/urls.py

from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView


# Создание маршрутизатора
router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'user-tasks', UserTaskListView, basename='user-tasks')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='user-registration'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/', get_users, name='get_users'),
    path('user-info/', UserInfoView.as_view(), name='user-info'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<int:pk>/update-status/', TaskUpdateStatusView.as_view(), name='task-update-status'),
    path('tasks/<int:pk>/update/', TaskUpdateView.as_view(), name='task-update'),
    path('tasks/<int:pk>/delete/', TaskDeleteView.as_view(), name='task-delete'),
    path('assigned-tasks/', assigned_tasks_view, name='assigned-tasks'),
    path('all-tasks/', all_tasks_view, name='assigned-tasks'),
    path('tasks/<int:task_id>/comments/create/', create_comment, name='create_comment'),
    path('tasks/<int:task_id>/comments/', get_comments, name='get_comments'),
    path('comments/<int:comment_id>/', update_comment, name='update_comment'),
    path('comments/<int:comment_id>/delete/', delete_comment, name='delete_comment'),
    path('users/promote/<int:user_id>/', promote_user_to_task_assigner, name='promote_users'),
    path('users/demote/<int:user_id>/', demote_user_from_task_assigner, name='demote_users'),
    path('users/leader-promote/<int:user_id>/', promote_user_to_project_leader, name='leader_promote_users'),
    path('users/leader-demote/<int:user_id>/', demote_user_from_project_leader, name='leader_demote_users'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
