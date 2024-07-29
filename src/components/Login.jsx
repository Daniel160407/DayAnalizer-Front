import axios from "axios";
import React, { useEffect, useState } from "react";
import root from "../root";
import App from "../App";
import Cookies from "js-cookie";
import '../style/Login.scss';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');

    useEffect(() => {
        const email = Cookies.get('email');
        const password = Cookies.get('password');

        if (email && password) {
            setEmail(email);
            setPassword(password);
            autoLogin(email, password);
        }
    }, []);

    const autoLogin = async (email, password) => {
        const user = { email, password };

        try {
            const response = await axios.put('http://localhost:8080/login', user);

            if (response.status === 200) {
                Cookies.set('email', email, { expires: 7 });
                Cookies.set('password', password, { expires: 7 });
                Cookies.set('userId', response.data, { expires: 7 });
                Cookies.set('token', response.headers.authorization, { expires: 7 });

                root.render(
                    <React.StrictMode>
                        <App />
                    </React.StrictMode>
                );
            } else {
                setLoginError('Invalid email or password!');
            }
        } catch (error) {
            setLoginError('An error occurred during login.');
        }
    };

    const handleLoginSubmission = async (event) => {
        event.preventDefault();
        setLoginError('');
        const user = { email, password };

        try {
            const response = await axios.put('http://localhost:8080/login', user);

            if (response.status === 200) {
                Cookies.set('email', email, { expires: 7 });
                Cookies.set('password', password, { expires: 7 });
                Cookies.set('userId', response.data, { expires: 7 });
                Cookies.set('token', response.headers.authorization, { expires: 7 });

                root.render(
                    <React.StrictMode>
                        <App />
                    </React.StrictMode>
                );
            } else {
                setLoginError('Invalid email or password!');
            }
        } catch (error) {
            setLoginError('An error occurred during login.');
        }
    };

    const handleRegisterSubmission = async (event) => {
        event.preventDefault();
        setRegisterError('');
        const user = { email, password };

        try {
            const response = await axios.post('http://localhost:8080/register', user);

            if (response.status === 201) {
                setShowRegistrationForm(false);
            } else {
                setRegisterError('This account is already registered!');
            }
        } catch (error) {
            setRegisterError('An error occurred during registration.');
        }
    };

    const isFormValid = () => {
        return email.trim() !== '' && password.trim() !== '';
    };

    return (
        <div id="auth">
            {!showRegistrationForm ? (
                <div id="login">
                    <h1>Log In</h1>
                    <form onSubmit={handleLoginSubmission}>
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        <button type="submit" disabled={!isFormValid()}>Log In</button>
                    </form>
                    <p onClick={() => setShowRegistrationForm(true)}>Don't have an account?</p>
                    {loginError && <p className="errorMessage">{loginError}</p>}
                </div>
            ) : (
                <div id="register">
                    <h1>Register</h1>
                    <form onSubmit={handleRegisterSubmission}>
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        <button type="submit" disabled={!isFormValid()}>Register</button>
                    </form>
                    <p onClick={() => setShowRegistrationForm(false)}>Already have an account?</p>
                    {registerError && <p className="errorMessage">{registerError}</p>}
                </div>
            )}
        </div>
    );
};

export default Login;
