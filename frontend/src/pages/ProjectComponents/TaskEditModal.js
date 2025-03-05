import React, { useState, useEffect } from "react";
import { fetchProfile, fetchTeamMembers, updateTask } from "../../services/api";
import "../styles/Modal.css";

const TaskModal = ({ task, onClose, projectId, teamId, onSave }) => {
    const formatDateForInput = (isoDate) => {
        if (!isoDate) return "";
        const date = new Date(isoDate);
        return date.toISOString().slice(0, 16);
    };

    const [taskData, setTaskData] = useState({
        taskId: task.taskId || task.id,
        name: task.taskName || task.title || "Без названия",
        description: task.description || "",
        assigneeId: task.memberId || task.assignee || "",
        status: task.status || "",
        startDate: formatDateForInput(task.startDate || task.start || new Date()),
        endDate: formatDateForInput(task.endDate || task.end || new Date()),
        progress: task.progress !== undefined ? task.progress * 100 : 0,
        isDeleted: task.isDeleted || false,
    });
    const [teamMembers, setTeamMembers] = useState([]);
    const [assigneeName, setAssigneeName] = useState("");
    const [isMemberSelectClicked, setIsMemberSelectClicked] = useState(false);

    useEffect(() => {
        if (teamId) {
            loadTeamMembers(teamId);
        }
    }, [teamId]);

    useEffect(() => {
        if (taskData.assigneeId) {
            fetchProfile(taskData.assigneeId)
                .then(profile => {
                    setAssigneeName(`${profile.firstName} ${profile.lastName}`);
                })
                .catch(err => console.error("Ошибка загрузки профиля:", err));
        } else {
            setAssigneeName("");
        }
    }, [taskData.assigneeId]);

    const loadTeamMembers = async (teamId) => {
        try {
            const members = await fetchTeamMembers(teamId);
            setTeamMembers(members);
        } catch (error) {
            console.error("Ошибка загрузки участников команды:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData(prevState => ({
            ...prevState,
            [name]: name === "isDeleted" ? e.target.checked : value,
        }));
    };

    const handleSave = async () => {
        const updatedTaskData = {
            taskId: taskData.taskId,
            taskName: taskData.name,
            description: taskData.description,
            projectId: projectId,
            memberId: taskData.assigneeId,
            status: taskData.status || task.status,
            startDate: new Date(taskData.startDate).toISOString(),
            endDate: new Date(taskData.endDate).toISOString(),
            progress: taskData.progress / 100,
            isDeleted: taskData.isDeleted,
        };

        if (onSave) {
            onSave(updatedTaskData);
        } else {
            try {
                await updateTask(updatedTaskData.taskId, updatedTaskData);
                onClose();
            } catch (error) {
                console.error("Ошибка обновления задачи:", error);
            }
        }
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
                        name="name"
                        value={taskData.name}
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
                    <label>Ответственный:</label>
                    {teamMembers.length === 0 ? (
                        <p style={{ color: "red" }}>Ошибка загрузки участников</p>
                    ) : (
                        <select
                            className="modalInput"
                            name="assigneeId"
                            value={taskData.assigneeId}
                            onChange={handleChange}
                            onClick={() => setIsMemberSelectClicked(true)}
                        >
                            {!isMemberSelectClicked && <option value="">Выберите участника</option>}
                            {teamMembers.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.lastName} {member.firstName}
                                </option>
                            ))}
                        </select>
                    )}
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
                    <label>Удалить:</label>
                    <input
                        type="checkbox"
                        checked={taskData.isDeleted}
                        onChange={(e) => handleChange({ target: { name: "isDeleted", value: e.target.checked } })}
                        className="modalInput"
                        style={{ width: "auto", height: "auto" }}
                    />
                </div>
                <div className="button-wrapper">
                    <button className="modalButtonReg" onClick={handleSave}>Сохранить</button>
                    <button className="modalButtonClear" onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;