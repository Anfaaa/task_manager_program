// AllTasklist.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../home page/tasklist.css';
import { fetchAllTasks } from '../../API';
import searchIcon from '../../icons/search_icon.png';
import filterIcon from '../../icons/filter_icon.png';
import sortIcon from '../../icons/sorting_icon.png';
import addIcon from '../../icons/add_icon.png';
import CreateTaskForm from '../home page/createTask';
import { STATUS_LABELS } from '../../const';

const AllTasksList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [sortBy, setSortBy] = useState('due_date');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCreator, setFilterCreator] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterAssignee, setFilterAssignee] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const AdminPermissions = JSON.parse(localStorage.getItem('AdminPermissions'));

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        fetchTasks();
    };

    // Вызов функции получения задач всех пользователей
    const fetchTasks = async () => {
        try {
            const data = await fetchAllTasks();
            console.log('Полученные задачи всех пользователей:', data);
            setTasks(data);
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);


    const sortTasks = (tasks) => {
        return [...tasks].sort((a, b) => {
            if (sortBy === 'due_date') {
                return new Date(a.due_date) - new Date(b.due_date);
            } else if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            } else if (sortBy === 'updated_at') {
                return new Date(b.updated_at) - new Date(a.updated_at);
            } else if (sortBy === 'created_at') {
                return new Date(b.created_at) - new Date(a.created_at);
            }
            return 0;
        });
    };

    const filterTasks = (tasks) => {
        return tasks.filter(task => {
            const matchesStatus = filterStatus ? task.status === filterStatus : true;
            const matchesCreator = filterCreator ? task.created_by_name === filterCreator : true;
            const matchesPriority = filterPriority ? task.priority === filterPriority : true;
            const matchesSearchTerm = task.title.toLowerCase().includes(searchTerm.toLowerCase()); 
            const matchesAssignee = filterAssignee ? task.assigned_to_name === filterAssignee : true;
            return matchesStatus && matchesCreator && matchesPriority && matchesAssignee && matchesSearchTerm;
        });
    };

    const sortedTasks = sortTasks(tasks);
    const filteredTasks = filterTasks(sortedTasks);

    return (
        <div className="task-list-container">
            <h1>Список всех задач пользователей</h1>
                <div className="tools-container">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Поиск задач..."
                            className="search-input"
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <img src={searchIcon} alt="Поиск" className="icon search-icon" />
                    </div>
                    <div className="filter-container">
                        <img src={filterIcon} alt="Фильтр" className="icon" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}/>
                        {isFilterMenuOpen && (
                            <div className="filter-menu">
                                <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus} className='select'>
                                    <option value="">Все статусы</option>
                                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                                <select onChange={(e) => setFilterCreator(e.target.value)} value={filterCreator} className='select'>
                                    <option value="">Все создатели</option>
                                    {Array.from(new Set(tasks.map(task => task.created_by_name))).map((name) => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                                <select onChange={(e) => setFilterPriority(e.target.value)} value={filterPriority} className='select'>
                                    <option value="">Все приоритеты</option>
                                    <option value="high">Высокий</option>
                                    <option value="medium">Средний</option>
                                    <option value="low">Низкий</option>
                                </select>
                                <select onChange={(e) => setFilterAssignee(e.target.value)} value={filterAssignee} className='select'>
                                <option value="">Все исполнители</option>
                                {Array.from(new Set(tasks.map(task => task.assigned_to_name))).map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            </div>
                        )}
                    </div>
                    <div className="sort-container">
                        <img src={sortIcon} alt="Сортировка" className="icon" onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}/>
                        {isSortMenuOpen && (
                            <div className="sort-menu">
                                <select onChange={(e) => setSortBy(e.target.value)} value={sortBy} className='select'>
                                    <option value="due_date">По дате сдачи</option>
                                    <option value="title">По названию</option>
                                    <option value="updated_at">По дате изменения (убывание)</option>
                                    <option value="created_at">По дате создания (убывание)</option>
                                </select>
                            </div>
                        )}
                    </div>
                    {!AdminPermissions?.is_admin && (
                        <img 
                            src={addIcon}
                            alt="Добавить задачу"
                            className="icon"
                            onClick={openModal}
                        />
                    )}
                </div>
            {isModalOpen && (
                <CreateTaskForm closeModal={closeModal} />
            )}
            <div className="tasks-grid">
                {filteredTasks.map((task) => (
                    <div key={task.id} className="task-card">
                        <Link className='url' to={`/tasks/${task.id}`} state={{ from: window.location.pathname }}>
                            <h3>{task.title}</h3>
                        </Link>
                        <p>Дата сдачи: {new Date(task.due_date).toLocaleDateString()}</p>
                        <p>Автор: {task.created_by_name}</p>
                        <p>Исполнитель: {task.assigned_to_name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AllTasksList;
