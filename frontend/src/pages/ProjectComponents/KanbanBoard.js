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
    switch (priority?.toLowerCase()) {
        case 'низкий':
        case 'low':
            return { backgroundColor: '#4CAF50', color: '#000000' };
        case 'средний':
        case 'medium':
            return { backgroundColor: '#2196F3', color: '#FFFFFF' };
        case 'высокий':
        case 'high':
            return { backgroundColor: '#FF9800', color: '#000000' };
        case 'срочный':
        case 'urgent':
            return { backgroundColor: '#FF5722', color: '#FFFFFF' };
        case 'критический':
        case 'critical':
            return { backgroundColor: '#D32F2F', color: '#FFFFFF' };
        default:
            return { backgroundColor: '#1D334A', color: '#FFFFFF' };
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
                taskName: newTask.title,
                description: newTask.description,
                projectId: projectId,
                memberId: null,
                status: 'В планах',
                endDate: newTask.deadline,
                startDate: new Date().toISOString(),
                isDeleted: false,
                assignedBy: localStorage.getItem('userId'),
                priority: newTask.priority || 'Низкий'
            };

            const createdTask = await createTask(taskData);
            const newTaskWithId = {
                ...newTask,
                id: createdTask.taskId,
                startDate: taskData.startDate,
                assignedBy: taskData.assignedBy,
                priority: taskData.priority
            };

            setBoardData((prevData) => {
                const updatedLane = { ...prevData.lanes['lane-planned'] };
                updatedLane.cards = [...updatedLane.cards, newTaskWithId];
                return {
                    ...prevData,
                    lanes: { ...prevData.lanes, [updatedLane.id]: updatedLane },
                };
            });
            closeAddModal();
        } catch (error) {
            console.error('Ошибка добавления задачи:', error);
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
                taskId: draggedCard.id,
                taskName: draggedCard.title,
                description: draggedCard.description,
                projectId: projectId,
                memberId: draggedCard.memberId,
                status: draggedCard.status,
                startDate: draggedCard.startDate || new Date().toISOString(),
                endDate: draggedCard.endDate,
                isDeleted: false,
                assignedBy: draggedCard.assignedBy,
                priority: draggedCard.priority
            });
        } catch (error) {
            console.error(`Ошибка обновления задачи ${draggedCard.id}:`, error);
        }
    };

    useEffect(() => {
        const loadTasksAndStatuses = async () => {
            try {
                const fetchedStatuses = await fetchStatusesByTeamId(teamId);
                const lanes = fetchedStatuses.reduce((acc, status) => {
                    acc[status.name] = { id: `lane-${status.statusId}`, title: status.name, cards: [] };
                    return acc;
                }, {});

                const fetchedTasks = await fetchTasksForProject(projectId);
                fetchedTasks.forEach((task) => {
                    if (lanes[task.status]) {
                        lanes[task.status].cards.push({
                            id: task.taskId,
                            title: task.taskName,
                            description: task.description,
                            startDate: task.startDate,
                            endDate: task.endDate,
                            assignee: task.memberId,
                            status: task.status,
                            assignedBy: task.assignedBy,
                            priority: task.priority || 'Низкий'
                        });
                    }
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
            }
        };
        loadTasksAndStatuses();
    }, [projectId, teamId]);

    const applyFilters = (cards) => {
        return cards.filter(card =>
            (!filterAssignee || getUserNameById(card.assignee) === filterAssignee) &&
            (!filterDate || formatDateTime(card.endDate) === filterDate) &&
            (!filterPriority || card.priority === filterPriority) &&
            (!filterStatus || card.status === filterStatus)
        );
    };

    const lanes = boardData?.lanes ? Object.values(boardData.lanes).map(lane => ({
        ...lane,
        cards: applyFilters(lane.cards)
    })) : [];

    return (
        <div>
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
                        {[...new Set(Object.values(boardData.lanes).flatMap(lane => lane.cards.map(card => formatDateTime(card.endDate))))].map(date => (
                            <option key={date} value={date}>{date}</option>
                        ))}
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
                                                    {card.priority && (
                                                        <span
                                                            className="priority-tag"
                                                            style={getPriorityStyle(card.priority)}
                                                        >
                                                            {card.priority}
                                                        </span>
                                                    )}
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
                <TaskModal task={selectedCard} teamId={teamId} onClose={closeEditModal} projectId={projectId} />
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