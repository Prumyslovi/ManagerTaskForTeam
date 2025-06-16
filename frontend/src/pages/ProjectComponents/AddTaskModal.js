import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaCalendarAlt, FaFlag, FaExclamationCircle, FaChevronDown } from 'react-icons/fa';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import TextField from '@mui/material/TextField';
import { fetchTeamMembers } from '../../services/teamApi';
import { fetchStatusesByTeamId, createTask } from '../../services/taskApi';
import '../styles/TaskModal.css';

const getStatusStyle = (status) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower.includes('планах')) return { backgroundColor: 'var(--status-planned-bg)', color: 'var(--status-planned-text)' };
  if (statusLower.includes('процессе')) return { backgroundColor: 'var(--status-in-progress-bg)', color: 'var(--status-in-progress-text)' };
  if (statusLower.includes('проверке')) return { backgroundColor: 'var(--status-under-review-bg)', color: 'var(--status-under-review-text)' };
  if (statusLower.includes('сделано')) return { backgroundColor: 'var(--status-done-bg)', color: 'var(--status-done-text)' };
  const randomColors = ['#0288D1', '#7B1FA2', '#388E3C', '#FBC02D', '#D81B60', '#455A64'];
  const randomIndex = Math.floor(Math.random() * randomColors.length);
  return { backgroundColor: randomColors[randomIndex], color: '#FFFFFF' };
};

const getPriorityStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'низкий': case 'low':
      return { backgroundColor: 'var(--priority-low-bg)', color: 'var(--priority-low-text)' };
    case 'средний': case 'medium':
      return { backgroundColor: 'var(--priority-medium-bg)', color: 'var(--priority-medium-text)' };
    case 'высокий': case 'high':
      return { backgroundColor: 'var(--priority-high-bg)', color: 'var(--priority-high-text)' };
    case 'срочный': case 'urgent':
      return { backgroundColor: 'var(--priority-urgent-bg)', color: 'var(--priority-urgent-text)' };
    case 'критический': case 'critical':
      return { backgroundColor: 'var(--priority-critical-bg)', color: 'var(--priority-critical-text)' };
    default:
      return { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' };
  }
};

const AddTaskModal = ({ visible, onVisibilityChange, onTaskAdd, teamId, projectId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  useEffect(() => {
    if (visible && teamId) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const [fetchedMembers, fetchedStatuses] = await Promise.allSettled([
            fetchTeamMembers(teamId),
            fetchStatusesByTeamId(teamId),
          ]);

          if (fetchedMembers.status === 'fulfilled') {
            setTeamMembers(fetchedMembers.value || []);
          } else {
            setTeamMembers([]);
            setErrorMessage('Ошибка загрузки участников команды.');
          }

          if (fetchedStatuses.status === 'fulfilled') {
            setStatuses(fetchedStatuses.value || []);
            if (fetchedStatuses.value?.length > 0) {
              setSelectedStatus(fetchedStatuses.value[0].name);
            }
          } else {
            setStatuses([]);
            setErrorMessage('Ошибка загрузки статусов.');
          }
        } catch (error) {
          setErrorMessage('Ошибка при загрузке данных.');
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [visible, teamId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Название задачи обязательно.');
      return;
    }
    if (!endDate) {
      setErrorMessage('Срок выполнения обязателен.');
      return;
    }
    if (!selectedMemberId) {
      setErrorMessage('Необходимо выбрать участника.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formatDateTime = (date) => {
        if (!date) return new Date().toISOString();
        if (typeof date === 'string' && date.length === 10) {
          return date + 'T00:00:00Z';
        }
        return new Date(date).toISOString();
      };

      const taskData = {
        taskId: crypto.randomUUID(),
        taskName: title,
        description: description || '',
        teamId: teamId,
        projectId: projectId,
        memberId: selectedMemberId,
        status: selectedStatus || 'В планах',
        startDate: startDate ? formatDateTime(startDate) : new Date().toISOString(),
        endDate: formatDateTime(endDate),
        priority: priority || '',
        isDeleted: false,
      };

      const newTask = await createTask(taskData);
      onTaskAdd(newTask);
      onVisibilityChange(false);
    } catch (error) {
      setErrorMessage(`Не удалось создать задачу: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setPriority('');
    setSelectedStatus(statuses[0]?.name || '');
    setSelectedMemberId('');
    setStartDate(null);
    setEndDate(null);
    setErrorMessage('');
    setIsEditingDescription(false);
    onVisibilityChange(false);
  };

  const renderMetadataValue = (field) => {
    switch (field) {
      case 'Статус':
        return (
          <div className="metadata-value metadata-value--interactive">
            <span className="pill" style={getStatusStyle(selectedStatus)}>
              {selectedStatus || 'Нет'}
            </span>
            <FaChevronDown className="metadata-value-icon" />
            <select
              className="metadata-select-overlay scaleSelect"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {!statuses.some(s => s.name === '') && <option value="">Нет</option>}
              {statuses.map((status) => (
                <option key={status.statusId || status.name} value={status.name}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        );
      case 'Исполнители':
        const assigneeName = selectedMemberId
          ? teamMembers.find(m => m.id === selectedMemberId)
            ? `${teamMembers.find(m => m.id === selectedMemberId).firstName} ${teamMembers.find(m => m.id === selectedMemberId).lastName}`.trim()
            : 'Не назначен'
          : 'Не назначен';
        return (
          <div className="metadata-value metadata-value--interactive">
            <span className="pill">{assigneeName}</span>
            <FaChevronDown className="metadata-value-icon" />
            <select
              className="metadata-select-overlay scaleSelect"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              <option value="">Не назначен</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {`${member.firstName} ${member.lastName}`.trim()}
                </option>
              ))}
            </select>
          </div>
        );
      case 'Даты':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="metadata-value metadata-value--dates">
              <span className="date-label">Старт:</span>
              <DatePicker
                value={startDate}
                onChange={(date) => setStartDate(date)}
                renderInput={(params) => <TextField {...params} className="date-picker-input small-date-picker" />}
              />
              <span className="date-label">Конец:</span>
              <DatePicker
                value={endDate}
                onChange={(date) => setEndDate(date)}
                renderInput={(params) => <TextField size='small' {...params} className="date-picker-input small-date-picker" />}
                minDate={startDate}
              />
            </div>
          </LocalizationProvider>
        );
      case 'Приоритет':
        const priorities = ['Низкий', 'Средний', 'Высокий', 'Срочный', 'Критический'];
        return (
          <div className="metadata-value metadata-value--interactive">
            <span className="pill" style={getPriorityStyle(priority)}>
              {priority || 'Нет'}
            </span>
            <FaChevronDown className="metadata-value-icon" />
            <select
              className="metadata-select-overlay scaleSelect"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">Нет</option>
              {priorities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        );
      default:
        return <span className="metadata-value metadata-value--empty">Пусто</span>;
    }
  };

  if (!visible) return null;

  if (isLoading) {
    return (
      <div className="task-modal-overlay">
        <div className="task-modal-content task-modal-loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="task-modal-overlay" onClick={handleClose}>
      <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="task-modal-top-bar">
          <div className="task-modal-top-actions">
            <button onClick={handleClose} className="task-modal-icon-btn task-modal-close-btn">
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="task-modal-main-content">
          <div className="task-modal-left-column">
            <input
              type="text"
              className="task-modal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название задачи"
              autoFocus
            />
            <div className="task-modal-metadata">
              {[
                { icon: FaFlag, label: 'Статус' },
                { icon: FaUser, label: 'Исполнители' },
                { icon: FaCalendarAlt, label: 'Даты' },
                { icon: FaExclamationCircle, label: 'Приоритет' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="metadata-item">
                  <span className="metadata-label">
                    <Icon className="metadata-icon" />
                    {label}:
                  </span>
                  {renderMetadataValue(label)}
                </div>
              ))}
            </div>
            <div className="task-modal-description-section">
              <h3 onClick={() => setIsEditingDescription(true)}>Описание</h3>
              {isEditingDescription ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => setIsEditingDescription(false)}
                  placeholder="Добавить описание..."
                  rows={5}
                  autoFocus
                />
              ) : (
                <div className="description-display" onClick={() => setIsEditingDescription(true)}>
                  {description || <span className="placeholder">Добавить описание...</span>}
                </div>
              )}
            </div>
            {errorMessage && <div className="task-modal-error">{errorMessage}</div>}
            <div className="task-modal-actions">
              <button
                className="create-task-btn"
                onClick={handleSubmit}
                disabled={isLoading || !title.trim() || !endDate || !selectedMemberId}
              >
                {isLoading ? 'Создание...' : 'Создать задачу'}
              </button>
            </div>
          </div>
          <div className="task-modal-right-column">
            <div className="task-modal-activity-section">
              <h3>Активность</h3>
              <div className="activity-placeholder">
                Активность будет доступна после создания задачи
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;