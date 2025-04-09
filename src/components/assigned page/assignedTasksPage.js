// assignedTasksPage.js

import React from 'react';
import Sidebar from '../home page/sidebar';
import AssignedTasksList from './assignedTasklist';
import '../home page/home.css';

const AssignedPage = () => {
    return (
        <div className="home-container">
            <Sidebar />
            <div className="main-content">
                <AssignedTasksList />
            </div>
        </div>
    );
}

export default AssignedPage;
