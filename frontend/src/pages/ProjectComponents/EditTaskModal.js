import React, { useState, useEffect } from 'react';
import { updateTask, fetchProfile } from '../../services/api';
import '../styles/Modal.css';

const EditTaskModal = ({ card, onClose, projectId }) => {
    const [taskData, setTaskData] = useState({
        title: card.title,
        description: card.description,
        endDate: card.endDate,
        assignee: card.assignee
    });
    const [assigneeName, setAssigneeName] = useState('');

    useEffect(() => {
        if (card.assignee) {
            fetchProfile(card.assignee).then(profile => {
                setAssigneeName(`${profile.firstName} ${profile.lastName}`);
            }).catch(err => console.error('Ошибка загрузки профиля:', err));
        }
    }, [card.assignee]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await updateTask(card.id, {
                taskId: card.id,
                taskName: taskData.title,
                description: taskData.description,
                projectId: projectId,
                memberId: card.assignee,
                status: card.status,
                startDate: card.startDate || new Date().toISOString().slice(0, 16),
                endDate: taskData.endDate,
                isDeleted: false
            });
            onClose();
        } catch (error) {
            console.error('Ошибка обновления задачи:', error);
        }
    };

    return (
        <div className="modalRegForm">
            <div className="modalContent">
                <button className="exitButton" onClick={onClose}>&times;</button>
                <h3>Редактирование задачи</h3>
                <input
                    className="modalInput"
                    type="text"
                    name="title"
                    value={taskData.title}
                    onChange={handleChange}
                />
                <textarea
                    className="modalInput"
                    name="description"
                    value={taskData.description}
                    onChange={handleChange}
                />
                <input
                    className="modalInput"
                    type="datetime-local"
                    name="endDate"
                    value={taskData.endDate}
                    onChange={handleChange}
                />
                <p>Ответственный: {assigneeName || 'Не назначен'}</p>
                <div className="button-wrapper">
                    <button className="modalButtonReg" onClick={handleSave}>Сохранить</button>
                    <button className="modalButtonClear" onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    );
};

export default EditTaskModal;