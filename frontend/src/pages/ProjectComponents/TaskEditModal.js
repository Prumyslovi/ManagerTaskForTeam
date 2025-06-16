import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchComments, addComment } from '../../services/commentApi';
import { fetchProfile } from '../../services/memberApi';
import { fetchStatusesByTeamId, updateTask } from '../../services/taskApi';
import { fetchTeamMembers, getUsersWithRoles } from '../../services/teamApi';
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
  return { backgroundColor: '#455A64', color: '#FFFFFF' };
};

const getPriorityStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'низкий': case 'low': return { backgroundColor: 'var(--priority-low-bg)', color: 'var(--priority-low-text)' };
    case 'средний': case 'medium': return { backgroundColor: 'var(--priority-medium-bg)', color: 'var(--priority-medium-text)' };
    case 'высокий': case 'high': return { backgroundColor: 'var(--priority-high-bg)', color: 'var(--priority-high-text)' };
    case 'срочный': case 'urgent': return { backgroundColor: 'var(--priority-urgent-bg)', color: 'var(--priority-urgent-text)' };
    case 'критический': case 'critical': return { backgroundColor: 'var(--priority-critical-bg)', color: 'var(--priority-critical-text)' };
    default: return { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' };
  }
};

const rolePermissions = {
  'Создатель': [
    'DeleteProject', 'Import', 'UpdateTask', 'DeleteTask', 'ReadTask', 'ChangeTaskStatus', 'ManageUsers', 'EditTaskDates',
    'ApproveTaskStatus', 'UpdateProject', 'AssignableToTask', 'DeleteUsers', 'Comment', 'Export', 'CreateProject',
    'AssignTaskToOthers', 'CreateTask'
  ],
  'Администратор': [
    'ManageUsers', 'ReadTask', 'ChangeTaskStatus', 'EditTaskDates', 'Comment', 'Export', 'CreateProject', 'ApproveTaskStatus',
    'AssignableToTask', 'UpdateTask', 'DeleteTask', 'CreateTask', 'AssignTaskToOthers'
  ],
  'Руководитель': [
    'Export', 'Comment', 'ReadTask', 'ChangeTaskStatus', 'ApproveTaskStatus', 'CreateTask', 'ManageUsers', 'AssignableToTask',
    'UpdateTask', 'DeleteTask'
  ],
  'Менеджер': [
    'ReadTask', 'ChangeTaskStatus', 'Comment', 'EditTaskDates', 'AssignableToTask', 'UpdateTask', 'CreateTask', 'AssignTaskToOthers'
  ],
  'Участник': ['ReadTask', 'Comment', 'AssignTaskToOthers'],
  'Гость': ['ReadTask']
};

const hasPermission = (role, permission) => {
  return rolePermissions[role]?.includes(permission) || false;
};

