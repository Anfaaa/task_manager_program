// editTask.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchTaskById, updateTask, fetchUsers } from '../../API';
import './createTask.css';
import '../front page/buttons.css';

const EditTask = ({ closeModal }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'low',
        assigned_to: '',
    });
    const [users, setUsers] = useState([]);
    const [hasAssignPermission, setHasAssignPermission] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const location = useLocation();

    useEffect(() => {
        const loadTaskAndUsers = async () => {
            try {
                const taskData = await fetchTaskById(id);

                if (taskData.due_date) {
                    const date = new Date(taskData.due_date);
                    taskData.due_date = date.toISOString().split('T')[0];
                } 

                setTask(taskData);
                const usersData = await fetchUsers();
                setUsers(usersData);

                const currentUserPermissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');
                setHasAssignPermission(currentUserPermissions.can_assign_tasks || false);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            }
        };

        loadTaskAndUsers();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTask((prevTask) => ({
            ...prevTask,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedTask = await updateTask(id, task);
            console.log('Задача успешно обновлена', updatedTask);
            navigate(`/tasks/${id}`);
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            setErrorMessage('Ошибка при обновлении задачи.');
        }
    };

    return (
        <div className="task-form-modal">
            <h2>Редактирование задачи</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form className="task-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Заголовок:</label>
                    <input
                        type="text"
                        name="title"
                        value={task.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Описание:</label>
                    <textarea
                        name="description"
                        value={task.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Срок сдачи:</label>
                    <input
                        type="date"
                        name="due_date"
                        value={task.due_date}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Приоритет:</label>
                    <select
                        name="priority"
                        value={task.priority}
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
                        value={task.assigned_to}
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
                    <button className="glow-on-hover centered-button" type="submit">Сохранить изменения</button>
                    <button className="glow-on-hover centered-button" type="button" 
                        onClick={() => navigate(location.state?.from || '/tasks/:id')}>Отмена</button>
                </div>
            </form>
        </div>
    );
};

export default EditTask;
