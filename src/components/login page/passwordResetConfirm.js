// passwordResetConfirm.js

import React, { useState } from 'react';
import './login.css';
import { resetPasswordConfirm } from '../../API';
import { useParams, useNavigate } from 'react-router-dom';
import BackIcon from '../../icons/back_icon.png';

const PasswordResetConfirm = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      await resetPasswordConfirm(uidb64, token, newPassword, confirmPassword);
      navigate('/login');
    } catch (err) {
      setError(err);
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
        <h2>Введите новый пароль</h2>
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="newPassword">Новый пароль:</label>
                <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Новый пароль"
                required
                />
            </div>
            <div className="form-group">
                <label htmlFor="confirmPassword">Подтвердите новый пароль:</label>
                <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Подтвердите новый пароль"
                required
                />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="glow-on-hover centered-button">Сбросить пароль</button>
        </form>
      </div>
    </>
  );
};

export default PasswordResetConfirm;
