// allTasksPage.js

import React from 'react';
import Sidebar from '../home page/sidebar';
import AllTasksList from './allTasklist';
import '../home page/home.css';

const AllTasksPage = () => {
    return (
        <div className="home-container">
            <Sidebar />
            <div className="main-content">
                <AllTasksList />
            </div>
        </div>
    );
}

export default AllTasksPage;
