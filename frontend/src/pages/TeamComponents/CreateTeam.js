import React, { useState } from 'react';
import '../styles/Modal.css';
import { getAllTeams, createTeam } from '../../services/api'; // Импортируем функции для API

const CreateTeam = ({ creatorId }) => {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Функция для генерации случайной ссылки из 6 символов
  const generateRandomLink = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomLink = '';
    for (let i = 0; i < 6; i++) {
      randomLink += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomLink;
  };

  // Функция для проверки уникальности ссылки
  const checkUniqueLink = async (link) => {
    try {
      const teams = await getAllTeams(); // Получаем все команды
      return !teams.some(team => team.teamLink === link); // Проверяем, есть ли уже такая ссылка
    } catch (error) {
      console.error('Ошибка при проверке уникальности ссылки:', error);
      return false; // Если ошибка, считаем, что ссылка уникальна
    }
  };

  // Функция для генерации уникальной ссылки
  const generateUniqueLink = async () => {
    let link = generateRandomLink();
    let isUnique = await checkUniqueLink(link);
    while (!isUnique) {
      link = generateRandomLink(); // Генерируем новую ссылку, если текущая не уникальна
      isUnique = await checkUniqueLink(link);
    }
    return link;
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName || !teamDescription) {
      setErrorMessage('Пожалуйста, заполните все поля.');
      return;
    }

    const teamLink = await generateUniqueLink(); // Генерируем уникальную ссылку

    const newTeam = {
      teamName,
      description: teamDescription,
      createdAt: new Date().toISOString(), // Указываем текущую дату
      creatorId, // ID создателя команды
      isDeleted: false, // По умолчанию команда не удалена
      teamLink, // Генерация уникальной ссылки
    };

    try {
      const response = await createTeam(newTeam);
      setSuccessMessage(`Команда "${response.teamName}" успешно создана!`);
      setErrorMessage('');
      setTeamName('');
      setTeamDescription('');
    } catch (error) {
      console.error(error);
      setErrorMessage('Ошибка при создании команды. Попробуйте снова.');
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
          />
        </div>
        <div>
          <label className="profileLabel">Описание команды</label>
          <textarea
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            placeholder="Введите описание команды"
            className="modalInput"
          />
        </div>
        <button type="submit" className="Button">Создать команду</button>
      </form>

      {successMessage && <div className="restricted-content">{successMessage}</div>}
      {errorMessage && <div className="restricted-content">{errorMessage}</div>}
    </div>
  );
};

export default CreateTeam;
