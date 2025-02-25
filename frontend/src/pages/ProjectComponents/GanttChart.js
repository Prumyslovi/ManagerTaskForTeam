import React, { useEffect, useState, useRef } from "react";
import { fetchTasks, updateTask } from "../../services/api"; // Импортируем updateTask для отправки в БД
import { Gantt, Willow } from "wx-react-gantt"; // Импортируем компонент Gantt
import "wx-react-gantt/dist/gantt.css"; // Подключаем стили библиотеки
import "../styles/GanttChart.css"; // Подключаем кастомные стили
import TaskEditModal from "./TaskEditModal"; // Импортируем модальное окно редактирования

const russianDateFormat = (date, type) => {
    const options = type === "month"
        ? { month: "long", year: "numeric", locale: "ru" }
        : { day: "numeric", weekday: "long", locale: "ru" };
    return new Intl.DateTimeFormat("ru-RU", options).format(date);
};

const columns = [
    { id: "text", header: "Задача", flexGrow: 2, align: "center" },
    { id: "start", header: "Начало", flexGrow: 1, align: "center" },
    { id: "duration", header: "Длительность", align: "center", flexGrow: 1 },
];

// Функция для безопасного форматирования даты в ISO
const safeToISOString = (date) => {
    if (date instanceof Date && !isNaN(date)) {
        return date.toISOString();
    }
    return new Date().toISOString(); // Значение по умолчанию, если дата некорректна
};

