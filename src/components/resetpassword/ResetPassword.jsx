import { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import './ResetPassword.css';
import { fetchEmailByUserById, generateOtpAndSendMail, verifyOtp } from '../../service/login/loginService';
import LoadingOverlay from '../common/LoadingOverlay';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [apiMessage, setApiMessage] = useState({ type: '', text: '' });
    const [timer, setTimer] = useState(0);
    const [buttonText, setButtonText] = useState("Send OTP");
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailDisabled, setIsEmailDisabled] = useState(true);
    const [isVerifyButtonDisabled, setIsVerifyButtonDisabled] = useState(true);


    const location = useLocation();
    const userId = location.state?.userId || "";

    useEffect(() => {
        const fetchData = async () => {

            setIsLoading(true);
            if (userId) {
                console.log("Got userId from Login:", userId);
                try {
                    const result = await fetchEmailByUserById(userId);
                    if (result.success || (result.data != undefined && result.data.iSuccess)) {
                        const userList = result.data.data || [];
                        const exactUserDataSet = userList.find(user => String(user.userId) === String(userId));
                        if (exactUserDataSet.email != undefined && exactUserDataSet.email != null) {
                            setEmail(exactUserDataSet.email);
                            setIsEmailDisabled(true);
                        }
                        else {
                            setEmail('');
                            setIsEmailDisabled(false);
                        }
                        // setApiMessage({ type: 'success', text: result.data.message });
                    } else {
                        setIsEmailDisabled(false);
                        setApiMessage({ type: 'error', text: result.message });
                    }
                }
                catch (error) {
                    setApiMessage({ type: 'error', text: result.message });
                }
                finally {
                    setIsLoading(false);
                }
            }
            else {
                setEmail('');
                setIsEmailDisabled(false);
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleSendOtp = async () => {
        if (!email) {
            setApiMessage({ type: 'error', text: 'Please enter your email.' });
            return;
        }
        else if (!/\S+@\S+\.\S+/.test(email.trim())) {
            setApiMessage({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }


        // 🔹 Call your backend API here
        setIsLoading(true);

        try {
            const result = await generateOtpAndSendMail(userId, email);
            if (result.success || (result.data != undefined && result.data.iSuccess)) {
                setIsButtonDisabled(true);
                setButtonText("Resend OTP");
                setApiMessage({ type: 'success', text: result.data.message });
            } else {
                setIsButtonDisabled(true);
                setButtonText("Resend OTP");
                setApiMessage({ type: 'error', text: result.message });
            }
        }
        catch (error) {
            setApiMessage({ type: 'error', text: result.message });
        }
        finally {
            setIsLoading(false);
        }
        setTimer(40);
        // setApiMessage({ type: 'success', text: `OTP sent to ${email}` });
    };

    const handleVerifyOtp = async () => {
        if (!otp.length || otp.some(digit => digit === "")) {
            setApiMessage({ type: 'error', text: 'Please enter the OTP' });
            return;
        }
        // 🔹 Call your backend API here
        setIsLoading(true);
        try {
            const result = await verifyOtp(userId, otp.join(''));
            setOtp(new Array(6).fill(""));
            if ((result.success && result.data.iSuccess) || (result.data != undefined && result.data.iSuccess)) {
                // setIsButtonDisabled(true);
                // setButtonText("Resend OTP");
                setApiMessage({ type: 'success', text: result.data.message });
            } else {
                setIsVerifyButtonDisabled(true);
                // setButtonText("Resend OTP");
                setApiMessage({ type: 'error', text: result.data.message });
            }
        }
        catch (error) {
            setApiMessage({ type: 'error', text: result.message });
        }
        finally {
            setIsLoading(false);
        }
        // setApiMessage({ type: 'success', text: 'OTP verified successfully' });
    };
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Auto-focus next input
        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();

        }
        setIsVerifyButtonDisabled(newOtp.some(digit => digit === ""));

    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (otp[index] === "") {
                // Move focus to previous input
                if (e.target.previousSibling) {
                    e.target.previousSibling.focus();
                }
            } else {
                // Clear current value
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
                setIsVerifyButtonDisabled(newOtp.some(digit => digit === ""));
            }
        }
    };

    useEffect(() => {
        // Only start a timer if a message is actually being displayed
        if (apiMessage.text) {
            const timer = setTimeout(() => {
                setApiMessage({ type: '', text: '' });
            }, 4000); // 4000 milliseconds = 4 seconds
            return () => clearTimeout(timer);
        }
    }, [apiMessage.text]);

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0 && isButtonDisabled) {
            // Enable button again after countdown
            setIsButtonDisabled(false);
        }
        return () => clearInterval(interval);
    }, [timer, isButtonDisabled]);

    return (
        <>{isLoading && <LoadingOverlay />}
            <div className="reset-password-container">
                <div className="reset-password-card">
                    <p>Reset Password ? retrieve from here</p>
                    <form>
                        {apiMessage.text && (
                            <div
                                className={`api-message api-message-${apiMessage.type}`}
                                dangerouslySetInnerHTML={{ __html: apiMessage.text }}
                            />
                        )}
                        <div className="form-group-reset-password">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                disabled={isEmailDisabled}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>
                        <button
                            className="handle-otp-btn"
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isButtonDisabled}
                        >
                            {buttonText}
                        </button>
                        {timer > 0 && (
                            <h4 className="otp-timer">
                                You can resend OTP in {timer} seconds
                            </h4>
                        )}
                        <div className="form-group-reset-password">
                            <label htmlFor="otp">OTP</label>
                            <div className="otp-input-container">
                                {otp.map((data, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        name="otp"
                                        maxLength="1"
                                        value={data}
                                        onChange={(e) => handleChange(e.target, index)}
                                        onKeyDown={(e) => { handleKeyDown(e, index) }}
                                        onFocus={(e) => e.target.select()}
                                        className="otp-input"
                                    />
                                ))}
                            </div>
                        </div>
                        <button className="handle-otp-btn" type="button" onClick={handleVerifyOtp}
                            disabled={isVerifyButtonDisabled}>
                            Verify OTP
                        </button>

                    </form>
                    <div className="login-link">
                        <span>Back to </span>
                        <a href="/login" className="login-text">Login</a>
                    </div>
                </div>

            </div>
        </>
    );
};

export default ResetPassword;
