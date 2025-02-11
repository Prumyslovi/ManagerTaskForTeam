import React, { useState, useRef, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import '../styles/Modal.css';
import '../styles/Spinner.css';
import { fetchTeamMembers } from '../../services/api';

const AddTaskModal = ({ visible, onVisibilityChange, onTaskAdd, teamId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const deadlineRef = useRef(null);

  useEffect((teamId) => {
    if (visible) {
      loadTeamMembers(teamId);
    }
  }, [visible]);

  const loadTeamMembers = async (teamId) => {
    try {
      const members = await fetchTeamMembers(teamId);
      setTeamMembers(members);
    } catch (error) {
      console.log(error);
      setErrorMessage('Ошибка загрузки участников команды.');
    }
  };

  if (!visible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = titleRef.current.value.trim();
    const description = descriptionRef.current.value.trim();
    const deadline = deadlineRef.current.value;

    if (!title || !deadline) {
      setErrorMessage('Название и срок выполнения обязательны.');
      return;
    }

    if (!selectedMemberId) {
      setErrorMessage('Необходимо выбрать участника, ответственного за задачу.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const newTask = {
        id: Date.now().toString(),
        title,
        description,
        deadline,
        memberId: selectedMemberId,
      };

      onTaskAdd(newTask);
      clearForm();
      onVisibilityChange(false);
    } catch (error) {
      setErrorMessage('Ошибка при добавлении задачи. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    titleRef.current.value = '';
    descriptionRef.current.value = '';
    deadlineRef.current.value = '';
    setSelectedMemberId('');
    setErrorMessage('');
  };

  return (
    <div className="modalRegForm">
      <form className="modalContent" onSubmit={handleSubmit}>
        <h2 align="center">Добавить задачу</h2>
        <button
          className="exitButton"
          type="button"
          onClick={() => onVisibilityChange(false)}
        >
          &times;
        </button>
        <div>
          <label htmlFor="title">Название:</label>
          <input type="text" id="title" name="title" required className="modalInput" ref={titleRef} />
        </div>
        <div>
          <label htmlFor="description">Описание:</label>
          <textarea id="description" name="description" className="modalInput" ref={descriptionRef} />
        </div>
        <div>
          <label htmlFor="deadline">Срок выполнения:</label>
          <input type="datetime-local" id="deadline" name="deadline" required className="modalInput" ref={deadlineRef} />
        </div>
        <div>
          <label htmlFor="member">Ответственный участник:</label>
          <select
            id="member"
            className="modalInput"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
          >
            <option value="">Выберите участника</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <div className="button-wrapper">
          <button type="submit" className="modalButtonReg" disabled={isLoading}>
            Добавить задачу
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

export default AddTaskModal;