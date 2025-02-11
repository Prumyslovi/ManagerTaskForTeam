import React, { useState, useEffect } from 'react';
import { fetchProfile, updateProfile } from '../../services/api';
import DelProfileForm from './DelProfileForm';
import ChangePasswordModal from './ChangePasswordModal'; // Подключаем новый компонент
import '../styles/Navbar.css';
import '../styles/ProgramSection.css';
import '../styles/Message.css';
import '../styles/TypicalItems.css';

const Profile = ({ memberId, onUpdateUserInfo }) => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [memberData, setMemberData] = useState(null);
  const [delProfile, setDelProfile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const loadProfile = async () => {
    if (!memberId) return;
    try {
      const data = await fetchProfile(memberId);
      setMemberData(data);
      setUsername(data.login || '');
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
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
    setSuccess('');

    const updatedData = {
      memberId,
      username,
      firstName,
      lastName,
    };

    try {
      await updateProfile(updatedData);
      setSuccess('Профиль успешно обновлён!');
    } catch (error) {
      console.error(error);
      setError('Не удалось обновить данные профиля');
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  const formattedDate = memberData?.createdAt ? new Date(memberData.createdAt).toLocaleDateString() : 'Неизвестно';

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
          Фамилия:
          <input
            type="text"
            className="InputType"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label className="LabeLabelTypel">
          Имя:
          <input
            type="text"
            className="InputType"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>
      </div>
      <div>
        <strong>Дата создания:</strong> {formattedDate}
      </div>
      <div className="container">
        <button className="saveButton" onClick={handleSave}>Сохранить</button>
        <button className="editButton" onClick={() => setShowPasswordModal(true)}>Изменить пароль</button>
        <button className="delButton" onClick={() => setDelProfile(true)}>Удалить профиль</button>
      </div>
      {delProfile && <DelProfileForm visible={isVisible} onVisibilityChange={setIsVisible} />}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} memberId={memberId} />
      )}
    </div>
  );
};

export default Profile;
