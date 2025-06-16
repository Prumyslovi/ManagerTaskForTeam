import React, { useState, useRef } from 'react';
import { fetchMember, setAccessToken } from '../../services/memberApi';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import '../styles/Modal.css';
import '../styles/AuthButtons.css';
import '../styles/PasswordToggle.css';
import '../styles/Spinner.css';
import '../styles/Message.css';

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

    if (!login || !password) {
      setErrorMessage('Пожалуйста, заполните все поля.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const member = await fetchMember(login, password);

      if (!member.memberId || !member.accessToken) {
        throw new Error('Сервер не вернул необходимые данные для авторизации.');
      }

      // Сохранение токена и memberId
      localStorage.setItem('memberId', member.memberId);
      localStorage.setItem('accessToken', member.accessToken);
      setAccessToken(member.accessToken); // Установка токена в глобальный контекст Axios

      // Вызов callback для уведомления родительского компонента об успешном входе
      onLogin(member.memberId, member.accessToken);

      // Очистка формы и закрытие модального окна
      clearForm();
      onVisibilityChange(false);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage('Неверный логин или пароль.');
        } else if (error.response.status === 400) {
          setErrorMessage('Некорректные данные для входа.');
        } else {
          setErrorMessage(`Ошибка сервера: ${error.response.status}`);
        }
      } else {
        setErrorMessage('Не удалось подключиться к серверу.');
      }
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
          ×
        </button>
        <div>
          <label htmlFor="login">Логин:</label>
          <input
            type="text"
            id="login"
            name="login"
            required
            className="modalInput"
            ref={loginRef}
            disabled={isLoading}
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
              className="modalInput"
              ref={passwordRef}
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        {errorMessage && <div className="restricted-content">{errorMessage}</div>}
        <div className="button-wrapper">
          <button type="submit" className="modalButtonReg" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
          {isLoading && <FaSpinner className="spinner" />}
          <button
            className="modalButtonClear"
            type="button"
            onClick={clearForm}
            disabled={isLoading}
          >
            Очистить
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnterForm;