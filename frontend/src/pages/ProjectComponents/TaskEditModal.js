import React, { useState, useEffect, useCallback } from 'react';
import { fetchComments, addComment } from '../../services/commentApi';
import { fetchProfile } from '../../services/memberApi';
import { fetchStatusesByTeamId, updateTask } from '../../services/taskApi';
import { fetchTeamMembers } from '../../services/teamApi';
import { FaTimes, FaUser, FaCalendarAlt, FaFlag, FaExclamationCircle, FaPaperPlane, FaSearch, FaFilter, FaSortAmountDown, FaChevronDown } from 'react-icons/fa';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import TextField from '@mui/material/TextField';
import '../styles/TaskModal.css';

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const names = name.trim().split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

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

const TaskModal = ({ task, teamId, onClose, projectId, onTasksRefresh }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || '');
  const [startDate, setStartDate] = useState(task.startDate ? new Date(task.startDate) : null);
  const [endDate, setEndDate] = useState(task.endDate ? new Date(task.endDate) : null);
  const [userProfiles, setUserProfiles] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(task.status || '');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  const safeGetUserProfile = useCallback((memberId) => {
    return userProfiles[memberId] || { firstName: 'Неизвестный', lastName: 'Пользователь' };
  }, [userProfiles]);

  const getUserNameById = useCallback((memberId) => {
    const user = safeGetUserProfile(memberId);
    return `${user.firstName} ${user.lastName}`.trim();
  }, [safeGetUserProfile]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
    const loadData = async () => {
      if (!task?.id || !teamId) {
        console.error('Task ID или Team ID отсутствует');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [fetchedComments, fetchedStatuses, fetchedMembers] = await Promise.allSettled([
          fetchComments(task.id),
          fetchStatusesByTeamId(teamId),
          fetchTeamMembers(teamId)
        ]);
        if (fetchedComments.status === 'fulfilled') {
          setComments(fetchedComments.value || []);
        } else {
          console.error('Ошибка при получении комментариев:', fetchedComments.reason);
          setComments([]);
        }
        if (fetchedStatuses.status === 'fulfilled') {
          setStatuses(fetchedStatuses.value || []);
          if (!selectedStatus && fetchedStatuses.value?.length > 0) {
            setSelectedStatus(fetchedStatuses.value[0].name);
          } else if (!selectedStatus) {
            setSelectedStatus('');
          }
        } else {
          console.error('Ошибка при получении статусов:', fetchedStatuses.reason);
          setStatuses([]);
        }
        if (fetchedMembers.status === 'fulfilled') {
          setTeamMembers(fetchedMembers.value || []);
        } else {
          console.error('Ошибка при загрузке участников команды:', fetchedMembers.reason);
          setTeamMembers([]);
        }
        const loadedComments = fetchedComments.status === 'fulfilled' ? fetchedComments.value : [];
        const memberIds = new Set([
          ...loadedComments.map(comment => comment.memberId),
          task.assignee,
          userId
        ].filter(Boolean));
        const profilesToFetch = Array.from(memberIds).filter(id => !userProfiles[id]);
        if (profilesToFetch.length > 0) {
          const profilePromises = profilesToFetch.map(async (memberId) => {
            try {
              const profile = await fetchProfile(memberId);
              return { [memberId]: profile };
            } catch (error) {
              console.error(`Ошибка при получении профиля ${memberId}:`, error);
              return { [memberId]: { firstName: 'Неизвестный', lastName: 'Пользователь' } };
            }
          });
          const profilesResults = await Promise.allSettled(profilePromises);
          const newProfiles = profilesResults.reduce((acc, result) => {
            if (result.status === 'fulfilled') {
              return { ...acc, ...result.value };
            }
            return acc;
          }, {});
          setUserProfiles(prevProfiles => ({ ...prevProfiles, ...newProfiles }));
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных модального окна:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [task.id, task.assignee, teamId, userProfiles, selectedStatus]);

  const handleUpdateTask = async (updates) => {
    try {
      const formatDateTime = (date) => {
        if (!date) throw new Error('Дата обязательна');
        if (typeof date === 'string' && date.length === 10) {
          return date + 'T00:00:00Z';
        }
        return new Date(date).toISOString();
      };

      const taskData = {
        TaskId: task.id,
        TaskName: task.title,
        Description: updates.description !== undefined ? updates.description : task.description,
        ProjectId: projectId,
        MemberId: updates.memberId !== undefined ? updates.memberId : task.assignee,
        Status: updates.status !== undefined ? updates.status : task.status,
        StartDate: updates.startDate ? formatDateTime(updates.startDate) : formatDateTime(task.startDate),
        EndDate: updates.endDate ? formatDateTime(updates.endDate) : formatDateTime(task.endDate),
        Priority: updates.priority !== undefined ? updates.priority : task.priority,
        IsDeleted: task.isDeleted || false,
      };

      const updatedTask = await updateTask(task.id, taskData);
      setSelectedStatus(updatedTask.status);
      setPriority(updatedTask.priority);
      setDescription(updatedTask.description);
      setStartDate(updatedTask.startDate ? new Date(updatedTask.startDate) : null);
      setEndDate(updatedTask.endDate ? new Date(updatedTask.endDate) : null);

      if (updatedTask.memberId) {
        task.assignee = updatedTask.memberId;
      }
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      alert(`Не удалось обновить задачу: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      handleUpdateTask({ description });
    }
    setIsEditingDescription(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId) return;
    try {
      const commentData = {
        taskId: task.id,
        memberId: currentUserId,
        commentText: newComment,
        createdAt: new Date().toISOString(),
        isDeleted: false,
      };
      const createdComment = await addComment(commentData);
      if (!userProfiles[currentUserId]) {
        try {
          const profile = await fetchProfile(currentUserId);
          setUserProfiles(prev => ({ ...prev, [currentUserId]: profile }));
        } catch (error) {
          console.error(`Ошибка при получении профиля ${currentUserId}:`, error);
          setUserProfiles(prev => ({ ...prev, [currentUserId]: { firstName: 'Вы', lastName: '' } }));
        }
      }
      setComments(prevComments => [...prevComments, createdComment]);
      setNewComment('');
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
    }
  };

  const handleClose = () => {
    onClose();
    if (onTasksRefresh) {
      onTasksRefresh();
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Неверная дата';
    }
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
              onChange={(e) => handleUpdateTask({ status: e.target.value })}
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
        const assigneeId = task.assignee;
        const assigneeName = assigneeId ? getUserNameById(assigneeId) : 'Не назначен';
        return (
          <div className="metadata-value metadata-value--interactive">
            <span className="pill">{assigneeName}</span>
            <FaChevronDown className="metadata-value-icon" />
            <select
              className="metadata-select-overlay scaleSelect"
              value={assigneeId || ''}
              onChange={(e) => handleUpdateTask({ memberId: e.target.value })}
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
                onChange={(date) => handleUpdateTask({ startDate: date })}
                renderInput={(params) => <TextField {...params} className="date-picker-input small-date-picker" />}
              />
              <span className="date-label">Конец:</span>
              <DatePicker
                value={endDate}
                onChange={(date) => handleUpdateTask({ endDate: date })}
                renderInput={(params) => <TextField {...params} className="date-picker-input small-date-picker" />}
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
              onChange={(e) => handleUpdateTask({ priority: e.target.value })}
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

  if (isLoading) {
    return (
      <div className="task-modal-overlay">
        <div className="task-modal-content task-modal-loading">Загрузка задачи...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-modal-overlay" onClick={handleClose}>
        <div className="task-modal-content task-modal-error" onClick={e => e.stopPropagation()}>
          Данные задачи недоступны.
          <button onClick={handleClose} className="task-modal-close-btn"><FaTimes /></button>
        </div>
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
            <h2 className="task-modal-title">{task.title || 'Без названия'}</h2>
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
                  onBlur={handleDescriptionBlur}
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
          </div>
          <div className="task-modal-right-column">
            <div className="activity-header">
              <h3>Активность</h3>
              <div className="activity-header-actions">
                <button className="task-modal-icon-btn"><FaSearch /></button>
                <button className="task-modal-icon-btn"><FaFilter /></button>
                <button className="task-modal-icon-btn"><FaSortAmountDown /></button>
              </div>
            </div>
            <div className="activity-feed">
              {comments.map((comment) => (
                <div key={comment.commentId || comment.createdAt} className="activity-item">
                  <div className="activity-item-content">
                    <div className="activity-item-header">
                      <span className="activity-item-author">{getUserNameById(comment.memberId)}</span>
                      <span className="activity-item-date">{formatDateTime(comment.createdAt)}</span>
                    </div>
                    <p>{comment.commentText}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div className="activity-item--empty">Активности пока нет.</div>}
            </div>
            <div className="comment-input-section">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написать комментарий..."
                rows={2}
              />
              <button
                className="send-comment-btn"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;