const TaskModal = ({ task, teamId, onClose, projectId, onTasksRefresh }) => {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || '');
  const [startDate, setStartDate] = useState(task.startDate ? new Date(task.startDate) : null);
  const [endDate, setEndDate] = useState(task.endDate ? new Date(task.endDate) : null);
  const [userProfiles, setUserProfiles] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(task.status || '');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId] = useState(localStorage.getItem('memberId') || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [assigneeHoverInfo, setAssigneeHoverInfo] = useState(null);
  const [assignee, setAssignee] = useState(task.assignee || '');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [sortOrder] = useState('asc');
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const priorityStyle = useMemo(() => getPriorityStyle(priority), [priority]);
  const statusStyle = useMemo(() => getStatusStyle(selectedStatus), [selectedStatus]);

  const safeGetUserProfile = useCallback((memberId) => {
    return userProfiles[memberId] || { firstName: 'Неизвестный', lastName: 'Пользователь' };
  }, [userProfiles]);

  const getUserNameById = useCallback((memberId) => {
    const profile = safeGetUserProfile(memberId);
    if (profile.firstName === 'Неизвестный') {
      const member = teamMembers.find(m => m.memberId === memberId);
      return member ? `${member.firstName} ${member.lastName}`.trim() : 'Неизвестный пользователь';
    }
    return `${profile.firstName} ${profile.lastName}`.trim();
  }, [safeGetUserProfile, teamMembers]);

  const getUserLoginById = useCallback((memberId) => {
    const profile = safeGetUserProfile(memberId);
    if (!profile.login && !profile.email) {
      const member = teamMembers.find(m => m.memberId === memberId);
      return member ? member.email || member.login || 'Неизвестный логин' : 'Неизвестный логин';
    }
    return profile.login || profile.email || 'Неизвестный логин';
  }, [safeGetUserProfile, teamMembers]);

  useEffect(() => {
    const loadData = async () => {
      if (!task?.id || !teamId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [commentsResult, statusesResult, membersResult, rolesResult] = await Promise.allSettled([
          fetchComments(task.id),
          fetchStatusesByTeamId(teamId),
          fetchTeamMembers(teamId),
          getUsersWithRoles(teamId)
        ]);

        const fetchedComments = commentsResult.status === 'fulfilled' ? commentsResult.value || [] : [];
        setComments(fetchedComments);
        setFilteredComments(fetchedComments);

        setStatuses(statusesResult.status === 'fulfilled' ? statusesResult.value || [] : []);
        setTeamMembers(membersResult.status === 'fulfilled' ? membersResult.value || [] : []);

        if (statusesResult.status === 'fulfilled' && statusesResult.value?.length > 0 && !selectedStatus) {
          setSelectedStatus(statusesResult.value[0].name);
        }

        if (membersResult.status === 'fulfilled' && task.assignee && typeof task.assignee === 'string' && !task.assignee.includes('-')) {
          const matchedMember = membersResult.value.find(m => `${m.firstName} ${m.lastName}`.trim() === task.assignee);
          if (matchedMember) {
            setAssignee(matchedMember.memberId);
          }
        }

        const memberIds = new Set([
          ...(commentsResult.status === 'fulfilled' ? fetchedComments.map(c => c.memberId) : []),
          task.assignee,
          currentUserId,
          ...(membersResult.status === 'fulfilled' ? membersResult.value.map(m => m.memberId) : [])
        ].filter(Boolean));

        const profilesToFetch = Array.from(memberIds).filter(id => !userProfiles[id]);
        if (profilesToFetch.length > 0) {
          const profilePromises = profilesToFetch.map(async (memberId) => {
            try {
              const profile = await fetchProfile(memberId);
              return { [memberId]: profile };
            } catch {
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
          setUserProfiles(prev => ({ ...prev, ...newProfiles }));
        }

        if (rolesResult.status === 'fulfilled' && rolesResult.value) {
          const userRoleInfo = rolesResult.value.find(member => member.memberId === currentUserId);
          if (userRoleInfo) {
            setUserRole(userRoleInfo.roleName);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [task.id, teamId, currentUserId]);

  useEffect(() => {
    let result = [...comments];
    if (searchQuery) {
      result = result.filter(comment =>
        comment.commentText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedAuthor) {
      result = result.filter(comment => comment.memberId === selectedAuthor);
    }
    if (dateRange !== 'all') {
      const now = new Date();
      result = result.filter(comment => {
        const commentDate = new Date(comment.createdAt);
        if (dateRange === 'month') {
          return commentDate >= new Date(now.setDate(now.getDate() - 30));
        } else if (dateRange === 'week') {
          return commentDate >= new Date(now.setDate(now.getDate() - 7));
        } else if (dateRange === 'day') {
          return commentDate >= new Date(now.setTime(now.getTime() - 24 * 60 * 60 * 1000));
        }
        return true;
      });
    }
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setFilteredComments(result);
  }, [comments, searchQuery, selectedAuthor, dateRange, sortOrder]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleUpdateTask = async (updates) => {
    if (updates.status && !hasPermission(userRole, 'ChangeTaskStatus')) {
      setError('У вас нет прав для изменения статуса задачи.');
      return;
    }
    if ((updates.description || updates.startDate || updates.endDate || updates.priority) && !hasPermission(userRole, 'UpdateTask')) {
      setError('У вас нет прав для обновления задачи.');
      return;
    }
    if (updates.memberId && !hasPermission(userRole, 'AssignTaskToOthers')) {
      setError('У вас нет прав для назначения исполнителей.');
      return;
    }
    try {
      const formatDateTime = (date) => {
        if (!date) return null;
        if (typeof date === 'string' && date.length === 10) return date + 'T00:00:00Z';
        return new Date(date).toISOString();
      };

      const taskData = {
        TaskId: task.id,
        TaskName: task.title,
        Description: updates.description !== undefined ? updates.description : description,
        ProjectId: projectId,
        MemberId: updates.memberId !== undefined ? updates.memberId : assignee,
        Status: updates.status !== undefined ? updates.status : selectedStatus,
        StartDate: updates.startDate ? formatDateTime(updates.startDate) : startDate ? formatDateTime(startDate) : null,
        EndDate: updates.endDate ? formatDateTime(updates.endDate) : endDate ? formatDateTime(endDate) : null,
        Priority: updates.priority !== undefined ? updates.priority : priority,
        IsDeleted: task.isDeleted || false,
      };

      const updatedTask = await updateTask(task.id, taskData);
      
      setSelectedStatus(updatedTask.status);
      setPriority(updatedTask.priority);
      setDescription(updatedTask.description);
      setStartDate(updatedTask.startDate ? new Date(updatedTask.startDate) : null);
      setEndDate(updatedTask.endDate ? new Date(updatedTask.endDate) : null);
      setAssignee(updatedTask.memberId || '');

      if (onTasksRefresh) onTasksRefresh();
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      setError(`Не удалось обновить задачу: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      handleUpdateTask({ description });
    }
    setIsEditingDescription(false);
  };

  const handleAddComment = async () => {
    if (!hasPermission(userRole, 'Comment')) {
      setError('У вас нет прав для добавления комментариев.');
      return;
    }
    if (!newComment.trim()) {
      setError('Комментарий не может быть пустым.');
      return;
    }
    if (!currentUserId) {
      setError('Пользователь не авторизован. Пожалуйста, войдите в систему.');
      return;
    }
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Токен авторизации не найден. Пожалуйста, войдите в систему.');
        return;
      }
      const commentData = {
        TaskId: task.id,
        MemberId: currentUserId,
        CommentText: newComment,
        CreatedAt: new Date().toISOString(),
        IsDeleted: false,
      };
      const createdComment = await addComment(commentData);
      if (!userProfiles[currentUserId]) {
        try {
          const profile = await fetchProfile(currentUserId);
          setUserProfiles(prev => ({ ...prev, [currentUserId]: profile }));
        } catch {
          setUserProfiles(prev => ({ ...prev, [currentUserId]: { firstName: 'Вы', lastName: '' } }));
        }
      }
      setComments(prev => [...prev, createdComment]);
      setNewComment('');
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
      setError(`Ошибка при добавлении комментария: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleClose = () => {
    onClose();
    if (onTasksRefresh) onTasksRefresh();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch {
      return 'Неверная дата';
    }
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
    setIsFilterModalOpen(false);
  };

  const handleFilterSortClick = () => {
    setIsFilterModalOpen(true);
    setIsSearchModalOpen(false);
  };

  const renderMetadataValue = (field) => {
    switch (field) {
      case 'Статус':
        if (!hasPermission(userRole, 'ChangeTaskStatus')) {
          return (
            <div className="metadata-value">
              <span className="pill" style={statusStyle}>
                {selectedStatus || 'Нет'}
              </span>
            </div>
          );
        }
        return (
          <div className="metadata-value metadata-value--interactive">
            <span className="pill" style={statusStyle}>
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
        const assigneeName = getUserNameById(assignee);
        if (!hasPermission(userRole, 'AssignTaskToOthers')) {
          return (
            <div className="metadata-value">
              <span className="pill">
                {assigneeName}
              </span>
            </div>
          );
        }
        return (
          <div className="metadata-value metadata-value--interactive">
            <span 
              className="pill"
              onMouseEnter={() => assignee && setAssigneeHoverInfo({ name: assigneeName, login: getUserLoginById(assignee) })}
              onMouseLeave={() => setAssigneeHoverInfo(null)}
              style={{ position: 'relative' }}
            >
              {assigneeName}
              {assigneeHoverInfo && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    marginTop: '2px',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  Логин: {assigneeHoverInfo.login}
                </div>
              )}
            </span>
            <FaChevronDown className="metadata-value-icon" />
            <select
              className="metadata-select-overlay scaleSelect"
              value={assignee}
              onChange={(e) => {
                const selectedMemberId = e.target.value;
                setAssignee(selectedMemberId);
                handleUpdateTask({ memberId: selectedMemberId });
              }}
            >
              <option value="">Не назначен</option>
              {teamMembers.map((member) => (
                <option key={member.memberId} value={member.memberId}>
                  {`${member.firstName} ${member.lastName}`.trim()}
                </option>
              ))}
            </select>
          </div>
        );
      case 'Даты':
        if (!hasPermission(userRole, 'EditTaskDates')) {
          return (
            <div className="metadata-value">
              <span className="date-label">Старт: {formatDateTime(startDate)}</span>
              <span className="date-label">Конец: {formatDateTime(endDate)}</span>
            </div>
          );
        }
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
        if (!hasPermission(userRole, 'UpdateTask')) {
          return (
            <div className="metadata-value">
              <span className="pill" style={priorityStyle}>
                {priority || 'Нет'}
              </span>
            </div>
          );
        }
        const priorities = ['Низкий', 'Средний', 'Высокий', 'Срочный', 'Критический'];
        return (
          <div className="metadata-value metadata-value--interactive">
            <span className="pill" style={priorityStyle}>
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
        {error && <div className="restricted-content-fade">{error}</div>}
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
              <h3 onClick={() => hasPermission(userRole, 'UpdateTask') && setIsEditingDescription(true)}>Описание</h3>
              {isEditingDescription && hasPermission(userRole, 'UpdateTask') ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  placeholder="Добавить описание..."
                  rows={5}
                  autoFocus
                />
              ) : (
                <div className="description-display" onClick={() => hasPermission(userRole, 'UpdateTask') && setIsEditingDescription(true)}>
                  {description || <span className="placeholder">Добавить описание...</span>}
                </div>
              )}
            </div>
          </div>
          <div className="task-modal-right-column">
            <div className="activity-header">
              <h3>Активность</h3>
              <div className="activity-header-actions">
                <button className="task-modal-icon-btn" onClick={handleSearchClick}>
                  <FaSearch />
                </button>
                <button className="task-modal-icon-btn" onClick={handleFilterSortClick}>
                  <FaFilter />
                </button>
                <button className="task-modal-icon-btn" onClick={handleFilterSortClick}>
                  <FaSortAmountDown />
                </button>
              </div>
            </div>
            {isSearchModalOpen && (
              <div className="filter-modal" style={{ position: 'absolute', top: '60px', right: '20px' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по комментариям..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
                <button
                  className="task-modal-icon-btn"
                  onClick={() => setIsSearchModalOpen(false)}
                  style={{ marginTop: '8px', width: '100%' }}
                >
                  Закрыть
                </button>
              </div>
            )}
            {isFilterModalOpen && (
              <div className="filter-modal" style={{ position: 'absolute', top: '60px', right: '20px' }}>
                <label>
                  Автор:
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    style={{
                      display: 'block',
                      marginTop: '5px',
                      width: '100%',
                      padding: '4px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">Все</option>
                    {teamMembers.map((member) => (
                      <option key={member.memberId} value={member.memberId}>
                        {`${member.firstName} ${member.lastName}`.trim()}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ marginTop: '10px' }}>
                  Дата:
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    style={{
                      display: 'block',
                      marginTop: '5px',
                      width: '100%',
                      padding: '4px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  >
                    <option value="all">Все время</option>
                    <option value="month">Месяц</option>
                    <option value="week">Неделя</option>
                    <option value="day">День</option>
                  </select>
                </label>
                <button
                  className="task-modal-icon-btn"
                  onClick={() => setIsFilterModalOpen(false)}
                  style={{ marginTop: '8px', width: '100%' }}
                >
                  Закрыть
                </button>
              </div>
            )}
            <div className="activity-feed">
              {filteredComments.map((comment) => (
                <div key={comment.commentId || comment.createdAt} className="activity-item">
                  <div className="activity-item-content">
                    <div className="activity-item-header">
                      <span className="activity-item-author">{getUserNameById(comment.memberId)}</span>
                      <span>{formatDateTime(comment.createdAt)}</span>
                    </div>
                    <p>{comment.commentText}</p>
                  </div>
                </div>
              ))}
              {filteredComments.length === 0 && <div className="activity-item--empty">Активности пока нет.</div>}
            </div>
            {hasPermission(userRole, 'Comment') && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;