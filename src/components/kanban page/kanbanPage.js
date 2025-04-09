// kanbanPage.js

import React from 'react';
import Sidebar from '../home page/sidebar';
import '../home page/home.css';
import KanbanBoard from './kanban';

const KanbanPage = () => {
    return (
        <div className="home-container">
            <Sidebar />
            <div className="main-content">
                <KanbanBoard />
            </div>
        </div>
    );
}

export default KanbanPage;
