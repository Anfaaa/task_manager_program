// passwordReset.js

import React, { useState } from 'react';
import './login.css';
import { resetPassword } from '../../API';
import { useNavigate } from 'react-router-dom';
import BackIcon from '../../icons/back_icon.png';

const PasswordReset = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage('');
        setSuccessMessage('');

        try {
            await resetPassword({ email });
            setSuccessMessage('На ваш email отправлено письмо с инструкциями по восстановлению пароля.');
        } catch (error) {
            setErrorMessage('Ошибка: ' + (error.response?.data?.detail || 'Что-то пошло не так!'));
        }
    };

    return (
        <>
            <img 
                src={BackIcon} 
                alt="Назад"
                className="icon icon-back" 
                onClick={() => navigate('/login')}
            />
            <div className="login-container">
                <h2>Восстановление пароля</h2>
                <form className="login-form" onSubmit={handleSubmit}>
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
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    <button type="submit" className="glow-on-hover centered-button">Отправить ссылку для восстановления</button>
                </form>
            </div>
        </>
    );
};

export default PasswordReset;