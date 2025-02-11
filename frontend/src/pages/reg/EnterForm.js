import React, { useState, useEffect, useRef } from 'react';
import { fetchMember } from '../../services/api';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import '../styles/Modal.css';
import '../styles/AuthButtons.css';
import '../styles/PasswordToggle.css';
import '../styles/Spinner.css';

const EnterForm = ({ visible, onVisibilityChange, onLogin }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loginRef = useRef(null);
    const passwordRef = useRef(null);

    if (!visible) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const login = loginRef.current.value.trim();
        const password = passwordRef.current.value.trim();

        setIsLoading(true);
        setErrorMessage('');

        try {
            const member = await fetchMember(login, password);

            if (!member) {
                setErrorMessage('Пользователь не найден.');
                setIsLoading(false);
                return;
            }

            // Сохраняем ID пользователя в localStorage
            localStorage.setItem('memberId', member.memberId);

            onLogin(member.memberId);
            clearForm();
            onVisibilityChange(false); // Скрываем форму
        } catch (error) {
            setErrorMessage('Ошибка при попытке входа. Пожалуйста, попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearForm = () => {
        loginRef.current.value = '';
        passwordRef.current.value = '';
        setErrorMessage('');
    };

    return (
        <div className="modalRegForm">
            <form className="modalContent" onSubmit={handleSubmit}>
                <h2 align="center">Вход</h2>
                <button
                    className="exitButton"
                    type="button"
                    onClick={() => onVisibilityChange(false)}
                >
                    &times;
                </button>
                <div>
                    <label htmlFor="login">Логин:</label>
                    <input type="text" id="login" name="login" required className="modalInput" ref={loginRef} />
                </div>
                <div>
                    <label htmlFor="password">Пароль:</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            required
                            className="modalInput"
                            ref={passwordRef}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <div className="button-wrapper">
                    <button type="submit" className="modalButtonReg" disabled={isLoading}>
                        Войти
                    </button>
                    {isLoading && <FaSpinner className="spinner" />}
                    <button className="modalButtonClear" type="button" onClick={clearForm} disabled={isLoading}>
                        Очистить
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EnterForm;
