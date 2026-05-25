import './LoadingOverlay.css';

export default function LoadingOverlay({ message = 'Loading...' }) {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
                <h3 className="loading-message-overlay">{message}</h3>
                <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
}
