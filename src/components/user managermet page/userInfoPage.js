// userInfoPage.js

import React from 'react';
import Sidebar from '../home page/sidebar';
import '../home page/home.css';
import UserInfo from './userInfo';

const UserInfoPage = () => {
    return (
        <div className="home-container">
            <Sidebar />
            <div className="main-content">
                <UserInfo />
            </div>
        </div>
    );
}

export default UserInfoPage;
