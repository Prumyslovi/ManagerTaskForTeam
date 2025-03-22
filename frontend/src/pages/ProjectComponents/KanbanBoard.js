import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchTasks, updateTask, fetchProfile, createTask } from '../../services/api';
import '../styles/ProjectList.css';
import '../styles/Kanban.css';
import AddTaskModal from './AddTaskModal';
import TaskModal from './TaskEditModal';
import ImportExport from './ImportExport';

const KanbanBoard = ({ projectId, setData, teamId }) => {
    const [newCardData, setNewCardData] = useState({
        title: '',
        description: '',
        endDate: '',
        assignee: ''
    });
    const [currentLaneId, setCurrentLaneId] = useState(null);
    const [editingCardId, setEditingCardId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [boardData, setBoardData] = useState({ lanes: {} });
    const [userProfiles, setUserProfiles] = useState({});
    const [selectedCard, setSelectedCard] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const openEditModal = (card) => {
        setSelectedCard(card);
        setIsEditModalOpen(true);
    };
    
    const closeEditModal = () => setIsEditModalOpen(false);

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Дата не указана';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    const getUserNameById = (memberId) => {
        const user = userProfiles[memberId];
        return user ? `${user.firstName} ${user.lastName}` : 'Неизвестный пользователь';
    };

    const defaultLanes = [
        { title: 'В процессе', id: 'lane-in-progress', cards: [] },
        { title: 'Выполнено', id: 'lane-completed', cards: [] },
        { title: 'Провалено', id: 'lane-failed', cards: [] },
        { title: 'В планах', id: 'lane-planned', cards: [] }
    ];

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
            };

            const createdTask = await createTask(taskData);
            const newTaskWithId = { 
                ...newTask, 
                id: createdTask.taskId, 
                startDate: taskData.startDate 
            };

            setBoardData((prevData) => {
                const updatedLane = { ...prevData.lanes['lane-planned'] };
                updatedLane.cards = [...updatedLane.cards, newTaskWithId];

                return {
                    ...prevData,
                    lanes: {
                        ...prevData.lanes,
                        [updatedLane.id]: updatedLane,
                    },
                };
            });
        } catch (error) {
            console.error('Ошибка добавления задачи:', error);
        }
    };

    const onDragEnd = async (result) => {
        const { destination, source } = result;

        if (!destination) return;

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const sourceLane = boardData.lanes[source.droppableId];
        const destinationLane = boardData.lanes[destination.droppableId];

        if (!sourceLane || !destinationLane) {
            console.error("Source or destination lane not found!");
            return;
        }

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
            const response = await updateTask(draggedCard.id, {
                taskId: draggedCard.id,
                taskName: draggedCard.title,
                description: draggedCard.description,
                projectId: projectId,
                memberId: draggedCard.memberId,
                status: draggedCard.status,
                startDate: draggedCard.startDate || new Date().toISOString(),
                endDate: draggedCard.endDate,
                isDeleted: false,
            });
        } catch (error) {
            console.error(`Error updating task ${draggedCard.id}:`, error);
        }
    };

    const statusOrder = ['В планах', 'В процессе', 'Выполнено', 'Провалено'];

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const fetchedTasks = await fetchTasks(projectId);
                const lanes = fetchedTasks.reduce((acc, task) => {
                    if (!acc[task.status]) {
                        acc[task.status] = {
                            id: `lane-${task.status}`,
                            title: task.status,
                            cards: []
                        };
                    }
                    acc[task.status].cards.push({
                        id: task.taskId,
                        title: task.taskName,
                        description: task.description,
                        startDate: task.startDate, // Добавляем startDate
                        endDate: task.endDate,
                        assignee: task.memberId,
                        status: task.status
                    });
                    return acc;
                }, {});

                defaultLanes.forEach((defaultLane) => {
                    if (!lanes[defaultLane.title]) {
                        lanes[defaultLane.title] = defaultLane;
                    }
                });

                const sortedLanes = statusOrder.map((status) => lanes[status]).filter(Boolean);
                const laneObject = sortedLanes.reduce((acc, lane) => {
                    acc[lane.id] = lane;
                    return acc;
                }, {});

                setBoardData({ lanes: laneObject });

                const uniqueMemberIds = [
                    ...new Set(fetchedTasks.map(task => task.memberId).filter(Boolean))
                ];
                const profiles = {};
                for (const memberId of uniqueMemberIds) {
                    try {
                        const profile = await fetchProfile(memberId);
                        profiles[memberId] = profile;
                    } catch (error) {
                        console.error(`Ошибка при загрузке профиля участника ${memberId}:`, error);
                    }
                }
                setUserProfiles(profiles);
            } catch (error) {
                console.error('Ошибка при загрузке задач:', error);
            }
        };

        loadTasks();
    }, [projectId]);

    const lanes = boardData?.lanes ? Object.values(boardData.lanes) : [];

    return (
        <div>
            <ImportExport data={boardData} setData={setBoardData} projectId={projectId} type="kanban" />
            <button className="add-task-button" onClick={openAddModal}>
                Добавить задачу
            </button>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-board">
                    {lanes.map((lane) => (
                        <Droppable key={lane.id} droppableId={lane.id}>
                            {(provided) => (
                                <div
                                    className="lane"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
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
                                                    <h4>{card.title}</h4>
                                                    <h5>{card.description}</h5>
                                                    <h5>Дедлайн: {formatDateTime(card.endDate)}</h5>
                                                    <h5>Ответственный: {getUserNameById(card.assignee)}</h5>
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
            {isAddModalOpen && <AddTaskModal
                visible={isAddModalOpen}
                onVisibilityChange={setIsAddModalOpen}
                onTaskAdd={handleAddTask}
                teamId={teamId}
                projectId={projectId}
            />}
            {isEditModalOpen && selectedCard && (
                <TaskModal
                task={selectedCard} 
                teamId={teamId}
                onClose={closeEditModal}
                projectId={projectId} />
            )}
        </div>
    );
};

export default KanbanBoard;