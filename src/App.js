// App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/front page/header';
import ButtonGroup from './components/front page/buttonGroup';
import Registration from './components/register page/register';
import './components/front page/header.css';
import './components/front page/buttons.css';
import Login from './components/login page/login';
import Home from './components/home page/home';
import TaskDetail from './components/home page/taskDetail';
import EditTask from './components/home page/editTask';
import AssignedPage from './components/assigned page/assignedTasksPage'
import AllTasksPage from './components/all tasks page/allTasksPage';
import KanbanPage from './components/kanban page/kanbanPage.js';
import CalendarPage from './components/calendar page/calendarPage.js';
import UserManagermentPage from './components/user managermet page/userManagermentPage.js';
import UserInfoPage from './components/user managermet page/userInfoPage.js';
import Profile from './components/profile page/profile.js';
import PasswordReset from './components/login page/passwordReset';
import PasswordResetConfirm from './components/login page/passwordResetConfirm.js';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={
                        <>
                            <header className="app-header">
                                <Header/>
                                <ButtonGroup />
                            </header>
                        </>
                    } />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/tasks/:id" element={<TaskDetail />} />
                    <Route path="/tasks/:id/edit" element={<EditTask />}/>
                    <Route path="/assigned-task-page" element={<AssignedPage />}/>
                    <Route path="/all-task-page" element={<AllTasksPage />}/>
                    <Route path="/kanban-page" element={<KanbanPage />}/>
                    <Route path="/calendar-page" element={<CalendarPage />}/>
                    <Route path="/user-managerment-page" element={<UserManagermentPage />}/>
                    <Route path="/user-info-page" element={<UserInfoPage />}/>
                    <Route path="/profile" element={<Profile />}/>
                    <Route path="/password-reset" element={<PasswordReset />} />
                    <Route path="/password-reset-confirm/:uidb64/:token" element={<PasswordResetConfirm />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
