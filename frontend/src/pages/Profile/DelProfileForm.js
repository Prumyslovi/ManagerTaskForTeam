import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css';
import '../styles/ProgramSection.css';
import '../styles/Message.css';

const DelProfileForm = ({ visible, onVisibilityChange, onConfirm }) => {
    const [isVisible, setIsVisible] = useState(visible);

    useEffect(() => {
        setIsVisible(visible); // Обновляем внутреннее состояние при изменении props
    }, [visible]);

    const handleCancel = () => {
        setIsVisible('hidden'); // Скрыть модальное окно
        onVisibilityChange('hidden'); // Передаем скрытое состояние родительскому компоненту
    };

    const handleConfirm = () => {
        onConfirm(); // Выполняем подтверждение
        handleCancel(); // Скрываем окно
    };

    // Если модальное окно скрыто, то ничего не рендерим
    if (isVisible === 'hidden') return null;

    return (
        <div className="modalRegForm" style={{ visibility: isVisible }}>
            <div className="modalContent">
                <h2 align="center">Подтверждение удаления</h2>
                <p align="center">Вы уверены, что хотите удалить профиль? Это действие необратимо.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                    <button className="modalButtonReg" onClick={handleConfirm}>
                        Удалить
                    </button>
                    <button className="modalButtonClear" onClick={handleCancel}>
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DelProfileForm;
