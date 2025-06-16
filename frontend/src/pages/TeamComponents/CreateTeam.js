import React, { useState } from 'react';
import '../styles/Modal.css';
import { createTeam } from '../../services/teamApi';

const CreateTeam = () => {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const memberId = localStorage.getItem('memberId');
      
      if (!teamName.trim() || !teamDescription.trim()) {
        throw new Error('Заполните все поля');
      }

      if (!memberId) {
        throw new Error('Пользователь не авторизован');
      }

      const newTeam = {
        TeamName: teamName.trim(),
        Description: teamDescription.trim(),
      };

      const response = await createTeam(newTeam);
      setSuccessMessage(`Команда "${response.teamName}" создана!`);
      setTeamName('');
      setTeamDescription('');
      
    } catch (error) {
      console.error('Ошибка создания команды:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        setErrorMessage(errorData.title || errorData || 'Ошибка сервера');
      } else {
        setErrorMessage(error.message || 'Ошибка при создании команды');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-team programSection">
      <form onSubmit={handleCreateTeam}>
        <div>
          <label className="profileLabel">Название команды</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Введите название команды"
            className="modalInput"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="profileLabel">Описание команды</label>
          <textarea
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            placeholder="Введите описание команды"
            className="modalInput"
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="Button"
          disabled={isLoading}
        >
          {isLoading ? 'Создание...' : 'Создать команду'}
        </button>
      </form>

      {successMessage && <div className="success">{successMessage}</div>}
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  );
};

export default CreateTeam;