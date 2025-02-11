import React, { useEffect, useState } from 'react';
import { fetchUserTeams, fetchTeamMembers } from '../../services/api';
import '../styles/TableStyle.css'; // Стили для таблицы

const TeamList = ({ memberId }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState({}); // Храним участников для каждой команды
  const [expandedDescriptions, setExpandedDescriptions] = useState({}); // Управление раскрытием описания

  // Загрузка команд при изменении memberId
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        const userTeams = await fetchUserTeams(memberId);
        setTeams(userTeams);
      } catch (err) {
        setError('Не удалось загрузить команды. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      loadTeams();
    }
  }, [memberId]);

  // Обработчик клика на строку команды
  const handleRowClick = async (teamId) => {
    setSelectedTeam(selectedTeam === teamId ? null : teamId);

    if (selectedTeam !== teamId) {
      try {
        const members = await fetchTeamMembers(teamId);
        setTeamMembers((prev) => ({
          ...prev,
          [teamId]: sortMembersByRole(members),
        }));
      } catch (err) {
        setError('Не удалось загрузить участников. Попробуйте позже.');
      }
    }
  };

  // Обработчик для раскрытия описания
  const toggleDescription = (teamId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  // Сортировка участников по ролям
  const sortMembersByRole = (members) => {
    const rolePriority = {
      'Создатель': 1,
      'Администратор': 2,
      'Менеджер': 3,
      'Участник': 4,
    };
    return [...members].sort((a, b) => (rolePriority[a.role] || 5) - (rolePriority[b.role] || 5));
  };

  // Если данные загружаются или произошла ошибка
  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="teams-table">
      <table>
        <thead>
          <tr>
            <th>Команда</th>
            <th>Описание</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <React.Fragment key={team.teamId}>
              <tr
                onClick={() => handleRowClick(team.teamId)}
                className="team-row"
              >
                <td>{team.teamName}</td>
                <td>
                  {expandedDescriptions[team.teamId] ? (
                    <>
                      {team.description}
                      <span
                        className="toggle-arrow"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDescription(team.teamId);
                        }}
                      >
                        ▲
                      </span>
                    </>
                  ) : (
                    <>
                      {team.description.split('\n')[0]}
                      {team.description.split('\n').length > 1 && (
                        <span
                          className="toggle-arrow"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDescription(team.teamId);
                          }}
                        >
                          ▼
                        </span>
                      )}
                    </>
                  )}
                </td>
              </tr>

              {selectedTeam === team.teamId && (
                <>
                  <tr>
                    <td colSpan="2">
                      <h4>Участники:</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Участник</th>
                            <th>Роль</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamMembers[team.teamId]?.length > 0 ? (
                            teamMembers[team.teamId].map((member, index) => (
                              <tr
                                key={index}
                                style={{
                                  backgroundColor:
                                    member.memberId === memberId ? '#d3f8d3' : 'transparent',
                                }}
                              >
                                <td>{member.firstName + " " + member.lastName}</td>
                                <td>{member.role}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2">Нет участников для этой команды.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <p>Дата создания: {new Date(team.createdAt).toLocaleDateString()}</p>
                    </td>
                  </tr>
                </>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamList;
