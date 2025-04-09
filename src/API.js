// API.js

import axios from 'axios';
const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Базовый URL для API
});


// Функция для получения токена
const getAuthToken = () => {
    const token = localStorage.getItem('access');
    if (!token) {
        throw new Error('Токен аутентификации отсутствует');
    }
    return token;
};


// Функция для регистрации пользователя
export const registerUser = (userData) => {
    return api.post('/register/', userData);
};


// Функция для входа пользователя
export const loginUser = (userData) => {
    return api.post('/token/', userData);
};


// Функция для создания новой задачи
export const createTask = async (taskData) => {
    const token = getAuthToken();

    try {
        const response = await api.post('/tasks/', taskData, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};


// Функция для получения списка пользователей
export const fetchUsers = async () => {
    try {
        const response = await api.get('/users/', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
        throw new Error('Ошибка при получении пользователей');
    }
};


// Функция для получения доступных исполнителей
export const fetchAvailableAssignees = async () => {
    try {
        const response = await api.get('/tasks/', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении доступных исполнителей:', error);
        throw new Error('Ошибка при получении доступных исполнителей');
    }
};


// Функция для получения информации о текущем пользователе
export const fetchUserInfo = async () => {
    try {
        const response = await api.get('/user-info/', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        console.log('Данные о пользователе:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
        throw new Error('Ошибка при получении информации о пользователе');
    }
};


// Функция для получения задач текущего пользователя
export const fetchUserTasks = async () => {
    try {
        console.log('Данные о пользователе:', getAuthToken());
        const response = await api.get('/user-tasks/', {  
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении задач пользователя:', error);
        throw new Error('Ошибка при получении задач пользователя');
    }
};


// Функция для получения задачи по ID
export const fetchTaskById = async (taskId) => {
    console.log('ID задачи:', taskId)
    try {
        const response = await api.get(`/tasks/${taskId}/`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        console.log('Данные задачи:', response.data);
        return response.data; // Возвращаем данные о задаче
    } catch (error) {
        console.error('Ошибка при получении задачи:', error);
        throw new Error('Ошибка при получении задачи');
    }
};


// Функция обновления статуса задачи
export const updateTaskStatus = async (id, status) => {
    try {
        const response = await api.patch(`/tasks/${id}/update-status/`, { status }, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при обновлении статуса задачи:', error);
        throw new Error('Не удалось обновить статус задачи');
    }
};


// Функция удаления задачи
export const deleteTask = async (taskId) => {
    try {
        await api.delete(`/tasks/${taskId}/delete/`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
    } catch (error) {
        console.error('Ошибка при удалении задачи:', error);
        throw new Error('Ошибка при удалении задачи');
    }
};


// Функция обновления задачи
export const updateTask = async (id, taskData) => {
    try {
        const response = await api.patch(`/tasks/${id}/update/`, taskData, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        console.log("Вызов")
        return response.data;
    } catch (error) {
        console.error('Ошибка при обновлении задачи:', error);
        throw new Error('Не удалось обновить задачу');
    }
};


// Функция получения задач, заданных пользователем
export const fetchAssignedTasks = async () => {
    try {
        const response = await api.get('/assigned-tasks/', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении выданных задач:', error);
        throw new Error('Ошибка при получении выданных задач');
    }
};


// Функция получения задач, заданных пользователем
export const fetchAllTasks = async () => {
    try {
        const response = await api.get('/all-tasks/', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении выданных задач:', error);
        throw new Error('Ошибка при получении выданных задач');
    }
};


// Функция для создания комментария
export const createComment = async (taskId, text) => {
    try {
        const response = await api.post(`/tasks/${taskId}/comments/create/`, { text }, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при создании комментария:', error);
        throw new Error('Не удалось создать комментарий');
    }
};


// Функция для получения комментариев задачи
export const fetchComments = async (taskId) => {
    try {
        const response = await api.get(`/tasks/${taskId}/comments/`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении комментариев:', error);
        throw new Error('Не удалось получить комментарии');
    }
};


// Функция для обновления комментария
export const updateComment = async (commentId, text) => {
    try {
        const response = await api.patch(`/comments/${commentId}/`, { text }, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при обновлении комментария:', error);
        throw new Error('Не удалось обновить комментарий');
    }
};


// Функция для удаления комментария
export const deleteComment = async (commentId) => {
    try {
        const response = await api.delete(`/comments/${commentId}/delete/`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при удалении комментария:', error);
        throw new Error('Не удалось удалить комментарий');
    }
};


// Функция для повышения назначающих задания
export const promoteAssignUser = async (userId) => {
    try {
        const response = await api.patch(`/users/promote/${userId}/`, {}, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при повышении пользователя:', error);
        throw new Error('Не удалось повысить пользователя');
    }
};


// Функция для понижения назначающих задания
export const demoteAssignUser = async (userId) => {
    try {
        const response = await api.patch(`/users/demote/${userId}/`, {}, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при понижении пользователя:', error);
        throw new Error('Не удалось понизить пользователя');
    }
};


// Функция для повышения руководителей проектов
export const promoteLeaderUser = async (userId) => {
    try {
        const response = await api.patch(`/users/leader-promote/${userId}/`, {}, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при повышении пользователя:', error);
        throw new Error('Не удалось повысить пользователя');
    }
};


// Функция для понижения руководителей проектов
export const demoteLeaderUser = async (userId) => {
    try {
        const response = await api.patch(`/users/leader-demote/${userId}/`, {}, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при понижении пользователя:', error);
        throw new Error('Не удалось понизить пользователя');
    }
};


// Функция для получения данных пользователя
export const getUserData = async () => {
    try {
        const response = await api.get('/profile/', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        throw new Error('Ошибка при получении данных пользователя');
    }
};


// Функция для обновления данных пользователя
export const updateUserData = async (userData) => {
    try {
        const response = await api.put('/profile/', userData, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при обновлении данных пользователя:', error);
        throw new Error('Ошибка при обновлении данных пользователя');
    }
};


// Функция для удаления аккаунта пользователя
export const deleteUserAccount = async () => {
    try {
        const response = await api.delete('/profile/', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при удалении аккаунта пользователя:', error);
        throw new Error('Ошибка при удалении аккаунта');
    }
};


// Восстановление пароля
export const resetPassword = async (data) => {
    try {
        const response = await api.post('/password-reset/', data);
        return response;
    } catch (error) {
        throw error;
    }
};


// Функция для восстановления пароля по ссылке в письме email
export const resetPasswordConfirm = async (uidb64, token, newPassword, confirmPassword) => {
    try {
      const response = await api.post(`/password-reset-confirm/${uidb64}/${token}/`,
        { new_password: newPassword, confirm_password: confirmPassword }
      );
      return response;
    } catch (err) {
      throw err.response?.data?.detail || 'Ошибка при сбросе пароля';
    }
  };