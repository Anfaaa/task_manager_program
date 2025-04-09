// calendarPage.js

import React from 'react';
import Sidebar from '../home page/sidebar';
import '../home page/home.css';
import TaskCalendar from './taskCalendar';

const CalendarPage = () => {
    return (
        <div className="home-container">
            <Sidebar />
            <div className="main-content">
                <TaskCalendar />
            </div>
        </div>
    );
}

export default CalendarPage;
