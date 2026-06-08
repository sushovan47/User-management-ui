// components/SessionExpiredPopup.js
import React from "react";
import './SessionExpiredPopup.css';

function SessionExpiredPopup({ onClose }) {
    return (
        <div className="popup-overlay">
            <div className="popup">
                <h2>Session Expired</h2>
                <p>Your session has expired. Please login again.</p>
                <button onClick={onClose}>OK</button>
            </div>
        </div>
    );
}

export default SessionExpiredPopup;