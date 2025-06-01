import React, { useEffect, useState, useRef, useMemo } from "react";
import { fetchTasksForProject, updateTask } from "../../services/taskApi";
import { Gantt, Willow } from "wx-react-gantt";
import "wx-react-gantt/dist/gantt.css";
import "../styles/GanttChart.css";
import "../styles/Spinner.css";
import "../styles/Message.css";
import "../styles/TypicalItems.css";
import "../styles/Filter.css";
import TaskModal from "./TaskEditModal";
import AddTaskModal from "./AddTaskModal";
import ImportExport from "./ImportExport";
import { FaFilter } from "react-icons/fa";

const russianDateFormat = (date, type) => {
    const options = type === "month"
        ? { month: "long", year: "numeric", locale: "ru" }
        : type === "monthOnly"
            ? { month: "long", locale: "ru" }
            : { day: "numeric", weekday: "short", locale: "ru" };
    return new Intl.DateTimeFormat("ru-RU", options).format(date);
};

const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toISOString().slice(0, 16);
};

const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
};

const getWorkHours = (start, end) => {
    let totalWorkHours = 0;
    const currentDate = new Date(start);
    while (currentDate <= end) {
        if (!isWeekend(currentDate)) {
            for (let hour = 9; hour <= 18; hour++) {
                const checkDate = new Date(currentDate);
                checkDate.setHours(hour, 0, 0, 0);
                if (checkDate <= end) {
                    totalWorkHours++;
                }
            }
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return totalWorkHours;
};

const GanttChart = ({ projectId, teamId, currentUserId }) => {
    const [tasks, setTasks] = useState([]);
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [scale, setScale] = useState("all");
    const [columnWidth, setColumnWidth] = useState(100);
    const [cellWidth, setCellWidth] = useState(100);
    const [scaleHeight, setScaleHeight] = useState(50);
    const [filterByUser, setFilterByUser] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [filterByDueDate, setFilterByDueDate] = useState(false);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const ganttRef = useRef(null);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const tasksData = await fetchTasksForProject(projectId);
            const formattedTasks = tasksData.map(task => {
                const start = task.startDate ? new Date(task.startDate) : new Date();
                const end = task.endDate ? new Date(task.endDate) : new Date(start.getTime() + 86400000);
                const workHours = getWorkHours(start, end);
                const durationDays = Math.ceil(workHours / 9);
                return {
                    id: task.taskId,
                    text: task.taskName || "Без названия",
                    start: isNaN(start.getTime()) ? new Date() : start,
                    end: isNaN(end.getTime()) ? new Date(start.getTime() + 86400000) : end,
                    duration: durationDays || 1,
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

            if (formattedTasks.length > 0) {
                setTasks(formattedTasks);
                setLinks(formattedLinks);
            } else {
                setError("Нет данных для отображения.");
            }
        } catch (error) {
            setError("Произошла ошибка при загрузке данных: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const openEditModal = (task) => {
        setSelectedTask({
            taskId: task.id,
            taskName: task.text || "Без названия",
            description: task.description || "",
            projectId: task.projectId || "",
            memberId: task.memberId || "",
            status: task.status || "",
            startDate: task.start ? formatDateForInput(task.start) : new Date().toISOString(),
            endDate: task.end ? formatDateForInput(task.end) : new Date().toISOString(),
            progress: task.progress !== undefined ? task.progress * 100 : 0,
            isDeleted: task.isDeleted || false
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedTask(null);
        setIsEditModalOpen(false);
        loadData();
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        loadData();
    };

    const getScalesAndRange = () => {
        const now = new Date();
        let start, end;

        switch (scale) {
            case "year":
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
                return {
                    scales: [
                        { unit: "month", step: 1, format: (date) => russianDateFormat(date, "month") },
                        { unit: "day", step: 1, format: (date) => russianDateFormat(date, "day") }
                    ],
                    start,
                    end
                };
            case "month":
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                return {
                    scales: [
                        { unit: "month", step: 1, format: (date) => russianDateFormat(date, "month") },
                        { unit: "day", step: 1, format: (date) => russianDateFormat(date, "day") }
                    ],
                    start,
                    end
                };
            case "week":
                const firstDayOfWeek = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
                start = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
                end = new Date(start);
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59);
                return {
                    scales: [
                        { unit: "week", step: 1, format: (date) => `Неделя ${Math.ceil(date.getDate() / 7)}, ${russianDateFormat(date, "month")}` },
                        { unit: "day", step: 1, format: (date) => russianDateFormat(date, "day") }
                    ],
                    start,
                    end
                };
            case "day":
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                return {
                    scales: [
                        { unit: "day", step: 1, format: (date) => russianDateFormat(date, "day") },
                        { unit: "hour", step: 1, format: (date) => date.getHours().toString().padStart(2, "0") + ":00" }
                    ],
                    start,
                    end
                };
            case "all":
            default:
                return {
                    scales: [
                        { unit: "year", step: 1, format: (date) => date.getFullYear().toString() },
                        { unit: "month", step: 1, format: (date) => russianDateFormat(date, "monthOnly") }
                    ],
                    start: null,
                    end: null
                };
        }
    };

    const filteredTasks = useMemo(() => {
        let result = [...tasks];
        const now = new Date();
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(now.getDate() + 3);

        if (filterByUser && currentUserId) {
            result = result.filter(task => task.memberId === currentUserId);
        }

        if (statusFilter !== "all") {
            result = result.filter(task => task.status === statusFilter);
        }

        if (filterByDueDate) {
            result = result.filter(task => {
                const endDate = new Date(task.end);
                return endDate >= now && endDate <= threeDaysFromNow;
            });
        }

        return result;
    }, [tasks, filterByUser, currentUserId, statusFilter, filterByDueDate]);

    const columns = useMemo(() => [
        { id: "text", header: "Задача", flexGrow: 2, width: columnWidth, align: "center" },
        { id: "start", header: "Начало", flexGrow: 1, width: columnWidth, align: "center", format: (task) => formatDateForInput(task.start) },
        {
            id: "duration",
            header: "Длительность",
            align: "center",
            flexGrow: 1,
            width: columnWidth,
            format: (task) => scale === "day" ? Math.round(task.duration * 9) : task.duration
        },
    ], [scale, columnWidth]);

    const handleScaleChange = (e) => {
        setScale(e.target.value);
    };

    const handleFilterByUserChange = (e) => {
        setFilterByUser(e.target.checked);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const handleFilterByDueDateChange = (e) => {
        setFilterByDueDate(e.target.checked);
    };

    const toggleFilterPanel = () => {
        setIsFilterPanelOpen(!isFilterPanelOpen);
    };

    const openAddTaskModal = () => {
        setIsAddModalOpen(true);
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!ganttRef.current || !tasks.length) return;

        const ganttContainer = ganttRef.current.querySelector(".wx-gantt");
        if (!ganttContainer) return;

        const taskElements = ganttContainer.querySelectorAll(".wx-row");
        if (taskElements.length === 0) return;

        taskElements.forEach(element => {
            const rowId = element.getAttribute("data-row-id") || element.getAttribute("data-id");
            if (!rowId) return;

            const taskMatch = tasks.find(t => t.id === rowId);
            if (!taskMatch) return;

            element.setAttribute("data-task-id", taskMatch.id);

            const durationCells = element.querySelectorAll('[data-col-id="duration"]');
            durationCells.forEach(cell => {
                const taskId = cell.closest(".wx-row")?.getAttribute("data-task-id");
                if (taskId) {
                    const task = tasks.find(t => t.id === taskId);
                    if (task) {
                        const durationDays = task.duration;
                        const newValue = scale === "day" ? Math.round(durationDays * 9) : task.duration;
                        cell.textContent = newValue;
                    }
                }
            });

            // Изменено: теперь открываем модалку по одинарному клику
            element.addEventListener("click", (e) => {
                e.preventDefault();
                const taskId = element.getAttribute("data-task-id");
                if (taskId) {
                    const fullTask = tasks.find(t => t.id === taskId);
                    if (fullTask) {
                        openEditModal(fullTask);
                    }
                }
            });
        });
    }, [tasks, scale]);

    if (isLoading) return <div className="spinner"></div>;
    if (error) return <div className="message restricted-content">Ошибка: {error}</div>;

    const { scales, start, end } = getScalesAndRange();

    return (
        <div>
            <ImportExport
                data={{ tasks, links }}
                setData={({ tasks: newTasks, links: newLinks }) => { setTasks(newTasks); setLinks(newLinks); }}
                projectId={projectId}
                type="gantt"
                className="import-export-button"
            />

            <button
                className="filterButton"
                onClick={toggleFilterPanel}
            >
                <FaFilter className="filterIcon" />
            </button>

            <div className="gantt-container" style={{ width: "100%", position: "relative" }} ref={ganttRef}>
                <div className="container" style={{ position: "relative" }}>
                    {/* Импорт/Экспорт теперь на уровне других элементов управления */}

                    {isFilterPanelOpen && (
                        <div className="filterPanel">
                            <label style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                                <input
                                    type="checkbox"
                                    checked={filterByUser}
                                    onChange={handleFilterByUserChange}
                                    style={{ marginRight: "5px" }}
                                />
                                Только мои задачи
                            </label>
                            <div style={{ marginBottom: "10px" }}>
                                <span>Статус:</span>
                                <select className="scaleSelect" value={statusFilter} onChange={handleStatusFilterChange} style={{ marginLeft: "5px" }}>
                                    <option value="all">Все</option>
                                    <option value="planned">В планах</option>
                                    <option value="in_progress">В процессе</option>
                                    <option value="completed">Выполнено</option>
                                    <option value="failed">Провалено</option>
                                </select>
                            </div>
                            <label style={{ display: "flex", alignItems: "center" }}>
                                <input
                                    type="checkbox"
                                    checked={filterByDueDate}
                                    onChange={handleFilterByDueDateChange}
                                    style={{ marginRight: "5px" }}
                                />
                                Ближайшие дедлайны (3 дня)
                            </label>
                        </div>
                    )}
                    <select className="scaleSelect" value={scale} onChange={handleScaleChange} style={{ margin: "0 5px" }}>
                        <option value="all">Всё время</option>
                        <option value="year">Год</option>
                        <option value="month">Месяц</option>
                        <option value="week">Неделя</option>
                        <option value="day">День</option>
                    </select>
                    <span>Ширина колонок таблицы:</span>
                    <select className="scaleSelect" value={columnWidth} onChange={(e) => setColumnWidth(Number(e.target.value))} style={{ margin: "0 5px" }}>
                        <option value={80}>80px</option>
                        <option value={100}>100px</option>
                        <option value={120}>120px</option>
                        <option value={150}>150px</option>
                    </select>
                    <span>Ширина ячеек графика:</span>
                    <select className="scaleSelect" value={cellWidth} onChange={(e) => setCellWidth(Number(e.target.value))} style={{ margin: "0 5px" }}>
                        <option value={60}>60px</option>
                        <option value={80}>80px</option>
                        <option value={100}>100px</option>
                        <option value={120}>120px</option>
                    </select>
                    <span>Высота шкалы:</span>
                    <select className="scaleSelect" value={scaleHeight} onChange={(e) => setScaleHeight(Number(e.target.value))} style={{ margin: "0 5px" }}>
                        <option value={40}>40px</option>
                        <option value={50}>50px</option>
                        <option value={60}>60px</option>
                        <option value={70}>70px</option>
                    </select>
                    <button className="editButton" onClick={openAddTaskModal}>
                        Добавить задачу
                    </button>
                </div>
                <div style={{ marginBottom: "10px" }}></div>
                <Willow>
                    <Gantt
                        tasks={filteredTasks.map(task => ({
                            ...task,
                            segments: (() => {
                                const start = new Date(task.start);
                                const end = new Date(task.end);
                                const segments = [];
                                let current = new Date(start);
                                while (current <= end) {
                                    if (!isWeekend(current)) {
                                        const startHour = new Date(current);
                                        startHour.setHours(9, 0, 0, 0);
                                        const endHour = new Date(current);
                                        endHour.setHours(18, 0, 0, 0);
                                        if (startHour >= start && endHour <= end) {
                                            segments.push({ start: startHour, end: endHour });
                                        } else if (startHour < start && endHour <= end) {
                                            segments.push({ start, end: endHour });
                                        } else if (startHour >= start && endHour > end) {
                                            segments.push({ start: startHour, end });
                                        }
                                    }
                                    current.setDate(current.getDate() + 1);
                                }
                                return segments.length > 0 ? segments : [];
                            })()
                        }))}
                        links={links}
                        columns={columns}
                        scales={scales}
                        start={start}
                        end={end}
                        readonly={true}
                        cellWidth={cellWidth}
                        scaleHeight={scaleHeight}
                        palette={{
                            default: "var(--gantt-task-fill)",
                            progress: "var(--gantt-task-fill)",
                            borderColor: "var(--border)",
                            today: scale === "day" ? "var(--accent)" : "transparent"
                        }}
                        gridLineColor="var(--border-light)"
                        taskLabelStyle={{
                            color: "var(--text-primary)",
                            fontSize: 16,
                            fontWeight: "bold"
                        }}
                        borderColor="var(--border)"
                        todayLine={{
                            color: "transparent",
                            width: 2,
                            text: ""
                        }}
                    />
                </Willow>
                {isEditModalOpen && selectedTask && (
                    <TaskModal
                        task={selectedTask}
                        teamId={teamId}
                        onClose={closeEditModal}
                        projectId={projectId}
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
                                    progress: updatedTask.progress,
                                    isDeleted: updatedTask.isDeleted
                                });
                                closeEditModal();
                            } catch (error) {
                                console.error("Ошибка обновления задачи:", error);
                            }
                        }}
                    />
                )}
                {isAddModalOpen && (
                    <AddTaskModal
                        visible={isAddModalOpen}
                        onVisibilityChange={closeAddModal}
                        onTaskAdd={(newTask) => {
                            setTasks([...tasks, newTask]);
                            closeAddModal();
                        }}
                        teamId={teamId}
                        projectId={projectId}
                    />
                )}
            </div>
        </div>
    );
};

export default GanttChart;