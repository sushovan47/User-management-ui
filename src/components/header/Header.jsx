import { useEffect, useState, React } from 'react';
import './Header.css';
import { getStoredUser, logoutUser } from '../../service/login/loginService';
export default function Header() {
    const [user, setUser] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const handleLogout = () => {
        logoutUser();
        window.location.href = '/';
    };
    useEffect(() => {
        const userData = getStoredUser();
        setUser(userData);
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // update every second

        return () => clearInterval(timer); // cleanup on unmount
    }, []);

    return (
        <>
            <header>
                <nav className="dashboard-navbar-header">
                    {/* <div className="navbar-brand-header">
                        <h2>Dashboard</h2>
                    </div> */}
                    <div className="navbar-user-header">
                        <div className="user-icon-header">
                            <span className="user-id-header">Welcome {user?.userId || 'User'}</span>

                            <span className="login-time-header">
                                Logged in at: {currentTime.toLocaleTimeString()}
                            </span>
                        </div>
                        <button className="logout-btn-header" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </nav>
            </header>
        </>
    );
}
