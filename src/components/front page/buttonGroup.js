// buttonGroup.js

import React from 'react';
import { Link } from 'react-router-dom';
import './buttons.css';

const ButtonGroup = () => {
    return (
        <div className="button-group">
            <Link to="/register">
                <button className="glow-on-hover">Зарегистрироваться</button>
            </Link>
            <Link to="/login">
                <button className="glow-on-hover">Войти</button>
            </Link>
        </div>
    );
}

export default ButtonGroup;
