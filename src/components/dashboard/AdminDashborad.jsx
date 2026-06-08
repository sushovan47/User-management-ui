import { useEffect, useState } from 'react';
import './AdminDashboard.css';
import {
    getStoredUser,
    logoutUser,
    fetchUserById,
    uploadImage,
    fetchDownloadImage
} from '../../service/login/loginService';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import LoadingOverlay from '../common/LoadingOverlay';
import maleLogo from '../../assets/male-avatar-logo.png';
import femaleLogo from '../../assets/female-avatar-logo.png';
import defaultLogo from '../../assets/default-avatar-logo.png';


export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Default to true until data loads
    const [appName, setAppName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [localImg, setLocalImg] = useState(null);
    const [userCrednId, setUserCrednId] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploadBtnDisabled, setUploadBtnDisabled] = useState(false);
    const [fileError, setFileError] = useState('');
    const [gender, setGender] = useState('');
    const [userEmail, setEmail] = useState('');
    const [userFirstName, setFirstName] = useState('');
    const [userLastName, setLastName] = useState('');
    const [apiMessage, setApiMessage] = useState({ type: '', text: '' });
    const [isimageUploading, setIsImageUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userLoginId, setuserLoginId] = useState(0);

    const fetchUserImage = async (userCrednid) => {
        try {
            const result = await fetchDownloadImage(userCrednid);

            if (result != undefined && result.blobUrl != undefined && result.blobUrl != null) {
                // use blobUrl returned from service
                setLocalImg(result.blobUrl);
            } else {
                // fallback to default avatar
                setLocalImg(getAvatarSrc(result.blobUrl));
            }
        } catch (error) {
            setLocalImg(getAvatarSrc());
        }
    };
    const getAvatarSrc = (blobUrl) => {
        if (blobUrl === undefined || blobUrl === null) {
            const userGender = gender?.toLowerCase();
            if (userGender === 'male') return maleLogo;
            if (userGender === 'female') return femaleLogo;
        }
        else {
            return defaultLogo;
        }
    };
    const handleCloseModal = () => {
        setIsOpen(false);
        setIsEditing(false)
        setUploadBtnDisabled(false);
        setIsImageUploading(false);
        setFileError('');
    }
    const onFileChange = async (e) => {
        setFileError('');

        const file = e.target.files && e.target.files[0];
        // Extract the base name (everything before the very last dot)
        const lastDotIndex = file.name.lastIndexOf('.');
        const baseName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;

        // Check if the remaining base name contains any dot character
        if (baseName.includes('.')) {
            setFileError('Please correct the filename (remove extra dots) and reupload.');

            // Clear the HTML input element value so the user can select the file again
            e.target.value = '';
            return; // Stop execution: do not update selectedFile or trigger upload
        }
        setSelectedFile(file);
        const formData = new FormData();
        formData.append('file', file);
        setIsImageUploading(true);

        try {
            const result = await uploadImage(formData, userCrednId);
            if (result.data != undefined && result.data.isSuccess) {

                const temporaryBlobUrl = URL.createObjectURL(file);
                setLocalImg(temporaryBlobUrl);

                setIsImageUploading(false);
                setUploadBtnDisabled(true);

                setApiMessage({ type: 'success', text: result.data.message });
            } else {
                setApiMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setApiMessage({ type: 'error', text: result.message });
        }

    };
    const fetchUserData = async (userId) => {
        try {
            const result = await fetchUserById(userId, 'TKNR');
            if (result.success || (result.data != undefined && result.data.iSuccess)) {
                const userList = result.data.data || [];
                const exactUserDataSet = userList.find(user => String(user.userId) === String(userId));
                setFirstName(exactUserDataSet.firstName || '');
                setLastName(exactUserDataSet.lastName || '');
                setEmail(exactUserDataSet.email || '');
                setGender(exactUserDataSet.gender || '');
                setuserLoginId(exactUserDataSet.id || 0);
                setUserCrednId(exactUserDataSet.userCredentials[0]?.userCrednid || 0);
                setAppName(result.data.appName);

                const exactUserRole = exactUserDataSet.userCredentials[0]?.role || 'N/A';
                setUserRole(exactUserRole);
                fetchUserImage(exactUserDataSet.userCredentials[0]?.userCrednid);
                setApiMessage({ type: 'success', text: result.data.message });
            } else {
                setApiMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setApiMessage({ type: 'error', text: result.message });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const userData = getStoredUser();
        setIsLoading(true);
        fetchUserData(userData?.userId);
    }, []);

    useEffect(() => {
        const userData = getStoredUser();
        setUser(userData);
        setIsLoading(false);
    }, []);

    const handleLogout = () => {
        logoutUser();
        window.location.href = '/';
    };

    return (
        <>
            {isLoading && <LoadingOverlay />}
            {/* <Header /> */}

            {!isLoading && (
                <div className="dashboard-shell">
                    <aside className="dashboard-sidebar">
                        <div className="sidebar-brand">
                            <div className="sidebar-avatar-container">
                                {/* 3. Render the local asset image */}
                                <button className="sb-avatar-btn" onClick={() => setIsOpen(true)} type="button">
                                    <img
                                        src={isUploadBtnDisabled ? getAvatarSrc() : localImg || getAvatarSrc()}
                                        alt="User Profile Logo"
                                        className="avatar-img"
                                    />
                                </button>

                                {/* 4. Overlay the user initial text over the blank face space */}
                                {/* {!localImg && (
                                        <span className="sb-avatar-txt">
                                            {userFirstName ? userFirstName.charAt(0).toUpperCase() : 'A'}
                                        </span>
                                    )} */}
                            </div>
                            <div>
                                <h4>{appName}</h4>
                            </div>
                        </div>

                        {isOpen && (
                            <div className="sb-modal-overlay" onClick={handleCloseModal}>
                                <div
                                    className="sb-modal-card"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ position: 'relative', overflow: 'hidden' }}
                                >

                                    {/* 1. BLUR OVERLAY LAYER (Shows during upload process OR success screen) */}
                                    {isimageUploading ? (
                                        /* ---- STATE A: ACTIVE BACKEND UPLOAD ---- */
                                        <div className="sb-modal-blur-loader">
                                            <div className="sb-loader-content">
                                                <h4 className="upload-msg">Uploading your photo...</h4>
                                                <p className="upload-submsg">Please do not close this window</p>
                                            </div>
                                        </div>
                                    ) : isUploadBtnDisabled && selectedFile ? (
                                        /* ---- STATE B: SUCCESS SCREEN (Upload Done, Button Disabled) ---- */
                                        <div className="sb-modal-blur-loader">
                                            <div className="sb-loader-content" style={{ position: 'relative' }}>
                                                <h4 className="upload-msg"><i className="file-name-txt"> {selectedFile?.name}</i> Uploaded successfully</h4>
                                                <p className="upload-submsg">You can close this window now</p>

                                                {/* Bottom "Done" Action Button */}
                                                <button
                                                    className="sb-success-btn"
                                                    onClick={handleCloseModal}
                                                >
                                                    Ok
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* 2. REGULAR MODAL CONTENT */}
                                    <button className="sb-close" onClick={handleCloseModal}>&times;</button>

                                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Account Profile</h3>

                                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div className="sb-preview-box">
                                            <img src={isUploadBtnDisabled ? getAvatarSrc() : localImg || getAvatarSrc()} alt="Preview" className="sb-avatar-img" />
                                        </div>

                                        <label className="sb-upload-lbl">
                                            Upload Photo
                                            <input type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
                                        </label>
                                    </div>
                                    {fileError && (
                                        <p className="error-file-upload">
                                            {fileError}
                                        </p>
                                    )}

                                    <div className="sb-fields">
                                        <div className="sb-row">
                                            <label>Name</label>
                                            <p>{userFirstName} {userLastName}</p>
                                        </div>
                                        <div className="sb-row">
                                            <label>Email</label>
                                            <p>{userEmail}</p>
                                        </div>
                                        <div className="sb-row">
                                            <label>Gender</label>
                                            <p style={{ textTransform: 'capitalize' }}>{gender}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        <nav className="nav">
                            <a className="active" href="#">📊 Team Overview</a>
                            <a href="#">👥 Member Status</a>
                            <a href="#">📝 Activity Log</a>
                            <a href="#">📥 Bulk Operations</a>
                        </nav>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </aside>

                    <main className="dashboard-main">
                        <section className="welcome">
                            <h1>📊 Team Performance Overview</h1>
                            <p>Welcome back, {user?.name || 'Manager'}. Track your team status and operations here.</p>
                        </section>

                        <section className="stats">
                            <div className="stat-card">
                                <div className="title">Total Team</div>
                                <div className="number">42</div>
                            </div>
                            <div className="stat-card">
                                <div className="title">Active Now</div>
                                <div className="number">38</div>
                            </div>
                            <div className="stat-card">
                                <div className="title">Suspended</div>
                                <div className="number">4</div>
                            </div>
                        </section>

                        <section className="table-card">
                            <div className="table-head">
                                <h2>👥 Manage Team Hierarchy</h2>
                                <button className="btn btn-primary">+ Invite New</button>
                            </div>

                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Quick Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td data-label="Name">John Doe</td>
                                            <td data-label="Email">john@example.com</td>
                                            <td data-label="Status"><span className="status active">Active</span></td>
                                            <td data-label="Quick Actions">
                                                <button className="action-link">Suspend</button>
                                                <button className="action-link">Reset Pwd</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </main>
                </div>
            )}
            <Footer />
        </>
    );
}