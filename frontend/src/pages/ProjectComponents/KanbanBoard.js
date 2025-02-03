import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchTasks } from '../../services/api';
import * as XLSX from 'xlsx';
import './ProjectList.css';

// const KanbanBoard = ({ projectId, onDragEnd, setData }) => {
const KanbanBoard = ({ projectId, setData }) => {
    const [newCardData, setNewCardData] = useState({
        title: '',
        description: '',
        deadline: '',
        assignee: ''
    });
    const [currentLaneId, setCurrentLaneId] = useState(null);
    const [editingCardId, setEditingCardId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [boardData, setBoardData] = useState({ lanes: {} });  // Локальный стейт для данных доски

    const options = [
        { value: '', label: 'Выберите ответственного' },
        { value: 'Андрей', label: 'Андрей' },
        { value: 'Кирилл', label: 'Кирилл' },
        { value: 'Игорь', label: 'Игорь' }
    ];

    const defaultLanes = [
        { title: 'В процессе', id: 'lane-in-progress', cards: [] },
        { title: 'Выполнено', id: 'lane-completed', cards: [] },
        { title: 'Провалено', id: 'lane-failed', cards: [] },
        { title: 'В планах', id: 'lane-planned', cards: [] }
    ];

    const onDragEnd = (result) => {
        const { destination, source } = result;
    
        // Если нет места назначения, то ничего не делаем
        if (!destination) return;
    
        // Если перетащили на тот же элемент, то ничего не меняем
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }
    
        // Проверяем идентификаторы, которые приходят
        console.log("Source droppableId:", source.droppableId);
        console.log("Destination droppableId:", destination.droppableId);
    
        // Получаем исходный и целевой лейны
        const sourceLane = boardData.lanes[source.droppableId];  // Используем droppableId как ключ
        const destinationLane = boardData.lanes[destination.droppableId];  // Используем droppableId как ключ
    
        // Логирование для отладки
        console.log("Source Lane:", sourceLane);
        console.log("Destination Lane:", destinationLane);
    
        // Если лейны не найдены, выводим ошибку
        if (!sourceLane || !destinationLane) {
            console.error("Source or destination lane not found!");
            return;
        }
    
        // Извлекаем карточку, которую перетаскиваем
        const [draggedCard] = sourceLane.cards.splice(source.index, 1);  // Извлекаем перетаскиваемую карточку
    
        // Добавляем карточку в новый лейн
        destinationLane.cards.splice(destination.index, 0, draggedCard);
    
        // Логирование, чтобы увидеть изменения
        console.log("Dragged card:", draggedCard);
        console.log("Updated source lane:", sourceLane);
        console.log("Updated destination lane:", destinationLane);
    
        // Обновляем данные лейнов
        const updatedLanes = {
            ...boardData.lanes,
            [sourceLane.id]: sourceLane,  // Обновляем исходный лейн
            [destinationLane.id]: destinationLane,  // Обновляем целевой лейн
        };
    
        // Обновляем состояние
        setBoardData({ lanes: updatedLanes });
    };    

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
                        deadline: task.deadLine,
                        assignee: task.memberId
                    });
                    return acc;
                }, {});

                defaultLanes.forEach((defaultLane) => {
                    if (!lanes[defaultLane.title]) {
                        lanes[defaultLane.title] = defaultLane;
                    }
                });

                setBoardData({ lanes });  // Обновляем локальный стейт данными
            } catch (error) {
                console.error('Ошибка при загрузке задач:', error);
            }
        };

        loadTasks();
    }, [projectId]);

    const handleNewCardChange = (field, value) => {
        setNewCardData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddCard = () => {
        if (
            newCardData.title.trim() &&
            newCardData.description.trim() &&
            newCardData.deadline &&
            newCardData.assignee
        ) {
            const newCard = {
                id: editingCardId || `Card${Date.now()}`,
                title: newCardData.title,
                description: newCardData.description,
                createdDate: new Date().toISOString(),
                deadline: newCardData.deadline,
                assignee: newCardData.assignee
            };

            const updatedLanes = {
                ...boardData.lanes,  // Используем boardData вместо data
                [currentLaneId]: {
                    ...boardData.lanes[currentLaneId],
                    cards: editingCardId
                        ? boardData.lanes[currentLaneId].cards.map((card) => (card.id === editingCardId ? newCard : card))
                        : [...boardData.lanes[currentLaneId].cards, newCard]
                }
            };

            setData((prev) => ({
                ...prev,
                lanes: updatedLanes
            }));

            setNewCardData({ title: '', description: '', deadline: '', assignee: '' });
            setEditingCardId(null);
            setIsModalOpen(false);
        }
    };

    const handleCardDoubleClick = (card) => {
        setNewCardData({
            title: card.title,
            description: card.description,
            deadline: card.deadline,
            assignee: card.assignee
        });
        setEditingCardId(card.id);
        setCurrentLaneId(card.laneId);
    };

    const handleExportToExcel = () => {
        const worksheetData = [];
        worksheetData.push(['Статус', 'Название задачи', 'Описание', 'Срок выполнения', 'Ответственный']);

        Object.values(boardData.lanes).forEach((lane) => {  // Используем boardData вместо data
            lane.cards.forEach((card) => {
                worksheetData.push([
                    lane.title,
                    card.title,
                    card.description,
                    card.deadline,
                    card.assignee
                ]);
            });
        });

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'KanbanBoard');
        XLSX.writeFile(wb, 'kanban-board.xlsx');
    };

    const handleImportFromExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryString = event.target.result;
            const wb = XLSX.read(binaryString, { type: 'binary' });

            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const lanes = {};
            data.forEach((row, index) => {
                if (index === 0) return;

                const [status, taskTitle, description, deadline, assignee] = row;

                if (!lanes[status]) {
                    lanes[status] = {
                        id: `lane-${status}`,
                        title: status,
                        cards: []
                    };
                }

                lanes[status].cards.push({
                    id: `Card${Date.now()}`,
                    title: taskTitle,
                    description,
                    deadline,
                    assignee
                });
            });

            setData((prev) => ({
                ...prev,
                lanes
            }));
        };
        reader.readAsBinaryString(file);
    };

    const lanes = boardData?.lanes ? Object.values(boardData.lanes) : [];  // Используем boardData вместо data

    return (
        <div>
            <button className="add-task-button" onClick={() => document.getElementById('import-file-input').click()}>
                Импорт
            </button>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportFromExcel}
                style={{ display: 'none' }}
                id="import-file-input"
            />
            <button className="add-task-button" onClick={handleExportToExcel}>
                Экспорт
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
                                    <button
                                        className="add-task-button"
                                        onClick={() => {
                                            setCurrentLaneId(lane.id);
                                            setNewCardData({ title: '', description: '', deadline: '', assignee: '' });
                                            setEditingCardId(null);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        +
                                    </button>
                                    {lane.cards.map((card, index) => (
                                        <Draggable key={card.id} draggableId={card.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    className="card"
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onDoubleClick={() => handleCardDoubleClick(card)}
                                                >
                                                    {editingCardId === card.id ? (
                                                        <div className="task-form active">
                                                            <div className="editing-card">
                                                                <div style={{ marginTop: '30px' }}>
                                                                    <input
                                                                        className="inputEdit"
                                                                        type="text"
                                                                        value={newCardData.title}
                                                                        onChange={(e) => handleNewCardChange('title', e.target.value)}
                                                                    />
                                                                </div>

                                                                <textarea
                                                                    className="textareaEdit"
                                                                    value={newCardData.description}
                                                                    onChange={(e) => handleNewCardChange('description', e.target.value)}
                                                                />
                                                                <input
                                                                    className="inputEdit"
                                                                    type="date"
                                                                    value={newCardData.deadline}
                                                                    onChange={(e) => handleNewCardChange('deadline', e.target.value)}
                                                                />
                                                                <select
                                                                    className="select"
                                                                    value={newCardData.assignee}
                                                                    onChange={(e) => handleNewCardChange('assignee', e.target.value)}
                                                                >
                                                                    {options.map((option) => (
                                                                        <option key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                                                    <button className="button" onClick={handleAddCard}>
                                                                        Сохранить изменения
                                                                    </button>
                                                                </div>
                                                                <button className="exitButton" onClick={() => setEditingCardId(null)}>
                                                                    x
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <h4>{card.title}</h4>
                                                            <h5>{card.description}</h5>
                                                            <h5>Дедлайн: {card.deadline}</h5>
                                                            <h5>Ответственный: {card.assignee}</h5>
                                                        </div>
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
            {isModalOpen && (
                <div className="modalRegForm">
                    <div className="modalContent">
                        <h2>Добавить задачу</h2>
                        <input
                            className="input"
                            type="text"
                            placeholder="Название задачи"
                            value={newCardData.title}
                            onChange={(e) => handleNewCardChange('title', e.target.value)}
                            style={{ marginTop: '10px' }}
                        />
                        <textarea
                            className="textarea"
                            placeholder="Описание задачи"
                            value={newCardData.description}
                            onChange={(e) => handleNewCardChange('description', e.target.value)}
                        />
                        <input
                            className="input"
                            type="date"
                            placeholder="Дедлайн"
                            value={newCardData.deadline}
                            onChange={(e) => handleNewCardChange('deadline', e.target.value)}
                        />
                        <select
                            className="select"
                            value={newCardData.assignee}
                            onChange={(e) => handleNewCardChange('assignee', e.target.value)}
                        >
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                            <button className="button" onClick={handleAddCard}>
                                Сохранить изменения
                            </button>
                        </div>
                        <button className="exitButton" onClick={() => setIsModalOpen(false)}>
                            x
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;
