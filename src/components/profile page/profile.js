// profile.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData, updateUserData, deleteUserAccount } from '../../API';
import BackIcon from '../../icons/back_icon.png';
import "./profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    password: '',
    email: '',
    current_password: ''
  });
  const [errorMessages, setErrorMessages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserData()
      .then(response => {
        if (response) {
          setUserData(response);
        } else {
          setErrorMessages({ general: 'Не удалось получить данные пользователя' });
        }
        setLoading(false);
      })
      .catch((error) => {
        setErrorMessages({ general: error.message || 'Ошибка при загрузке данных' });
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
    setErrorMessages({
      ...errorMessages,
      [name]: '',
    });
  };

  const handleUpdate = () => {
    updateUserData(userData)
      .then(() => {
        alert('Данные успешно обновлены');
        setErrorMessages({});
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          setErrorMessages(error.response.data);
        } else {
          setErrorMessages({ general: 'Ошибка при обновлении данных' });
        }
      });
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо.');
    if (confirmDelete) {
      const token = localStorage.getItem('access_token');
      deleteUserAccount(token)
        .then(() => {
          alert('Аккаунт удален');
          window.location.href = '/login';
        })
        .catch(() => {
          setErrorMessages({ general: 'Ошибка при удалении аккаунта' });
        });
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <>
      <img 
        src={BackIcon} 
        alt="Назад"
        className="icon icon-back" 
        onClick={() => navigate('/home')}
      />
      <div className="profile-container">
        <h1>Профиль</h1>
        {errorMessages.general && <p className="error">{errorMessages.general}</p>}
        <form onSubmit={(e) => e.preventDefault()}>
          <div>
            <label>Email</label>
            <input
              type="text"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
            />
            {errorMessages.email && <p className="error">{errorMessages.email}</p>}
          </div>
          <div>
            <label>Имя</label>
            <input
              type="text"
              name="first_name"
              value={userData.first_name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Фамилия</label>
            <input
              type="text"
              name="last_name"
              value={userData.last_name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Текущий пароль</label>
            <input
              type="password"
              name="current_password"
              value={userData.current_password}
              onChange={handleInputChange}
            />
            {errorMessages.current_password && <p className="error">{errorMessages.current_password}</p>}
          </div>
          <div>
            <label>Новый пароль</label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleInputChange}
            />
          </div>
          <button type="button" className="glow-on-hover" onClick={handleUpdate}>
            Сохранить изменения
          </button>
          <button type="button" className="glow-on-hover" onClick={handleDeleteAccount}>
            Удалить аккаунт
          </button>
        </form>
      </div>
    </>
  );
};

export default Profile;

