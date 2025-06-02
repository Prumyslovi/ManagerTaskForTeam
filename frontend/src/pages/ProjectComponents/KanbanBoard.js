import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchTasksForProject, updateTask, createTask, fetchStatusesByTeamId, createStatus } from '../../services/taskApi';
import { fetchProfile } from '../../services/memberApi';
import '../styles/Kanban.css';
import AddTaskModal from './AddTaskModal';
import TaskModal from './TaskEditModal';
import ImportExport from './ImportExport';
import { FaFilter } from 'react-icons/fa';

const getPriorityStyle = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
        case 'низкий':
        case 'low':
            return {
                backgroundColor: 'var(--priority-low-bg)',
                color: 'var(--priority-low-color)'
            };
        case 'средний':
        case 'medium':
            return {
                backgroundColor: 'var(--priority-medium-bg)',
                color: 'var(--priority-medium-color)'
            };
        case 'высокий':
        case 'high':
            return {
                backgroundColor: 'var(--priority-high-bg)',
                color: 'var(--priority-high-color)'
            };
        case 'срочный':
        case 'urgent':
            return {
                backgroundColor: 'var(--priority-urgent-bg)',
                color: 'var(--priority-urgent-color)'
            };
        case 'критический':
        case 'critical':
            return {
                backgroundColor: 'var(--priority-critical-bg)',
                color: 'var(--priority-critical-color)'
            };
        default:
            return {
                backgroundColor: 'var(--status-default-bg)',
                color: 'var(--status-default-color)'
            };
    }
};

