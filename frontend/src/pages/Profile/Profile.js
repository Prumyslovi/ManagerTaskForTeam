import React, { useState, useEffect } from 'react';
import { fetchProfile, updateProfile } from '../../services/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Импортируем иконки
import DelProfileForm from './DelProfileForm';
import '../styles/Navbar.css';
import '../styles/ProgramSection.css';
import '../styles/Message.css';
import '../styles/TypicalItems.css';

const Profile = ({ memberId, onUpdateUserInfo }) => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // Сообщение об успешном обновлении
    const [isLoading, setIsLoading] = useState(true);
    const [memberData, setMemberData] = useState(null);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [delProfile, setDelProfile] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const loadProfile = async () => {
        if (!memberId) return;
        try {
            const data = await fetchProfile(memberId);
            setMemberData(data);
            setUsername(data.login || '');
            setFirstName(data.memberName || '');
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setError('Не удалось загрузить данные профиля');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [memberId]);

    const handleSave = async () => {
        setError('');
        setSuccess(''); // Сбрасываем предыдущие уведомления
    
        if (!oldPassword) {
            alert('Введите старый пароль для подтверждения!');
            return;
        }
    
        // Если новый пароль введён, проверяем его корректность
        if (newPassword && newPassword.length < 6) {
            alert('Новый пароль должен содержать не менее 6 символов!');
            return;
        }
    
        // Создаём объект обновлённых данных
        const updatedData = { 
            memberId,
            username, 
            firstName, 
            oldPassword,
        };
    
        // Добавляем поле `newPassword` только если оно заполнено
        if (newPassword) {
            updatedData.newPassword = newPassword;
        }
    
        try {
            await updateProfile(updatedData); // Отправляем данные на сервер
            setSuccess('Профиль успешно обновлён!');
            setOldPassword('');
            setNewPassword(''); // Сбрасываем поля пароля только при успехе
        } catch (error) {
            console.error(error);
            setError('Не удалось обновить данные профиля');
        }
    };

    const handleDelete = async () => {
        setDelProfile(true);

        // try {
        //     await deleteProfile(memberId); // Отправляем запрос на удаление
        //     alert('Профиль успешно удалён!');
        //     if (onUpdateUserInfo) onUpdateUserInfo(null); // Обновляем состояние приложения
        // } catch (error) {
        //     console.error(error);
        //     alert('Не удалось удалить профиль');
        // }
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    const formattedDate = memberData?.CreatedAt ? new Date(memberData.CreatedAt).toLocaleDateString() : 'Неизвестно';

    return (
        <div className="programSection">
            <h2 className="TitleType">Профиль</h2>
            {error && <div className="restricted-content">{error}</div>}
            {success && <div className="right-content">{success}</div>}
            <div>
                <label className="LabelType">
                    Логин:
                    <input
                        type="text"
                        className="InputType"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label className="LabeLabelTypel">
                    Имя:
                    <input
                        type="text"
                        className="InputType"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label className="LabelType">
                    Действующий пароль:
                    <div className="password-wrapper">
                        <input
                            type={showOldPassword ? 'text' : 'password'}
                            className="InputType"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowOldPassword(prev => !prev)}
                        >
                            {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </label>
            </div>
            <div>
                <label className="LabelType">
                    Новый пароль:
                    <div className="password-wrapper">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            className="InputType"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowNewPassword(prev => !prev)}
                        >
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </label>
            </div>
            <div>
                <strong>Дата создания:</strong> {formattedDate}
            </div>
            <button className="saveButton" onClick={handleSave}>Сохранить</button>
            <button className="delButton" onClick={handleDelete}>Удалить профиль</button>
            {delProfile && (<DelProfileForm 
                visible={isVisible}
                onVisibilityChange={setIsVisible}/>)}
        </div>
    );
};

export default Profile;
