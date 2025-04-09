// assignUsersManagerment.js

import React, { useEffect, useState } from 'react';
import { promoteAssignUser, demoteAssignUser, fetchUsers } from '../../API';
import './assignUsersManagerment.css';

const AssignUsersManagerment = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            try {
                const usersData = await fetchUsers();
                setUsers(usersData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    const handlePromote = async (userId) => {
        try {
            await promoteAssignUser(userId);
            alert('Пользователь успешно повышен!');
            refreshUserList();
        } catch (err) {
            alert(`Ошибка при повышении пользователя: ${err.message}`);
        }
    };

    const handleDemote = async (userId) => {
        try {
            await demoteAssignUser(userId);
            alert('Пользователь успешно понижен и его задания другим пользователям удалены!');
            refreshUserList();
        } catch (err) {
            alert(`Ошибка при понижении пользователя: ${err.message}`);
        }
    };

    const refreshUserList = async () => {
        try {
            const updatedUsers = await fetchUsers();
            setUsers(updatedUsers);
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.groups.includes("Пользователи") || user.groups.includes("Назначающие задания")
    );

    if (loading) return <p>Загрузка пользователей...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div className='managerment_container'>
            <h1>Управление пользователями</h1>
            <table>
                <thead>
                    <tr>
                        <th>Username пользователя</th>
                        <th>Имя пользователя</th>
                        <th>Email</th>
                        <th>Группы</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.first_name} {user.last_name}</td>
                            <td>{user.email}</td>
                            <td>{user.groups}</td>
                            <td>
                                {user.groups === "Пользователи" ? (
                                    <button onClick={() => handlePromote(user.id)} className="glow-on-hover comm-btn">
                                        Повысить
                                    </button>
                                ) : (
                                    <button onClick={() => handleDemote(user.id)} className="glow-on-hover comm-btn">
                                        Понизить
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssignUsersManagerment;
