import { useEffect, useState, React } from 'react';
import './AdminDashboard.css';
import { getStoredUser, logoutUser } from '../../service/login/loginService';
import Header from '../header/Header';
import Footer from '../footer/Footer';


export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const userData = getStoredUser();
        setUser(userData);
        setIsLoading(false);
    }, []);


    return (<>{isLoading && <LoadingOverlay />}
        <Header />
        {!isLoading && (<div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <p>Welcome to the admin dashboard! Here you can manage users, view analytics, and configure settings.</p>
            {/* Add more admin-specific features and components here */}
        </div>
        )}
        <Footer />
    </>
    );
}