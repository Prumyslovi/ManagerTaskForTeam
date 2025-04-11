import React, { useState, useEffect, useCallback } from 'react';
import { fetchComments, addComment } from '../../services/commentApi';
import { fetchProfile } from '../../services/memberApi';
import { fetchStatusesByTeamId, updateTask } from '../../services/taskApi';
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

const getPillStyle = (type, value) => {
  let backgroundColor = '#1D334A';
  let color = '#FFFFFF';
  if (type === 'status') {
    const statusLower = value?.toLowerCase() || '';
    if (statusLower.includes('progress') || statusLower.includes('процессе')) {
      backgroundColor = '#10447c';
      color = '#FFFFFF';
    } else if (statusLower.includes('done') || statusLower.includes('сделано')) {
      backgroundColor = '#d8a903';
      color = '#000000';
    } else {
      backgroundColor = '#1D334A';
      color = '#FFFFFF';
    }
  } else if (type === 'priority') {
    switch (value?.toLowerCase()) {
      case 'низкий':
      case 'low':
        backgroundColor = '#4CAF50';
        color = '#000000';
        break;
      case 'средний':
      case 'medium':
        backgroundColor = '#2196F3';
        color = '#FFFFFF';
        break;
      case 'высокий':
      case 'high':
        backgroundColor = '#FF9800';
        color = '#000000';
        break;
      case 'срочный':
      case 'urgent':
        backgroundColor = '#FF5722';
        color = '#FFFFFF';
        break;
      case 'критический':
      case 'critical':
        backgroundColor = '#D32F2F';
        color = '#FFFFFF';
        break;
      default:
        backgroundColor = '#1D334A';
        color = '#FFFFFF';
        break;
    }
  }
  return { backgroundColor, color };
};

const TaskModal = ({ task, teamId, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'Низкий');
  const [startDate, setStartDate] = useState(task.startDate ? new Date(task.startDate) : null);
  const [endDate, setEndDate] = useState(task.endDate ? new Date(task.endDate) : null);
  const [userProfiles, setUserProfiles] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(task.status || '');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

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
        console.error("Task ID или Team ID отсутствует");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [fetchedComments, fetchedStatuses] = await Promise.allSettled([
          fetchComments(task.id),
          fetchStatusesByTeamId(teamId)
        ]);
        if (fetchedComments.status === 'fulfilled') {
          setComments(fetchedComments.value || []);
        } else {
          console.error("Ошибка при получении комментариев:", fetchedComments.reason);
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
          console.error("Ошибка при получении статусов:", fetchedStatuses.reason);
          setStatuses([]);
          setSelectedStatus('');
        }
        const loadedComments = fetchedComments.status === 'fulfilled' ? fetchedComments.value : [];
        const memberIds = new Set([
          ...loadedComments.map(comment => comment.memberId),
          task.assignee,
          task.assignedBy,
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
  }, [task.id, task.assignee, task.assignedBy, teamId, userProfiles, selectedStatus]);

  const handleUpdateTask = async (updates) => {
    try {
      const updatedTask = await updateTask(task.id, { ...task, ...updates });
      if (updates.status !== undefined) setSelectedStatus(updates.status);
      if (updates.priority !== undefined) setPriority(updatedTask.priority || updates.priority);
      if (updates.description !== undefined) setDescription(updates.description);
      if (updates.startDate !== undefined)
        setStartDate(updates.startDate ? new Date(updates.startDate) : null);
      if (updates.endDate !== undefined)
        setEndDate(updates.endDate ? new Date(updates.endDate) : null);
    } catch (error) {
      console.error(`Ошибка при обновлении задачи:`, error);
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
        const styleStatus = getPillStyle('status', selectedStatus);
        return (
          <div className="metadata-value metadata-value--interactive">
            <span className="pill" style={styleStatus}>
              {selectedStatus || 'Нет'}
            </span>
            <FaChevronDown className="metadata-value-icon" />
            <select
              className="metadata-select-overlay"
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
        if (!assigneeId) return <span className="metadata-value metadata-value--empty">Пусто</span>;
        const userName = getUserNameById(assigneeId);
        return (
          <div className="metadata-value metadata-value--assignee">
            <span>{userName}</span>
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
                renderInput={(params) => <TextField {...params} />}
              />
              <span className="date-label">Конец:</span>
              <DatePicker
                value={endDate}
                onChange={(date) => handleUpdateTask({ endDate: date })}
                renderInput={(params) => <TextField {...params} />}
                minDate={startDate}
              />
            </div>
          </LocalizationProvider>
        );
      case 'Приоритет':
        const priorities = ['Низкий', 'Средний', 'Высокий', 'Срочный', 'Критический'];
        const stylePriority = getPillStyle('priority', priority);
        return (
          <div className="metadata-value metadata-value--interactive">
            <span className="pill" style={stylePriority}>
              {priority || 'Нет'}
            </span>
            <FaChevronDown className="metadata-value-icon" />
            <select
              className="metadata-select-overlay"
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
      <div className="task-modal-overlay" onClick={onClose}>
        <div className="task-modal-content task-modal-error" onClick={e => e.stopPropagation()}>
          Данные задачи недоступны.
          <button onClick={onClose} className="task-modal-close-btn"><FaTimes /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="task-modal-top-bar">
          <div className="task-modal-top-actions">
            <button onClick={onClose} className="task-modal-icon-btn task-modal-close-btn">
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
