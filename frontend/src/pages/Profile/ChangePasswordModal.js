import React, { useState } from 'react';
import { updateProfile } from '../../services/api';
import '../styles/TypicalItems.css';

const ChangePasswordModal = ({ onClose, memberId }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Заполните все поля!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Пароль должен содержать не менее 6 символов!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают!');
      return;
    }

    try {
      await updateProfile({ memberId, oldPassword, newPassword });
      setSuccess('Пароль успешно изменён!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      setError('Не удалось изменить пароль.');
    }
  };

  return (
    <div className="modalRegForm">
      <div className="modalContent">
        <button className="exitButton" onClick={onClose}>×</button>
        <h2>Изменение пароля</h2>
        {error && <div className="restricted-content">{error}</div>}
        {success && <div className="right-content">{success}</div>}
        <input
          type="password"
          className="modalInput"
          placeholder="Старый пароль"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          type="password"
          className="modalInput"
          placeholder="Новый пароль"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          className="modalInput"
          placeholder="Подтверждение пароля"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className="modalButtonReg" onClick={handleChangePassword}>Изменить</button>
        <button className="modalButtonClear" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
