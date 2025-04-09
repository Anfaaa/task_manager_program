// kanban.js

import { Draggable, Droppable } from 'react-drag-and-drop';
import React, { useState, useEffect } from 'react';
import { fetchUserTasks, updateTaskStatus } from '../../API';
import { Link } from 'react-router-dom';
import './kanban.css';
import { STATUS_LABELS } from '../../const';

const KanbanBoard = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const getTasks = async () => {
            try {
                const data = await fetchUserTasks();
                setTasks(data);
            } catch (error) {
                console.error('Ошибка при загрузке задач:', error);
            }
        };
        getTasks();
    }, []);

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const handleDrop = async (taskId, newStatus) => {
        try {
            await updateTaskStatus(taskId, newStatus);

            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id.toString() === taskId
                        ? { ...task, status: newStatus }
                        : task
                )
            );
        } catch (error) {
            console.error('Ошибка при обновлении статуса задачи:', error);
            alert('Не удалось обновить статус задачи');
        }
    };

    return (
        <>
            <h1 className='headLabel'>Кан-бан для работы с задачами</h1>
            <div className="kanban-board">
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                    <Droppable
                        key={status}
                        types={['task']}
                        onDrop={(data) => handleDrop(data.task, status)}
                        className="kanban-column"
                    >
                        <div className="boarder">{label}</div>
                        <div className="kanban-tasks">
                            {getTasksByStatus(status).map((task) => (
                                <Draggable
                                    key={task.id}
                                    type="task"
                                    data={task.id.toString()}
                                    className="kanban-task"
                                    style={{
                                        padding: '8px',
                                        marginBottom: '10px',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '4px',
                                        cursor: 'move',
                                    }}
                                >
                                    <Link
                                        className="url"
                                        to={`/tasks/${task.id}`}
                                        state={{ from: window.location.pathname }}
                                    >
                                        <strong>{task.title}</strong>
                                    </Link>
                                    <br />
                                    Дата сдачи: {new Date(task.due_date).toLocaleDateString()}
                                </Draggable>
                            ))}
                        </div>
                    </Droppable>
                ))}
            </div>
        </>
    );
};

export default KanbanBoard;
