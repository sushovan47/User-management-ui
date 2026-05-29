import { useEffect, useState, React } from 'react';
import './Footer.css';
export default function Footer() {
    const [user, setUser] = useState(null);
    return (
        <>
            <footer className="footer">
                © 2026 User-Management. All rights reserved.
            </footer>
        </>);
}
