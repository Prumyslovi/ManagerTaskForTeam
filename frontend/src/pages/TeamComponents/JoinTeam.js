import React, { useState } from 'react';
import { joinTeam } from '../../services/api';

const JoinTeam = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const memberId = localStorage.getItem('memberId');

  const handleJoinTeam = async () => {
    if (!inviteCode) {
      setErrorMessage('Пожалуйста, введите код приглашения.');
      setSuccessMessage('');
      return;
    }
  
    console.log("inviteCode:", inviteCode);
    console.log("userId:", memberId);
  
    try {
      const response = await joinTeam(inviteCode, memberId);
  
      if (response.success) {
        setSuccessMessage(`Вы успешно присоединились к команде "${response.teamName}"!`);
        setErrorMessage('');
      }
    } catch (error) {
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