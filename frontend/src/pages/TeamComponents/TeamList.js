import React, { useEffect, useState } from 'react';
import { fetchTeamMembers, fetchUserTeams } from '../../services/teamApi';
import { FaSpinner } from 'react-icons/fa';
import '../styles/TableStyle.css';
import '../styles/Spinner.css';
import '../styles/Message.css';
import DocumentList from '../Documents/DocumentList';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const memberId = localStorage.getItem('memberId');

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

  const handleRowClick = async (teamId) => {
    setSelectedTeam(selectedTeam === teamId ? null : teamId);

    if (selectedTeam !== teamId) {
      try {
        const members = await fetchTeamMembers(teamId);
        console.log('Найденные участники:', members);
        setTeamMembers((prev) => ({
          ...prev,
          [teamId]: sortMembersByRole(members),
        }));
      } catch (err) {
        setError('Не удалось загрузить участников. Попробуйте позже.');
      }
    }
  };

  const toggleDescription = (teamId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  const sortMembersByRole = (members) => {
    const rolePriority = {
      'Создатель': 1,
      'Администратор': 2,
      'Менеджер': 3,
      'Участник': 4,
    };
    return [...members].sort((a, b) => (rolePriority[a.role] || 5) - (rolePriority[b.role] || 5));
  };

  if (loading) return <div><FaSpinner className="spinner" /></div>;
  if (error) return <p className="restricted-content">{error}</p>;

  return (
    <div className="teams-table">
      <table>
        <thead>
          <tr>
            <th className="team-row">Команда</th>
            <th className="team-row">Описание</th>
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
                                <td>{member.roleName || 'Роль не указана'}</td>
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
                  <tr>
                    <td colSpan="2">
                      <h4>Документы:</h4>
                      <DocumentList teamId={team.teamId} />
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