const KanbanBoard = ({ projectId, setData, teamId }) => {
    const [boardData, setBoardData] = useState({ lanes: {} });
    const [userProfiles, setUserProfiles] = useState({});
    const [selectedCard, setSelectedCard] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [filterAssignee, setFilterAssignee] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [error, setError] = useState(null);

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);
    const openEditModal = (card) => {
        setSelectedCard(card);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => setIsEditModalOpen(false);
    const openAddColumnModal = () => setIsAddColumnModalOpen(true);
    const closeAddColumnModal = () => setIsAddColumnModalOpen(false);

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Дата не указана';
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserNameById = (memberId) => {
        const user = userProfiles[memberId];
        return user ? `${user.firstName} ${user.lastName}` : 'Неизвестный пользователь';
    };

    const truncateDescription = (description) => {
        if (!description) return '';
        const firstLine = description.split('\n')[0];
        return firstLine.length > 50 ? firstLine.substring(0, 50) : firstLine;
    };

    const handleAddTask = async (newTask) => {
        try {
            const taskData = {
                TaskName: newTask.title,
                Description: newTask.description,
                ProjectId: projectId,
                MemberId: null,
                Status: 'В планах',
                EndDate: newTask.deadline,
                StartDate: new Date().toISOString(),
                IsDeleted: false,
                Priority: newTask.priority || 'Низкий'
            };
            const createdTask = await createTask(taskData);
            const newTaskWithId = {
                ...newTask,
                id: createdTask.taskId,
                startDate: taskData.StartDate,
                priority: taskData.Priority,
                assignee: taskData.MemberId,
                status: taskData.Status
            };
            setBoardData((prevData) => {
                const updatedLane = { ...prevData.lanes['lane-planned'], cards: [...(prevData.lanes['lane-planned']?.cards || []), newTaskWithId] };
                return {
                    ...prevData,
                    lanes: { ...prevData.lanes, [updatedLane.id]: updatedLane },
                };
            });
            closeAddModal();
        } catch (error) {
            console.error('Ошибка добавления задачи:', error);
            setError('Не удалось добавить задачу. Попробуйте снова.');
        }
    };

    const handleAddColumn = async () => {
        if (!newColumnName.trim()) return;
        try {
            const newStatus = await createStatus({ teamId, name: newColumnName });
            const newLane = { title: newStatus.name, id: `lane-${newStatus.statusId}`, cards: [] };
            setBoardData((prevData) => ({
                lanes: { ...prevData.lanes, [newLane.id]: newLane },
            }));
            setNewColumnName('');
            closeAddColumnModal();
        } catch (error) {
            console.error('Ошибка добавления статуса:', error);
            setError('Не удалось добавить статус. Попробуйте снова.');
        }
    };

    const onDragEnd = async (result) => {
        const { destination, source } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
        const sourceLane = boardData.lanes[source.droppableId];
        const destinationLane = boardData.lanes[destination.droppableId];
        if (!sourceLane || !destinationLane) return;
        const [draggedCard] = sourceLane.cards.splice(source.index, 1);
        destinationLane.cards.splice(destination.index, 0, draggedCard);
        setBoardData({
            lanes: {
                ...boardData.lanes,
                [sourceLane.id]: sourceLane,
                [destinationLane.id]: destinationLane,
            },
        });
        draggedCard.status = destinationLane.title;
        try {
            await updateTask(draggedCard.id, {
                TaskId: draggedCard.id,
                TaskName: draggedCard.title,
                Description: draggedCard.description,
                ProjectId: projectId,
                MemberId: draggedCard.assignee || null,
                Status: draggedCard.status,
                StartDate: draggedCard.startDate || new Date().toISOString(),
                EndDate: draggedCard.endDate,
                Priority: draggedCard.priority || 'Низкий',
                IsDeleted: false
            });
        } catch (error) {
            console.error(`Ошибка обновления задачи ${draggedCard.id}:`, error);
            setError('Не удалось обновить задачу. Попробуйте снова.');
        }
    };

    useEffect(() => {
        const loadTasksAndStatuses = async () => {
            try {
                setError(null);
                const fetchedStatuses = await fetchStatusesByTeamId(teamId);
                const lanes = fetchedStatuses.reduce((acc, status) => {
                    acc[`lane-${status.statusId}`] = { id: `lane-${status.statusId}`, title: status.name, cards: [] };
                    return acc;
                }, {});
                const fetchedTasks = await fetchTasksForProject(projectId);
                fetchedTasks.forEach((task) => {
                    const laneId = Object.keys(lanes).find(key => lanes[key].title === task.status) || 'lane-planned';
                    if (!lanes[laneId]) {
                        lanes[laneId] = { id: laneId, title: task.status, cards: [] };
                    }
                    lanes[laneId].cards.push({
                        id: task.taskId,
                        title: task.taskName,
                        description: task.description,
                        startDate: task.startDate,
                        endDate: task.endDate,
                        assignee: task.memberId,
                        status: task.status,
                        priority: task.priority || 'Низкий'
                    });
                });
                setBoardData({ lanes });
                const uniqueMemberIds = [...new Set(fetchedTasks.map(task => task.memberId).filter(Boolean))];
                const profiles = {};
                for (const memberId of uniqueMemberIds) {
                    try {
                        const profile = await fetchProfile(memberId);
                        profiles[memberId] = profile;
                    } catch (error) {
                        console.error(`Ошибка загрузки профиля ${memberId}:`, error);
                    }
                }
                setUserProfiles(profiles);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                setError('Не удалось загрузить задачи или статусы. Проверьте соединение с сервером.');
            }
        };
        loadTasksAndStatuses();
    }, [projectId, teamId]);

    const refreshTasks = () => {
        const loadTasksAndStatuses = async () => {
            try {
                setError(null);
                const fetchedStatuses = await fetchStatusesByTeamId(teamId);
                const lanes = fetchedStatuses.reduce((acc, status) => {
                    acc[`lane-${status.statusId}`] = { id: `lane-${status.statusId}`, title: status.name, cards: [] };
                    return acc;
                }, {});
                const fetchedTasks = await fetchTasksForProject(projectId);
                fetchedTasks.forEach((task) => {
                    const laneId = Object.keys(lanes).find(key => lanes[key].title === task.status) || 'lane-planned';
                    if (!lanes[laneId]) {
                        lanes[laneId] = { id: laneId, title: task.status, cards: [] };
                    }
                    lanes[laneId].cards.push({
                        id: task.taskId,
                        title: task.taskName,
                        description: task.description,
                        startDate: task.startDate,
                        endDate: task.endDate,
                        assignee: task.memberId,
                        status: task.status,
                        priority: task.priority || 'Низкий'
                    });
                });
                setBoardData({ lanes });
            } catch (error) {
                console.error('Ошибка обновления задач:', error);
                setError('Не удалось обновить задачи. Попробуйте снова.');
            }
        };
        loadTasksAndStatuses();
    };

    const applyFilters = (cards) => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
        const startOfDayAfterTomorrow = new Date(startOfTomorrow);
        startOfDayAfterTomorrow.setDate(startOfDayAfterTomorrow.getDate() + 1);
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const endOfYesterday = new Date(startOfToday);
        const endOfNextFive = new Date(startOfToday);
        endOfNextFive.setDate(endOfNextFive.getDate() + 5);

        return cards.filter(card => {
            const endDateObj = card.endDate ? new Date(card.endDate) : null;
            let dateMatch = true;
            if (filterDate === 'yesterday') {
                dateMatch = endDateObj && endDateObj >= startOfYesterday && endDateObj < endOfYesterday;
            } else if (filterDate === 'today') {
                dateMatch = endDateObj && endDateObj >= startOfToday && endDateObj < startOfTomorrow;
            } else if (filterDate === 'tomorrow') {
                dateMatch = endDateObj && endDateObj >= startOfTomorrow && endDateObj < startOfDayAfterTomorrow;
            } else if (filterDate === 'next5') {
                dateMatch = endDateObj && endDateObj >= startOfToday && endDateObj <= endOfNextFive;
            }
            const assigneeMatch = !filterAssignee || getUserNameById(card.assignee) === filterAssignee;
            const priorityMatch = !filterPriority || card.priority === filterPriority;
            const statusMatch = !filterStatus || card.status === filterStatus;
            return dateMatch && assigneeMatch && priorityMatch && statusMatch;
        });
    };

    const lanes = boardData?.lanes ? Object.values(boardData.lanes).map(lane => ({
        ...lane,
        cards: applyFilters(lane.cards || [])
    })) : [];

    return (
        <div>
            {error && <div className="error-message">{error}</div>}
            <div className="kanban-actions">
                <ImportExport data={boardData} setData={setBoardData} projectId={projectId} type="kanban" className="import-export-button" />
                <button className="add-task-button" onClick={openAddModal}>Добавить задачу</button>
                <button className="add-column-button" onClick={openAddColumnModal}>Добавить статус</button>
                <button className="filter-button" onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}>
                    <FaFilter />
                </button>
            </div>
            {isFilterModalOpen && (
                <div className="filter-modal">
                    <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
                        <option value="">Все ответственные</option>
                        {Object.values(userProfiles).map(profile => (
                            <option key={profile.memberId} value={`${profile.firstName} ${profile.lastName}`}>
                                {`${profile.firstName} ${profile.lastName}`}
                            </option>
                        ))}
                    </select>
                    <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
                        <option value="">Все даты</option>
                        <option value="yesterday">Вчера</option>
                        <option value="today">Сегодня</option>
                        <option value="tomorrow">Завтра</option>
                        <option value="next5">5 дней</option>
                    </select>
                    <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                        <option value="">Все приоритеты</option>
                        {['Низкий', 'Средний', 'Высокий', 'Срочный', 'Критический'].map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">Все статусы</option>
                        {Object.values(boardData.lanes).map(lane => (
                            <option key={lane.id} value={lane.title}>{lane.title}</option>
                        ))}
                    </select>
                </div>
            )}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-board">
                    {lanes.map((lane) => (
                        <Droppable key={lane.id} droppableId={lane.id}>
                            {(provided) => (
                                <div className="lane" ref={provided.innerRef} {...provided.droppableProps}>
                                    <h3>{lane.title}</h3>
                                    {lane.cards.map((card, index) => (
                                        <Draggable key={card.id} draggableId={card.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    className="card"
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={() => openEditModal(card)}
                                                >
                                                    <div className="card-header">
                                                        <h4>{card.title}</h4>
                                                    </div>
                                                    {card.description && <p>{truncateDescription(card.description)}</p>}
                                                    <p>Дедлайн: {formatDateTime(card.endDate)}</p>
                                                    <p>Ответственный: {getUserNameById(card.assignee)}</p>
                                                    <span
                                                        className="priority-tag"
                                                        style={getPriorityStyle(card.priority)}
                                                    >
                                                        {card.priority}
                                                    </span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
            {isAddModalOpen && (
                <AddTaskModal
                    visible={isAddModalOpen}
                    onVisibilityChange={setIsAddModalOpen}
                    onTaskAdd={handleAddTask}
                    teamId={teamId}
                    projectId={projectId}
                />
            )}
            {isEditModalOpen && selectedCard && (
                <TaskModal
                    task={selectedCard}
                    teamId={teamId}
                    onClose={closeEditModal}
                    projectId={projectId}
                    onTasksRefresh={refreshTasks}
                />
            )}
            {isAddColumnModalOpen && (
                <div className="modalRegForm">
                    <div className="modalContent">
                        <button className="exitButton" onClick={closeAddColumnModal}>×</button>
                        <h2>Добавить новый статус</h2>
                        <input
                            type="text"
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                            placeholder="Название статуса"
                            className="modalInput"
                        />
                        <button className="modalButtonReg" onClick={handleAddColumn}>Создать</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;
