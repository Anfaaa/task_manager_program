// register.js

import React, { useState } from 'react'; 
import './register.css';
import '../front page/buttons.css';
import { registerUser } from '../../API';
import { useNavigate } from 'react-router-dom';
import BackIcon from '../../icons/back_icon.png';

const Registration = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage('Пароли не совпадают!');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await registerUser({
                username,
                first_name: firstName,
                last_name: lastName,
                email,
                password,
            });
            console.log('Регистрация успешна:', response.data);
            setSuccessMessage('Регистрация прошла успешно!');
            navigate('/login');
        } catch (error) {
            if (error.response?.data?.username) {
                setErrorMessage('Этот логин уже занят');
            } 
            else if (error.response?.data?.email) {
                setErrorMessage('Пользователь с таким email уже зарегестрирован');
            } 
            else {
                setErrorMessage('Ошибка регистрации: ' + (error.response?.data?.detail || 'Что-то пошло не так!'));
            }
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
            <div className="registration-container">
                <h2>Регистрация</h2>
                <form className="registration-form" onSubmit={handleSubmit}>
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
                        <label htmlFor="firstName">Имя:</label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Фамилия:</label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Подтверждение пароля:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    <button type="submit" className="glow-on-hover centered-button">Зарегистрироваться</button>
                </form>
            </div>
        </>
    );
}

export default Registration;
