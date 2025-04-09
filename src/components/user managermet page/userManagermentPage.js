// userManagermentPage.js

import Sidebar from '../home page/sidebar';
import '../home page/home.css';
import AssignUsersManagerment from './assignUsersManagerment';
import LeaderUsersManagerment from './leaderUsersManagerment';

const UserManagermentPage = () => {
    const AdminPermissions = JSON.parse(localStorage.getItem('AdminPermissions'));
    const LeaderPermissions = JSON.parse(localStorage.getItem('LeaderPermissions'));

    let content;

    if (AdminPermissions.is_admin) {
        content = <LeaderUsersManagerment />;
    } else if (LeaderPermissions.is_leader) {
        content = <AssignUsersManagerment />;
    } else {
        content = <p>Доступ запрещен. У вас нет прав для управления пользователями.</p>;
    }

    return (
        <div className="home-container">
            <Sidebar />
            <div className="main-content">
                {content}
            </div>
        </div>
    );
}

export default UserManagermentPage;
