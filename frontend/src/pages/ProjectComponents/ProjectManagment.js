import React, { useState } from 'react';
import '../styles/ProjectManagement.css';

const ProjectManagement = () => {
    const [activeTab, setActiveTab] = useState('create'); // Переключатель вкладок
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projects, setProjects] = useState([
        { id: 1, name: 'Курсовой проект', description: 'Сделать ИС "Менеджмента задач команды"', creator: 'Андрей', team: 'Команда A' },
        { id: 2, name: 'Переход на react.js', description: 'Изучить основы фреймворка и сделать на нём проект', creator: 'Мария', team: 'Команда B' },
    ]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleCreateProject = () => {
        const newProject = {
            id: projects.length + 1,
            name: projectName,
            description: projectDescription,
            creator: 'Текущий пользователь',
            team: 'Не указана',
        };
        setProjects([...projects, newProject]);
        setProjectName('');
        setProjectDescription('');
    };

    const handleDeleteProject = (id) => {
        setProjects(projects.filter((project) => project.id !== id));
        setShowModal(false);
        setSelectedProject(null);
    };

    return (
        <div className="teams-table">
            <h3>Управление проектами</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="button" onClick={() => setActiveTab('create')}>
                    Создать проект
                </button>
                <button className="button" onClick={() => setActiveTab('manage')}>
                    Управление проектами
                </button>
            </div>

            {activeTab === 'create' && (
                <div className="task-form">
                    <h4>Создать новый проект</h4>
                    <input
                        className="input"
                        type="text"
                        placeholder="Название проекта"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                    <textarea
                        className="textarea"
                        placeholder="Описание проекта"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                    />
                    <button className="add-task-button" onClick={handleCreateProject}>
                        Создать
                    </button>
                </div>
            )}

            {activeTab === 'manage' && (
               <table className="project-table"> 
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Создатель</th>
                            <th>Команда</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <React.Fragment key={project.id}>
                                <tr
                                    className="project-row"
                                    onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                                >
                                    <td>{project.name}</td>
                                    <td>{project.creator}</td>
                                    <td>{project.team}</td>
                                </tr>
                                {selectedProject === project.id && (
                                    <tr>
                                        <td colSpan="3">
                                            <div className="task-form">
                                                <input
                                                    className="input"
                                                    type="text"
                                                    value={project.name}
                                                    onChange={(e) =>
                                                        setProjects(
                                                            projects.map((p) =>
                                                                p.id === project.id ? { ...p, name: e.target.value } : p
                                                            )
                                                        )
                                                    }
                                                />
                                                <textarea
                                                    className="textarea"
                                                    value={project.description}
                                                    onChange={(e) =>
                                                        setProjects(
                                                            projects.map((p) =>
                                                                p.id === project.id ? { ...p, description: e.target.value } : p
                                                            )
                                                        )
                                                    }
                                                />
                                                <button className="button" onClick={() => setShowModal(true)}>
                                                    Удалить
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}

            {showModal && (
                <div className="delete-modal">
                    <div className="delete-modal-content">
                        <h4>Вы уверены, что хотите удалить проект?</h4>
                        <button
                            className="buttonYes"
                            onClick={() => handleDeleteProject(selectedProject)}
                        >
                            Да
                        </button>
                        <button
                            className="buttonNo"
                            onClick={() => setShowModal(false)}
                        >
                            Нет
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectManagement;
