// createTask.js

import React, { useState, useEffect } from 'react';
import { fetchUsers, createTask } from '../../API';
import './createTask.css';
import '../front page/buttons.css';


const CreateTaskForm = ({ closeModal }) => {
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'low',
        assigned_to: '',
    });
    const [users, setUsers] = useState([]);
    const [hasAssignPermission, setHasAssignPermission] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    

    useEffect(() => {
        const initializeForm = async () => {
            try {
                const usersData = await fetchUsers();
                console.log('Полученные пользователи:', usersData);
                const leaderPermissions = JSON.parse(localStorage.getItem('LeaderPermissions'));
                if (!leaderPermissions.is_leader) {
                    const basicUsers = usersData.filter(user => 
                        user.groups !== 'Администраторы' && 
                        user.groups !== 'Руководители проектов'
                      );
                    setUsers(basicUsers);
                }
                else {
                    const filteredUsers = usersData.filter(user => user.groups !=='Администраторы');    
                    setUsers(filteredUsers);
                }

                const userPermissionsString = localStorage.getItem('userPermissions');
                console.log('Данные userPermissions:', userPermissionsString);
                const currentUserPermissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');
                setHasAssignPermission(currentUserPermissions.can_assign_tasks || false);

                if (!hasAssignPermission) {
                    const currentUserId = localStorage.getItem('userId');
                    setNewTask(prevTask => ({
                        ...prevTask,
                        assigned_to: currentUserId,
                    }));
                }
            } catch (error) {
                console.error('Ошибка при инициализации формы:', error);
            }
        };

        initializeForm();
    }, [hasAssignPermission]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask((prevTask) => ({
            ...prevTask,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('ID пользователя отсутствует');
            return;
        }
    
        const taskData = {
            ...newTask,
            created_by: userId,
            assigned_to: hasAssignPermission ? newTask.assigned_to : null,
        };
    
        try {
            const createdTask = await createTask(taskData);
            console.log('Задача успешно создана', createdTask);
            closeModal();
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
            setErrorMessage('Ошибка при создании задачи: ' + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <div className="task-form-modal">
            <h2>Создание новой задачи</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form className="task-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Заголовок:</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={newTask.title} 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Описание:</label>
                    <textarea 
                        name="description" 
                        value={newTask.description} 
                        onChange={handleInputChange} 
                    />
                </div>
                <div className="form-group">
                    <label>Срок сдачи:</label>
                    <input 
                        type="date" 
                        name="due_date" 
                        value={newTask.due_date} 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Приоритет:</label>
                    <select 
                        name="priority" 
                        value={newTask.priority} 
                        onChange={handleInputChange}
                    >
                        <option value="low">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="high">Высокий</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Назначить:</label>
                    <select 
                        name="assigned_to" 
                        value={newTask.assigned_to} 
                        onChange={handleInputChange}
                        disabled={!hasAssignPermission} 
                    >
                        <option value="">Не назначен</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="button-group">
                    <button className="glow-on-hover centered-button" type="submit">Создать задачу</button>
                    <button className="glow-on-hover centered-button" type="button" onClick={closeModal}>Отмена</button>
                </div>
            </form>
        </div>
    );
}

export default CreateTaskForm;