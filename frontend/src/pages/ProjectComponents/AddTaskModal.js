import React, { useState, useRef, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import '../styles/Modal.css';
import '../styles/Message.css';
import '../styles/Spinner.css';
import { fetchTeamMembers } from '../../services/teamApi';
import { createTask } from '../../services/taskApi';

const AddTaskModal = ({ visible, onVisibilityChange, onTaskAdd, teamId, projectId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [isMemberSelectClicked, setIsMemberSelectClicked] = useState(false);

  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const deadlineRef = useRef(null);

  useEffect(() => {
    if (visible && teamId) {
      loadTeamMembers(teamId);
    }
  }, [visible, teamId]);

  const loadTeamMembers = async (teamId) => {
    try {
      const members = await fetchTeamMembers(teamId);
      setTeamMembers(members);
      console.log(members);
    } catch (error) {
      console.log(error);
      setErrorMessage('Ошибка загрузки участников команды.');
    }
  };

  if (!visible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (teamMembers.length === 0) {
      setErrorMessage('Нельзя добавить задачу без участников.');
      return;
    }
  
    const title = titleRef.current.value.trim();
    const description = descriptionRef.current.value.trim();
    const deadline = deadlineRef.current.value;
    const createdAt = new Date().toISOString();
  
    if (!title || !deadline) {
      setErrorMessage('Название и срок выполнения обязательны.');
      return;
    }
  
    if (!selectedMemberId) {
      setErrorMessage('Необходимо выбрать участника.');
      return;
    }
  
    setIsLoading(true);
    setErrorMessage('');
  
    try {
      const newTask = {
        taskId: crypto.randomUUID(),
        taskName: title,
        description,
        teamId: teamId,
        projectId: projectId,
        memberId: selectedMemberId,
        status: 'В планах',
        startDate: createdAt,
        endDate: deadline,
        isDeleted: false,
      };
  
      await createTask(newTask);
      onTaskAdd(newTask);
      clearForm();
      onVisibilityChange(false);
    } catch (error) {
      setErrorMessage('Ошибка при добавлении задачи.');
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
    setIsMemberSelectClicked(false);
  };

  return (
    <div className="modalRegForm">
      <form className="modalContent" onSubmit={handleSubmit}>
        <h2 align="center">Добавить задачу</h2>
        <button className="exitButton" type="button" onClick={() => onVisibilityChange(false)}>
          &times;
        </button>

        <div>
          <label htmlFor="title">Название:</label>
          <input type="text" id="title" required className="modalInput" ref={titleRef} />
        </div>

        <div>
          <label htmlFor="description">Описание:</label>
          <textarea id="description" className="modalInput" ref={descriptionRef} />
        </div>

        <div>
          <label htmlFor="deadline">Срок выполнения:</label>
          <input type="datetime-local" id="deadline" required className="modalInput" ref={deadlineRef} />
        </div>

        <div>
          <label htmlFor="member">Ответственный участник:</label>
          {teamMembers.length === 0 ? (
            <p className="error-message">Ошибка загрузки участников</p>
          ) : (
            <select
              id="member"
              className="modalInput"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              onClick={() => setIsMemberSelectClicked(true)}
            >
              {!isMemberSelectClicked && <option value="">Выберите участника</option>}
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.lastName} {member.firstName}
                </option>
              ))}
            </select>
          )}
        </div>

        {errorMessage && <div className="restricted-content">{errorMessage}</div>}

        <div className="button-wrapper">
          <button type="submit" className="modalButtonReg" disabled={isLoading || teamMembers.length === 0}>
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
