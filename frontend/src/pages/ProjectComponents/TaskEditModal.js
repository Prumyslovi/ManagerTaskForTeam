import React, { useState, useEffect } from "react";
import { fetchProfile } from "../../services/api"; // Импортируем fetchProfile для получения имени участника
import "../styles/Modal.css"; // Подключаем стили для модального окна

const TaskEditModal = ({ task, onClose, projectId, onSave }) => {
    console.log("Рендеринг TaskEditModal с задачей:", task); // Отладочный лог
    const [taskData, setTaskData] = useState({
        taskId: task.taskId,
        taskName: task.taskName,
        description: task.description,
        projectId: task.projectId,
        memberId: task.memberId,
        status: task.status,
        startDate: task.startDate,
        endDate: task.endDate,
        progress: task.progress, // В процентах для UI
        isDeleted: task.isDeleted
    });
    const [assigneeName, setAssigneeName] = useState("");

    useEffect(() => {
        if (task.memberId) {
            fetchProfile(task.memberId)
                .then(profile => {
                    setAssigneeName(`${profile.firstName} ${profile.lastName}`);
                })
                .catch(err => console.error("Ошибка загрузки профиля:", err));
        }
    }, [task.memberId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSave = () => {
        onSave(taskData); // Отправляем обновленные данные в БД через onSave
    };

    return (
        <div className="modalRegForm" onClick={(e) => e.target.className === "modalRegForm" && onClose()}>
            <div className="modalContent">
                <button className="exitButton" onClick={onClose}>×</button>
                <h3 style={{ color: "#1D334A", fontSize: 18, fontWeight: "bold", marginBottom: "16px" }}>
                    Редактирование задачи
                </h3>
                <div>
                    <label>Название:</label>
                    <input
                        className="modalInput"
                        type="text"
                        name="taskName"
                        value={taskData.taskName}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Описание:</label>
                    <textarea
                        className="modalInput"
                        name="description"
                        value={taskData.description}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Проект:</label>
                    <input
                        className="modalInput"
                        type="text"
                        name="projectId"
                        value={taskData.projectId}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Участник:</label>
                    <input
                        className="modalInput"
                        type="text"
                        name="memberId"
                        value={taskData.memberId}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Статус:</label>
                    <input
                        className="modalInput"
                        type="text"
                        name="status"
                        value={taskData.status}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Дата начала:</label>
                    <input
                        className="modalInput"
                        type="datetime-local"
                        name="startDate"
                        value={taskData.startDate}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Дата окончания:</label>
                    <input
                        className="modalInput"
                        type="datetime-local"
                        name="endDate"
                        value={taskData.endDate}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Прогресс %:</label>
                    <input
                        className="modalInput"
                        type="number"
                        name="progress"
                        value={taskData.progress}
                        min="0"
                        max="100"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Удалена:</label>
                    <input
                        type="checkbox"
                        checked={taskData.isDeleted}
                        onChange={(e) => handleChange({ target: { name: "isDeleted", value: e.target.checked }} )}
                        className="modalInput"
                        style={{ width: "auto", height: "auto" }}
                    />
                </div>
                <div className="button-wrapper">
                    <button className="modalButtonReg" onClick={handleSave}>Сохранить</button>
                    <button className="modalButtonClear" onClick={onClose}>Отмена</button>
                </div>
                <p>Ответственный: {assigneeName || "Не назначен"}</p>
            </div>
        </div>
    );
};

export default TaskEditModal;