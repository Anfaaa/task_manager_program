// Home.js

import React from 'react';
import Sidebar from './sidebar';
import TaskList from './tasklist';
import './home.css';

const Home = () => {
    return (
        <div className="home-container">
            <Sidebar />
            <div className="main-content">
                <TaskList />
            </div>
        </div>
    );
}

export default Home;
