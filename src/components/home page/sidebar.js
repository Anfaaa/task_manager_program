// sidebar.js

import React from 'react';
import './sidebar.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import exitIcon from '../../icons/exit_icon.png';

const Sidebar = () => {
    const navigate = useNavigate();
    const userPermissions = JSON.parse(localStorage.getItem('userPermissions'));
    const LeaderPermissions = JSON.parse(localStorage.getItem('LeaderPermissions'));
    const AdminPermissions = JSON.parse(localStorage.getItem('AdminPermissions'));

    return (
        <div className="sidebar">
            <nav>
                <ul>
                    <li>
                        <img 
                            src={exitIcon} 
                            alt="Выйти" 
                            className="icon" 
                            onClick={() => navigate('/login')}
                        />
                    </li>
                    
                    {AdminPermissions.is_admin ? (
                        <>
                        <li><Link to="/all-task-page">Список всех задач</Link></li>
                        <li><Link to="/user-managerment-page">Управление пользователями</Link></li>
                        <li><Link to="/user-info-page">Информация о пользователях</Link></li>
                        <li><Link to="/profile">Профиль</Link></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/home">Список Ваших задач</Link></li>
                            {userPermissions.can_assign_tasks && (
                                <li><Link to="/assigned-task-page">Выданные Вами задачи</Link></li>
                            )}
                            {LeaderPermissions.is_leader && (
                                <li><Link to="/all-task-page">Список всех задач</Link></li>
                            )}
                            {LeaderPermissions.is_leader && (
                                <li><Link to="/user-managerment-page">Управление пользователями</Link></li>
                            )}
                            
                            <li><Link to="/calendar-page">Календарь</Link></li>
                            <li><Link to="/kanban-page">Кан-бан с задачами</Link></li>
                            <li><Link to="/profile">Профиль</Link></li>
                        </>
                    )}
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;