const GanttChart = () => {
    const [tasks, setTasks] = useState([]);
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Состояние для открытия модального окна
    const [selectedTask, setSelectedTask] = useState(null); // Состояние для выбранной задачи
    const ganttRef = useRef(null); // Ref для контейнера Gantt
    const lastClickTimeRef = useRef({}); // Для эмуляции двойного клика (по taskId)

    // Функция для открытия модального окна
    const openEditModal = (task) => {
        console.log("Открытие модального окна для задачи:", task); // Лог
        setSelectedTask({
            taskId: task.id,
            taskName: task.text || "Без названия",
            description: task.description || "",
            projectId: task.projectId || "",
            memberId: task.memberId || "",
            status: task.status || "",
            startDate: task.start ? safeToISOString(task.start) : new Date().toISOString(),
            endDate: task.end ? safeToISOString(task.end) : new Date().toISOString(),
            progress: task.progress !== undefined ? task.progress * 100 : 0, // В процентах для UI
            isDeleted: task.isDeleted || false
        });
        setIsEditModalOpen(true);
    };

    // Функция для закрытия модального окна
    const closeEditModal = () => {
        console.log("Закрытие модального окна"); // Лог
        setSelectedTask(null);
        setIsEditModalOpen(false);
    };

    // Загрузка данных
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const tasksData = await fetchTasks("BC762453-CB78-42DB-91E6-11FCBAD4C1D6");
                console.log("Данные из API:", tasksData); // Лог

                const formattedTasks = tasksData.map(task => {
                    const start = task.startDate ? new Date(task.startDate) : new Date();
                    const end = task.endDate ? new Date(task.endDate) : new Date(start.getTime() + 86400000); // По умолчанию +1 день, если endDate отсутствует
                    return {
                        id: task.taskId,
                        text: task.taskName || "Без названия",
                        start: isNaN(start.getTime()) ? new Date() : start, // Обработка некорректных дат
                        end: isNaN(end.getTime()) ? new Date(start.getTime() + 86400000) : end, // Обработка некорректных дат
                        duration: Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1,
                        progress: (task.progress ?? 0) / 100,
                        type: "task",
                        parent: task.parentId || 0,
                        lazy: false,
                        description: task.description || "",
                        projectId: task.projectId || "",
                        memberId: task.memberId || "",
                        status: task.status || "",
                        isDeleted: task.isDeleted || false
                    };
                });

                const formattedLinks = tasksData
                    .filter(task => task.dependencies)
                    .flatMap(task => 
                        (task.dependencies || "")
                            .split(",")
                            .map(dep => ({
                                id: `${task.taskId}_${dep.trim()}`,
                                source: dep.trim(),
                                target: task.taskId,
                                type: "e2e"
                            }))
                    );
                
                console.log("Форматированные задачи:", formattedTasks); // Лог
                console.log("Форматированные связи:", formattedLinks); // Лог

                if (formattedTasks.length > 0) {
                    setTasks(formattedTasks);
                    setLinks(formattedLinks);
                } else {
                    setError("Нет данных для отображения.");
                }
            } catch (error) {
                console.error("Произошла ошибка при загрузке данных:", error); // Лог
                setError("Произошла ошибка при загрузке данных: " + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Эффект для добавления кастомного обработчика двойного клика на задачи
    useEffect(() => {
        if (!ganttRef.current || !tasks.length) return;

        console.log("Проверка DOM Gantt:", ganttRef.current); // Лог для отладки

        // Используем .wx-gantt как основной контейнер задач
        const ganttContainer = ganttRef.current.querySelector(".wx-gantt");
        if (!ganttContainer) {
            console.error("Не найден контейнер .wx-gantt в DOM");
            return;
        }

        // Селектор для элементов задач: ищем .wx-row и .wx-cell, которые, вероятно, представляют задачи
        const taskElements = ganttContainer.querySelectorAll(".wx-row, .wx-cell");
        console.log("Найденные элементы задач:", taskElements); // Лог для отладки

        if (taskElements.length === 0) {
            console.error("Не найдены элементы задач в Gantt. Проверьте классы/атрибуты в DOM.");
            return;
        }

        taskElements.forEach(element => {
            // Проверяем существующие атрибуты data-row-id или data-id
            const rowId = element.getAttribute("data-row-id") || element.getAttribute("data-id");
            if (!rowId) {
                console.warn("Элемент без data-row-id или data-id:", element);
                return;
            }

            // Сопоставляем с taskId из tasks
            const taskMatch = tasks.find(t => t.id === rowId);
            if (taskMatch) {
                element.setAttribute("data-task-id", taskMatch.id); // Добавляем data-task-id для последующих кликов
            } else {
                console.warn("Задача не найдена по data-row-id/data-id:", rowId, "Список задач:", tasks);
            }

            // Эмуляция двойного клика для каждого элемента
            let lastClickTime = 0;
            element.addEventListener("click", (e) => {
                e.preventDefault();
                const currentTime = Date.now();
                const doubleClickThreshold = 300; // Интервал для двойного клика в мс

                if (currentTime - lastClickTime < doubleClickThreshold) {
                    console.log("Обнаружен двойной клик на элемент задачи:", element);
                    const taskId = element.getAttribute("data-task-id");
                    if (taskId) {
                        const fullTask = tasks.find(t => t.id === taskId);
                        if (fullTask) {
                            console.log("Найденная задача для редактирования:", fullTask);
                            openEditModal(fullTask);
                        } else {
                            console.error("Задача не найдена по ID:", taskId);
                        }
                    } else {
                        console.error("Не найден data-task-id в элементе", element);
                    }
                }
                lastClickTime = currentTime;
            });
        });

        // Очистка обработчиков при размонтировании
        return () => {
            taskElements.forEach(element => {
                element.removeEventListener("click", openEditModal);
            });
        };
    }, [tasks, ganttRef]); // Пересоздаем обработчики, если задачи или Gantt обновляются

    if (isLoading) return <div>Загрузка...</div>;
    if (error) return <div style={{ color: "red" }}>Ошибка: {error}</div>;

    return (
        <div className="gantt-container" style={{ width: "100%", height: "100%", position: "relative" }} ref={ganttRef}>
            <Willow>
                <Gantt
                    tasks={tasks}
                    links={links}
                    columns={columns}
                    scales={[
                        { unit: "month", step: 1, format: (date) => russianDateFormat(date, "month") },
                        { unit: "day", step: 1, format: (date) => russianDateFormat(date, "day") }
                    ]}
                    readonly={true} // Отключаем редактирование в самой диаграмме
                    barHeight={40}
                    trackHeight={50}
                    palette={{ default: "#1D334A", progress: "#1D334A", borderColor: "black" }}
                    gridLineColor="#000000"
                    taskLabelStyle={{ color: "#000000", fontSize: 16, fontWeight: "bold" }}
                    borderColor="#000000"
                />
            </Willow>

            {/* Модальное окно редактирования задачи */}
            {isEditModalOpen && selectedTask && (
                <TaskEditModal
                    task={selectedTask}
                    onClose={closeEditModal}
                    projectId="BC762453-CB78-42DB-91E6-11FCBAD4C1D6"
                    onSave={async (updatedTask) => {
                        try {
                            await updateTask(updatedTask.taskId, {
                                taskId: updatedTask.taskId,
                                taskName: updatedTask.taskName,
                                description: updatedTask.description,
                                projectId: updatedTask.projectId,
                                memberId: updatedTask.memberId,
                                status: updatedTask.status,
                                startDate: updatedTask.startDate,
                                endDate: updatedTask.endDate,
                                progress: updatedTask.progress / 100, // В формате 0-1 для БД
                                isDeleted: updatedTask.isDeleted
                            });
                            // Обновляем tasks локально
                            setTasks(tasks.map(t => t.id === updatedTask.taskId ? {
                                ...t,
                                text: updatedTask.taskName,
                                description: updatedTask.description,
                                projectId: updatedTask.projectId,
                                memberId: updatedTask.memberId,
                                status: updatedTask.status,
                                start: new Date(updatedTask.startDate),
                                end: new Date(updatedTask.endDate),
                                progress: updatedTask.progress / 100,
                                isDeleted: updatedTask.isDeleted
                            } : t));
                            closeEditModal();
                        } catch (error) {
                            console.error("Ошибка при сохранении задачи в БД:", error);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default GanttChart;