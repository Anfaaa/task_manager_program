// userInfo.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers } from '../../API';

const UserInfo = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchUsers();
                setUsers(data);
            } catch (error) {
                console.error('Ошибка при загрузке данных пользователей:', error);
            } finally {
                setLoading(false);
            }
        };

        const adminPermissions = JSON.parse(localStorage.getItem('AdminPermissions'));
        if (!adminPermissions?.is_admin) {
            navigate('/login');
        } else {
            fetchData();
        }
    }, [navigate]);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className='managerment_container'>
            <h1>Просмотр информации о пользователях</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Логин</th>
                        <th>Email</th>
                        <th>Имя</th>
                        <th>Фамилия</th>
                        <th>Группа</th>
                        <th>Последний вход<br/>в систему</th>
                        <th>Дата регистрации</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.first_name}</td>
                            <td>{user.last_name}</td>
                            <td>{user.groups}</td>
                            <td>{new Date(user.last_login).toLocaleString()}</td>
                            <td>{new Date(user.date_joined).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserInfo;
