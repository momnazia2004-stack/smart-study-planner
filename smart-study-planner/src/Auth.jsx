import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios'; 
import './Auth.css';

const FORM_STATES = {
    LOGIN: 'login',
    SIGNUP: 'signup',
    FORGOT_PASSWORD: 'forgot_password',
};

const Auth = ({ onLogin }) => {
    const [currentState, setCurrentState] = useState(FORM_STATES.LOGIN);
    const [message, setMessage] = useState(null);

    // Form States
    const [loginUser, setLoginUser] = useState(''); 
    const [loginPass, setLoginPass] = useState('');
    const [signupUser, setSignupUser] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPass, setSignupPass] = useState('');
    const [confirmPass, setConfirmPass] = useState(''); 
    
    // Visibility States
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [showSignupPass, setShowSignupPass] = useState(false);

    useEffect(() => {
        setLoginUser('');
        setLoginPass('');
        setSignupUser('');
        setSignupEmail('');
        setSignupPass('');
        setConfirmPass('');
        setShowPass(false);
        setShowConfirmPass(false);
        setShowSignupPass(false);
        setMessage(null);
    }, [currentState]);

    const handleFormSubmit = async (e) => { 
        e.preventDefault(); 
        setMessage(null);

        try {
            if (currentState === FORM_STATES.LOGIN) {
                if (loginPass.length < 8) {
                    setMessage("Password must be at least 8 characters long.");
                    return;
                }
                
                const res = await axios.post('http://localhost:5000/api/users/login', {
                    identifier: loginUser, 
                    password: loginPass
                });

                if (onLogin) onLogin(res.data); 
            } 
            else if (currentState === FORM_STATES.SIGNUP) {
                const usernameRegex = /^[A-Za-z\s]+$/;
                if (!usernameRegex.test(signupUser)) {
                    setMessage("Username should only contain letters.");
                    return;
                }
                if (signupPass.length < 8) {
                    setMessage("Password must be at least 8 characters long.");
                    return;
                }

                const res = await axios.post('http://localhost:5000/api/users/signup', {
                    name: signupUser,
                    email: signupEmail,
                    password: signupPass
                });

                if (onLogin) onLogin(res.data);
            }
            else if (currentState === FORM_STATES.FORGOT_PASSWORD) {
                if (signupPass !== confirmPass) {
                    setMessage("Passwords do not match!");
                    return;
                }
                
                const res = await axios.put('http://localhost:5000/api/users/update-password', {
                    email: signupEmail, 
                    newPassword: signupPass
                });

                setMessage(res.data.message);
                setTimeout(() => setCurrentState(FORM_STATES.LOGIN), 2000);
            }
        } catch (err) {
            setMessage(err.response?.data?.message || err.response?.data?.error || "Connection Error!");
        }
    };

    return (
        <div className="auth-wrapper">
            {message && <div className="custom-alert-banner">{message}</div>}

            <div className="auth-card">
                <div className="branding-panel">
                    <div className="branding-content">
                        <h3>Welcome to</h3>
                        <h2>Smart Study Planner</h2>
                        <p>Unlock your potential with organized, easy planning.</p>
                    </div>
                </div>
                

                <div className="form-panel">
                    <form onSubmit={handleFormSubmit} autoComplete="off">
                        <input type="text" name="prevent_autofill" style={{ display: 'none' }} tabIndex="-1" />
                        <input type="password" name="password_fake" style={{ display: 'none' }} tabIndex="-1" />
                        
                        {/* --- LOGIN FORM --- */}
                        {currentState === FORM_STATES.LOGIN && (
                            <>
                                <h1>Login</h1>
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        name="uzma_login_id"
                                        placeholder="Username or Email" 
                                        value={loginUser} 
                                        onChange={(e) => setLoginUser(e.target.value)} 
                                        autoComplete="off"
                                        readOnly
                                        onFocus={(e) => e.target.removeAttribute('readonly')}
                                        required 
                                    />
                                </div>
                                <div className="input-group password-group">
                                    <input 
                                        type={showPass ? "text" : "password"} 
                                        name="uzma_login_key"
                                        placeholder="Password" 
                                        value={loginPass} 
                                        onChange={(e) => setLoginPass(e.target.value)} 
                                        autoComplete="new-password"
                                        readOnly
                                        onFocus={(e) => e.target.removeAttribute('readonly')}
                                        required 
                                    />
                                    <span className="pwd-visibility-toggle" onClick={() => setShowPass(!showPass)}>
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </span>
                                </div>

                                <div className="form-helper-options">
                                    <label style={{cursor: 'pointer'}}><input type="checkbox" /> Remember me</label>
                                    <span className="clickable-link" onClick={() => setCurrentState(FORM_STATES.FORGOT_PASSWORD)}>Forgot Password?</span>
                                </div>
                                <button type="submit" className="action-button login-btn">Login</button>
                                <p className="toggle-form-p">
                                    Don't have an account? 
                                    <span className="clickable-link primary-span" onClick={() => setCurrentState(FORM_STATES.SIGNUP)}> Sign Up</span>
                                </p>
                            </>
                        )}

                        {/* --- SIGN UP FORM --- */}
                        {currentState === FORM_STATES.SIGNUP && (
                            <>
                                <h1>Create Account</h1>
                                <div className="input-group">
                                    <input type="text" name="uzma_full_name" placeholder="Full Name" value={signupUser} onChange={(e) => setSignupUser(e.target.value)} autoComplete="off" required />
                                </div>
                                <div className="input-group">
                                    <input type="email" name="uzma_signup_email" placeholder="Email Address" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} autoComplete="off" required />
                                </div>
                                <div className="input-group password-group">
                                    <input 
                                        type={showSignupPass ? "text" : "password"} 
                                        name="uzma_signup_pass"
                                        placeholder="Password (Min. 8 characters)" 
                                        value={signupPass} 
                                        onChange={(e) => setSignupPass(e.target.value)} 
                                        autoComplete="new-password"
                                        required 
                                    />
                                    <span className="pwd-visibility-toggle" onClick={() => setShowSignupPass(!showSignupPass)}>
                                        {showSignupPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </span>
                                </div>
                                <button type="submit" className="action-button register-btn">Register</button>
                                <p className="toggle-form-p">Already have an account? 
                                    <span className="clickable-link primary-span" onClick={() => setCurrentState(FORM_STATES.LOGIN)}> Sign In</span>
                                </p>
                            </>
                        )}
                        

                        {/* --- FORGOT PASSWORD FORM --- */}
                        {currentState === FORM_STATES.FORGOT_PASSWORD && (
                            <>
                                <span className="clickable-link" style={{ color: '#1b51d8', fontWeight: '500', fontSize: '0.9rem', display: 'block', marginBottom: '15px' }} onClick={() => setCurrentState(FORM_STATES.LOGIN)}>
                                    ← Back to Login
                                </span>
                                <h1>Reset Password</h1>
                                <div className="input-group">
                                    <input type="email" name="uzma_reset_email" placeholder="Registered Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} autoComplete="off" required />
                                </div>
                                <div className="input-group password-group">
                                    <input type={showPass ? "text" : "password"} name="uzma_reset_pass" placeholder="New Password" value={signupPass} onChange={(e) => setSignupPass(e.target.value)} autoComplete="new-password" required />
                                    <span className="pwd-visibility-toggle" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</span>
                                </div>
                                <div className="input-group password-group">
                                    <input type={showConfirmPass ? "text" : "password"} name="uzma_confirm_pass" placeholder="Confirm Password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} autoComplete="new-password" required />
                                    <span className="pwd-visibility-toggle" onClick={() => setShowConfirmPass(!showConfirmPass)}>{showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}</span>
                                </div>
                                <button type="submit" className="action-button reset-btn" style={{ backgroundColor: '#1b4ad8', marginTop: '10px' }}>Submit</button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Auth;