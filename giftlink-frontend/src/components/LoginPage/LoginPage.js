import React, { useState, useEffect } from 'react';
// Task 1: Import urlConfig from `giftlink-frontend/src/config.js`
import { urlConfig } from '../../config';
// Task 2: Import useAppContext `giftlink-frontend/context/AuthContext.js`
import { useAppContext } from '../../context/AuthContext';
// Task 3: Import useNavigate from `react-router-dom`
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Task 4: Include a state for incorrect password
    const [incorrect, setIncorrect] = useState('');

    // Task 5: Create a local variable for navigate, bearerToken and setIsLoggedIn
    const navigate = useNavigate();
    const bearerToken = sessionStorage.getItem('auth-token');
    const { setIsLoggedIn, setUserName } = useAppContext();

    // Task 6: If the bearerToken has a value (user already logged in), navigate to MainPage
    useEffect(() => {
        if (bearerToken) {
            navigate('/app');
        }
    }, [bearerToken, navigate]);

    const handleLogin = async () => {
        try {
            // Step 1: Implement API call
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
                // Task 7: Set method
                method: 'POST',
                // Task 8: Set headers
                headers: {
                    'Content-Type': 'application/json',
                },
                // Task 9: Set body to send user details
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            // Step 2: Access data and set user details
            // Task 1: Access data coming from fetch API
            const json = await response.json();

            if (json.authtoken) {
                // Task 2: Set user details in session storage
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', json.userName);
                sessionStorage.setItem('email', json.userEmail);

                // Task 3: Set the user's state to logged in using the useAppContext
                setIsLoggedIn(true);
                setUserName(json.userName);

                // Task 4: Navigate to the MainPage after logging in
                navigate('/app');
            } else {
                // Task 5: Clear input and set an error message if the password is incorrect
                setPassword('');
                setIncorrect(json.error || 'Wrong password. Try again.');
            }
        } catch (e) {
            console.log("Error fetching details: " + e.message);
            setIncorrect('An error occurred. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="login-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Login</h2>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {/* Task 6: Display an error message to the user */}
                            {incorrect && <div className="text-danger mt-1">{incorrect}</div>}
                        </div>

                        <button className="btn btn-primary w-100" onClick={handleLogin}>
                            Login
                        </button>

                        <p className="mt-4 text-center">
                            New here? <a href="/app/register" className="text-primary">Register Here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
