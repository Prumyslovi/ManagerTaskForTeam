import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { addMember } from '../../services/memberApi';
import { v4 as uuidv4 } from 'uuid';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/Modal.css';
import '../styles/AuthButtons.css';
import '../styles/PasswordToggle.css';
import '../styles/Spinner.css';

const RegistrationForm = ({ visible, onVisibilityChange, onLogin }) => {
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        login: '',
        password: '',
        passwordReplay: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordReplay, setShowPasswordReplay] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (formData.password !== formData.passwordReplay) {
            return 'Пароли не совпадают, пожалуйста, проверьте написание.';
        }

        if (formData.password.length < 6) {
            return 'Пароль должен содержать минимум 6 символов.';
        }

        if (/\s/.test(formData.password)) {
            return 'Пароль не должен содержать пробелы.';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const memberData = {
                MemberId: uuidv4(),
                Login: formData.login,
                FirstName: formData.firstName,
                LastName: formData.lastName,
                PasswordHash: formData.password,
                CreatedAt: new Date().toISOString(),
                IsDeleted: false
            };

            await addMember(memberData);

            setSuccess('Регистрация прошла успешно!');
            clearForm();
            onLogin(memberData.MemberId);
            onVisibilityChange(false);
        } catch (err) {
            setError('Ошибка при регистрации. Пожалуйста, попробуйте снова.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            login: '',
            password: '',
            passwordReplay: ''
        });
        setShowPassword(false);
        setShowPasswordReplay(false);
    };

    if (!visible) return null;

    return (
        <div className='modalRegForm'>
            <form className='modalContent' onSubmit={handleSubmit}>
                <h2 align='center'>Регистрация</h2>
                <button
                    className="exitButton"
                    type="button"
                    onClick={() => onVisibilityChange(false)}
                >
                    ×
                </button>
                {error && <p className="restricted-content">{error}</p>}
                {success && <p className="success">{success}</p>}

                <div>
                    <label htmlFor="firstName">Имя:</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className='modalInput'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="lastName">Фамилия:</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className='modalInput'
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="login">Логин:</label>
                    <input
                        type="text"
                        id="login"
                        name="login"
                        required
                        className='modalInput'
                        value={formData.login}
                        onChange={handleInputChange}
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="password">Пароль:</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            required
                            className='modalInput'
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            disabled={loading}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="passwordReplay">Повторите пароль:</label>
                    <div className="password-wrapper">
                        <input
                            type={showPasswordReplay ? 'text' : 'password'}
                            id="passwordReplay"
                            name="passwordReplay"
                            required
                            className='modalInput'
                            value={formData.passwordReplay}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPasswordReplay((prev) => !prev)}
                            disabled={loading}
                        >
                            {showPasswordReplay ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>
                <div className="button-wrapper">
                    <button type="submit" className="modalButtonReg" disabled={loading}>
                        Создать
                    </button>
                    <button type="button" className="modalButtonClear" onClick={clearForm} disabled={loading}>
                        Очистить
                    </button>
                </div>
                {loading && (
                    <div className="spinner-container">
                        <FaSpinner className="spinner" />
                    </div>
                )}
            </form>
        </div>
    );
};

export default RegistrationForm;