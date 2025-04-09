// taskDetail.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchTaskById, updateTaskStatus, deleteTask } from '../../API';
import { STATUS_LABELS, PRIORITY_LABELS } from '../../const';
import editIcon from '../../icons/edit_icon.png';
import delIcon from '../../icons/delete_icon.png';
import editCommIcon from '../../icons/edit_comment_icon.png';
import delCommIcon from '../../icons/delete_comment_icon.png';
import BackIcon from '../../icons/back_icon.png';
import { createComment, fetchComments, updateComment, deleteComment } from '../../API'; 
import './taskDetail.css';
import '../front page/buttons.css'

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const userID = JSON.parse(localStorage.getItem('userId'));

    const [task, setTask] = useState(null);
    const [status, setStatus] = useState('');
    const [comments, setComments] = useState([]); 
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState(null); 
    const [editedCommentText, setEditedCommentText] = useState('');
    const LeaderPermissions = JSON.parse(localStorage.getItem('LeaderPermissions'));

    useEffect(() => {
        const getTask = async () => {
            try {
                const data = await fetchTaskById(id);
                setTask(data);
                setStatus(data.status);
            } catch (error) {
                console.error(error.message);
            }
        };
        getTask();
    }, [id]);

    useEffect(() => {
        const getComments = async () => {
            try {
                const data = await fetchComments(id);
                setComments(data);
            } catch (error) {
                console.error(error.message);
            }
        };
        getComments();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить задачу?')) {
            try {
                await deleteTask(id);
                navigate('/home'); 
            } catch (error) {
                console.error('Ошибка при удалении задачи:', error);
            }
        }
    };

    const handleStatusChange = async (event) => {
        const newStatus = event.target.value;

        if (userID !== task.created_by && userID !== task.assigned_to && !LeaderPermissions) {
            alert('У вас нет прав на изменение статуса этой задачи.');
            return;
        }

        setStatus(newStatus);
        try {
            await updateTaskStatus(id, newStatus);
            setTask(prevTask => ({ ...prevTask, status: newStatus }));
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleCommentChange = (event) => {
        setNewComment(event.target.value); 
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        if (!newComment.trim()) return;
        try {
            const commentData = await createComment(id, newComment);
            setComments((prevComments) => [...prevComments, commentData]);
            setNewComment('');
        } catch (error) {
            console.error('Ошибка при создании комментария:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
            try {
                await deleteComment(commentId);
                setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
            } catch (error) {
                console.error('Ошибка при удалении комментария:', error);
            }
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment);
        setEditedCommentText(comment.text);
    };

    const handleSaveEditComment = async () => {
        if (!editedCommentText.trim()) return;
        try {
            const updatedComment = await updateComment(editingComment.id, editedCommentText);
            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment.id === updatedComment.id ? updatedComment : comment
                )
            );
            setEditingComment(null);
            setEditedCommentText('');
        } catch (error) {
            console.error('Ошибка при обновлении комментария:', error);
        }
    };

    if (!task) {
        return <div>Загрузка...</div>;
    }

    const canModifyTask = userID === task.created_by;
    const canChangeStatus = 
        (userID === task.created_by || 
        userID === task.assigned_to || 
        LeaderPermissions.is_leader);
    const canAddComment = 
    (userID === task.created_by || 
        userID === task.assigned_to || 
        LeaderPermissions.is_leader);
    console.log('canChangeStatus', canChangeStatus);

    return (
        <>
            <div className="task-container">
                <div className="task-detail-container">
                    <img 
                        src={BackIcon} 
                        alt="Назад" 
                        className="icon icon-back" 
                        onClick={() => navigate(location.state?.from || '/home')} 
                    />
                    {canModifyTask && (
                        <div className="icon-container">
                            <img
                                src={editIcon}
                                alt="Редактировать"
                                className="icon"
                                onClick={() => navigate(`/tasks/${id}/edit`, { state: { from: window.location.pathname } })}
                            />
                            <img 
                                src={delIcon} 
                                alt="Удалить" 
                                className="icon" 
                                onClick={handleDelete} 
                            />
                        </div>
                    )}
                    <h2 className='can-select'>{task.title}</h2>
                    <p className='can-select'><strong>Описание:</strong></p>
                    <p dangerouslySetInnerHTML={{ __html: task.description.replace(/\n/g, '<br />') }} className='can-select'/>
                    <p className='can-select'><strong>Создано:</strong> {new Date(task.created_at).toLocaleString()}</p>
                    <p className='can-select'><strong>Изменено:</strong> {new Date(task.updated_at).toLocaleString()}</p>
                    <p className='can-select'><strong>Дата сдачи:</strong> {new Date(task.due_date).toLocaleDateString()}</p>
                    <p className='can-select'><strong>Статус:  </strong> 
                        <select className="select" value={status} onChange={handleStatusChange} disabled={!canChangeStatus}>
                            {Object.keys(STATUS_LABELS).map((key) => (
                                <option key={key} value={key}>{STATUS_LABELS[key]}</option>
                            ))}
                        </select>
                    </p>
                    <p className='can-select'><strong>Приоритет:</strong> {PRIORITY_LABELS[task.priority]}</p>
                    <p className='can-select'><strong>Автор:</strong> {task.created_by_name}</p>
                    <p className='can-select'><strong>Исполнитель:</strong> {task.assigned_to_name}</p>
                </div>
                <div className="comments-section">
                    <h5 className='h5'>Комментарии</h5>
                    <div className="comments-list">
                    {comments.map((comment) => (
                        <div key={comment.id} className="comment">
                            {editingComment && editingComment.id === comment.id ? (
                                <div>
                                    <textarea
                                        value={editedCommentText}
                                        onChange={(e) => setEditedCommentText(e.target.value)}
                                        rows="4"
                                        className="comment-input"
                                    />
                                    <button onClick={handleSaveEditComment} className="glow-on-hover comm-btn">Сохранить</button>
                                    <button onClick={() => setEditingComment(null)} className="glow-on-hover comm-btn">Отменить</button>
                                </div>
                            ) : (
                                <>
                                    <p className="can-select">
                                        <strong>{comment.user_name}</strong>:
                                        <p className="can-select" dangerouslySetInnerHTML={{ __html: comment.text.replace(/\n/g, '<br />') }} />
                                    </p>
                                    <p className="comment-date">
                                        {new Date(comment.created_at).toLocaleString()}
                                        {comment.is_edited && <span className="edited-label"> (Изменено)</span>}
                                        {userID === comment.user && (
                                            <>
                                                <img
                                                    src={delCommIcon}
                                                    alt="Удалить"
                                                    className="icon"
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                />
                                                <img
                                                    src={editCommIcon}
                                                    alt="Редактировать"
                                                    className="icon"
                                                    onClick={() => handleEditComment(comment)}
                                                />
                                            </>
                                        )}
                                    </p>
                                </>
                            )}
                        </div>
                    ))}
                    </div>

                    {canAddComment && (
                        <form onSubmit={handleCommentSubmit} className="comment-form">
                            <textarea
                                value={newComment}
                                onChange={handleCommentChange}
                                placeholder="Добавить комментарий..."
                                className='comment-input'
                                rows="4"
                                required
                            />
                            <button type="submit" className="glow-on-hover centered-button">Добавить</button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default TaskDetail;