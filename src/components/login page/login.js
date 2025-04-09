// login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { loginUser, fetchUserInfo } from '../../API';
import BackIcon from '../../icons/back_icon.png';

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
    
        setErrorMessage('');
        setSuccessMessage('');
    
        try {
            const response = await loginUser({
                username,
                password,
            });
    
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('userId', response.data.user.id);
    
            const userInfo = await fetchUserInfo();
            localStorage.setItem('userPermissions', JSON.stringify({ can_assign_tasks: userInfo.can_assign_tasks }));
            localStorage.setItem('HeadUserPermissions', JSON.stringify({ can_control: userInfo.can_control }));
            localStorage.setItem('AdminPermissions', JSON.stringify({ is_admin: userInfo.is_admin }));
            localStorage.setItem('LeaderPermissions', JSON.stringify({ is_leader: userInfo.is_leader }));
    
            console.log('Вход успешен:', response.data);
            setSuccessMessage('Успешный вход!');
    
            if (userInfo.is_admin) {
                navigate('/all-task-page');
            } else {
                navigate('/home');
            }
        } catch (error) {
            console.error('Ошибка при входе:', error);
            setErrorMessage('Ошибка входа: Что-то пошло не так!');
        }
    };

    return (
        <>
            <img 
                src={BackIcon} 
                alt="Назад"
                className="icon icon-back" 
                onClick={() => navigate('/')}
            />
            <div className="login-container">
                <h2>Вход в систему</h2>
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Логин:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Пароль:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    <button type="submit" className="glow-on-hover centered-button">Войти</button>
                    <p onClick={() => navigate('/password-reset')} className='centered-text'>Забыли пароль?</p>
                </form>
            </div>
        </>
    );
    
}

export default Login;
