import React, { useState } from 'react';
import { joinTeam } from '../../services/api';

const JoinTeam = ({ memberId }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleJoinTeam = async () => {
    if (!inviteCode) {
      setErrorMessage('Пожалуйста, введите код приглашения.');
      setSuccessMessage('');
      return;
    }
  
    console.log("inviteCode:", inviteCode);
    console.log("userId:", memberId.memberId); // Извлекаем строку из объекта
  
    try {
      // Отправляем запрос с правильными данными
      const response = await joinTeam(inviteCode, memberId.memberId); // Используем только строку memberId
  
      if (response.success) {
        setSuccessMessage(`Вы успешно присоединились к команде "${response.teamName}"!`);
        setErrorMessage('');
      }
    } catch (error) {
      // Обрабатываем ошибку, если пришло сообщение о том, что пользователь уже в команде
      setErrorMessage(error.message || 'Ошибка при подключении к серверу. Попробуйте снова.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="join-team programSection">
      <div>
        <label className="profileLabel">Введите код приглашения</label>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Код приглашения"
          className="modalInput"
        />
      </div>
      <div>
        <button onClick={handleJoinTeam} className="Button">Вступить в команду</button>
      </div>

      {successMessage && <div className="restricted-content">{successMessage}</div>}
      {errorMessage && <div className="restricted-content">{errorMessage}</div>}
    </div>
  );
};

export default JoinTeam;