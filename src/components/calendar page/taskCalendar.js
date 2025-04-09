// taskCalendar.js

import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Link } from 'react-router-dom';
import { fetchUserTasks, fetchAssignedTasks } from '../../API';
import moment from 'moment';
import 'moment/locale/ru';
import './taskCalendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('ru');
const localizer = momentLocalizer(moment);

const TaskCalendar = () => {
  const [tasks, setTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const currentUserId = JSON.parse(localStorage.getItem('userId'));

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const taskData = await fetchUserTasks();
        setTasks(taskData);

        const userPermissions = JSON.parse(localStorage.getItem('userPermissions'));
        if (userPermissions && userPermissions.can_assign_tasks) {
          const assignedTaskData = await fetchAssignedTasks();
          setAssignedTasks(assignedTaskData);
        }
      } catch (error) {
        console.error("Ошибка при загрузке задач", error);
      }
    };
    loadTasks();
  }, []);

  const allTasks = [...tasks, ...assignedTasks];

  const events = allTasks.map(task => {
    const isAssignedToCurrentUser = task.assigned_to === currentUserId;
  
    return {
      title: (
        <div>
          <Link
            className={`url ${!isAssignedToCurrentUser ? 'other-user-task' : ''}`}
            to={`/tasks/${task.id}`}
            state={{ from: window.location.pathname }}
          >
            <strong>{task.title}</strong>
          </Link>
          {!isAssignedToCurrentUser && task.assigned_to_name && (
            <div>Исполнитель: {task.assigned_to_name}</div>
          )}
        </div>
      ),
      start: new Date(task.due_date),
      end: new Date(task.due_date),
      allDay: true,
    };
  });

  return (
    <>
      <h1 className='headLabel'>Календарь с датами сдачи заданий</h1>
      <div className="task-calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month']}
          messages={{
            today: 'Сегодня',
            previous: 'Назад',
            next: 'Вперед',
          }}
        />
      </div>
    </>
  );
};

export default TaskCalendar;
