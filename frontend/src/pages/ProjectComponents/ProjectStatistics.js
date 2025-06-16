import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import TextField from '@mui/material/TextField';
import { fetchTasksForProject } from '../../services/taskApi';
import { fetchTeamMembers } from '../../services/teamApi';
import '../styles/ProjectStatistics.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement);

const getCSSVariable = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

const chartColors = {
  light: [
    '#4285F4', // Google Blue
    '#34A853', // Google Green
    '#FBBC05', // Google Yellow
    '#EA4335', // Google Red
    '#6200EA', // Microsoft Purple
    '#03A9F4', // Microsoft Blue
    '#FF5722', // Material Orange
    '#9C27B0', // Purple
    '#795548', // Brown
    '#607D8B', // Blue Grey
  ],
  dark: [
    '#8AB4F8', // Lighter Google Blue
    '#81C995', // Lighter Google Green
    '#FDD663', // Lighter Google Yellow
    '#F28B82', // Lighter Google Red
    '#D81B60', // Lighter Microsoft Purple
    '#4FC3F7', // Lighter Microsoft Blue
    '#FF8A65', // Lighter Material Orange
    '#CE93D8', // Lighter Purple
    '#BCAAA4', // Lighter Brown
    '#90A4AE', // Lighter Blue Grey
  ],
};

const ProjectStatistics = ({ projectId, teamId }) => {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [areChartsExpanded, setAreChartsExpanded] = useState(true);
  const [chartFilters, setChartFilters] = useState({
    members: { dateFilter: 'all', startDate: null, endDate: null },
    statuses: { dateFilter: 'all', startDate: null, endDate: null },
    memberTasks: { dateFilter: 'all', startDate: null, endDate: null, selectedMember: null },
  });
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedTasks, fetchedMembers] = await Promise.all([
          fetchTasksForProject(projectId),
          fetchTeamMembers(teamId),
        ]);
        setTasks(fetchedTasks || []);
        setTeamMembers(fetchedMembers || []);
        if (fetchedMembers?.length > 0) {
          setChartFilters((prev) => ({
            ...prev,
            memberTasks: { ...prev.memberTasks, selectedMember: fetchedMembers[0].memberId },
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [projectId, teamId]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(newTheme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const toggleAllCharts = () => setAreChartsExpanded((prev) => !prev);

  const updateChartFilter = (chartKey, field, value) => {
    setChartFilters((prev) => ({
      ...prev,
      [chartKey]: { ...prev[chartKey], [field]: value },
    }));
  };

  const filterTasksByDate = (tasks, chartKey) => {
    const { dateFilter, startDate, endDate } = chartFilters[chartKey];
    if (dateFilter === 'all' || (!startDate && !endDate)) return tasks;
    return tasks.filter((task) => {
      const taskDate = new Date(task.startDate || task.endDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start && end) return taskDate >= start && taskDate <= end;
      if (start) return taskDate >= start;
      if (end) return taskDate <= end;
      return true;
    });
  };

  const getTasksByMember = () => {
    const filteredTasks = filterTasksByDate(tasks, 'members');
    const taskCounts = teamMembers.map((member, index) => ({
      name: `${member.firstName} ${member.lastName || ''}`.trim(),
      count: filteredTasks.filter((task) => task.memberId === member.memberId).length,
      color: chartColors[theme in chartColors ? theme : 'light'][index % chartColors[theme in chartColors ? theme : 'light'].length],
    }));
    return {
      labels: taskCounts.map((m) => m.name),
      datasets: [
        {
          label: 'Количество задач',
          data: taskCounts.map((m) => m.count),
          backgroundColor: taskCounts.map((m) => m.color),
          borderColor: getCSSVariable('--border'),
          borderWidth: 1,
        },
      ],
    };
  };

  const getTasksByStatus = () => {
    const filteredTasks = filterTasksByDate(tasks, 'statuses');
    const statusCounts = filteredTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    const statusEntries = Object.entries(statusCounts);
    return {
      labels: statusEntries.map(([status]) => status),
      datasets: [
        {
          data: statusEntries.map(([, count]) => count),
          backgroundColor: statusEntries.map((_, index) => 
            chartColors[theme in chartColors ? theme : 'light'][(index + 3) % chartColors[theme in chartColors ? theme : 'light'].length]
          ),
          borderColor: getCSSVariable('--border-light'),
          borderWidth: 1,
        },
      ],
    };
  };

  const getTasksBySelectedMember = () => {
    const { selectedMember } = chartFilters.memberTasks;
    if (!selectedMember) return { labels: [], datasets: [] };
    const filteredTasks = filterTasksByDate(tasks, 'memberTasks').filter(
      (task) => task.memberId === selectedMember
    );
    const statusCounts = filteredTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    const statusEntries = Object.entries(statusCounts);
    return {
      labels: statusEntries.map(([status]) => status),
      datasets: [
        {
          label: 'Задачи по статусам',
          data: statusEntries.map(([, count]) => count),
          backgroundColor: statusEntries.map((_, index) => 
            chartColors[theme in chartColors ? theme : 'light'][(index + 6) % chartColors[theme in chartColors ? theme : 'light'].length]
          ),
          borderColor: getCSSVariable('--border'),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = (title, isBar) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: getCSSVariable('--text-primary'), padding: 20 },
      },
      title: {
        display: true,
        text: title,
        color: getCSSVariable('--text-primary'),
        font: { size: 18, family: getCSSVariable('--font-primary') },
        padding: { bottom: 20 },
      },
    },
    scales: isBar
      ? {
          x: {
            ticks: { color: getCSSVariable('--text-secondary') },
            grid: { color: getCSSVariable('--text-secondary') },
          },
          y: {
            ticks: { color: getCSSVariable('--text-secondary') },
            grid: { color: getCSSVariable('--text-secondary') },
            beginAtZero: true,
          },
        }
      : {},
  });

  // Функция для получения стилей DatePicker в зависимости от темы
  const getDatePickerStyles = () => {
    const isDark = theme === 'dark';
    
    return {
      '& .MuiInputBase-root': {
        height: '32px',
        fontSize: '13px',
        backgroundColor: getCSSVariable('--bg-secondary'),
        color: getCSSVariable('--text-primary'),
        '& .MuiInputBase-input': {
          color: getCSSVariable('--text-primary'),
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: getCSSVariable('--border-light'),
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: getCSSVariable('--border'),
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: getCSSVariable('--accent'),
        },
      },
      '& .MuiInputLabel-root': {
        fontSize: '12px',
        color: getCSSVariable('--text-secondary'),
        '&.Mui-focused': {
          color: getCSSVariable('--accent'),
        },
      },
      '& .MuiSvgIcon-root': {
        color: isDark ? '#ffffff' : getCSSVariable('--icon-color'),
      },
    };
  };

  const renderChart = (key, title, type, dataFn) => {
    const { dateFilter, startDate, endDate, selectedMember } = chartFilters[key];
    return (
      <div className={`chart ${areChartsExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="date-filter">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <select
              value={dateFilter}
              onChange={(e) => updateChartFilter(key, 'dateFilter', e.target.value)}
              style={{
                backgroundColor: getCSSVariable('--bg-secondary'),
                color: getCSSVariable('--text-primary'),
                border: `1px solid ${getCSSVariable('--border-light')}`,
                padding: '6px 8px',
                borderRadius: '4px',
                marginRight: '10px',
                fontSize: '13px',
                height: '32px',
                minWidth: '120px',
              }}
            >
              <option value="all">За всё время</option>
              <option value="custom">Выбрать период</option>
            </select>
            {dateFilter === 'custom' && (
              <>
                <DatePicker
                  label="С"
                  value={startDate}
                  onChange={(date) => updateChartFilter(key, 'startDate', date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: { 
                        marginRight: 1, 
                        width: 110,
                        ...getDatePickerStyles()
                      }
                    }
                  }}
                />
                <DatePicker
                  label="По"
                  value={endDate}
                  onChange={(date) => updateChartFilter(key, 'endDate', date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: { 
                        width: 110,
                        ...getDatePickerStyles()
                      }
                    }
                  }}
                />
              </>
            )}
            {key === 'memberTasks' && (
              <select
                value={selectedMember || ''}
                onChange={(e) => updateChartFilter(key, 'selectedMember', e.target.value)}
                style={{
                  backgroundColor: getCSSVariable('--bg-secondary'),
                  color: getCSSVariable('--text-primary'),
                  border: `1px solid ${getCSSVariable('--border-light')}`,
                  padding: '6px 8px',
                  borderRadius: '4px',
                  marginLeft: '10px',
                  fontSize: '13px',
                  height: '32px',
                  minWidth: '140px',
                }}
              >
                <option value="" disabled>
                  Выберите участника
                </option>
                {teamMembers.map((member) => (
                  <option key={member.memberId} value={member.memberId}>
                    {`${member.firstName} ${member.lastName || ''}`.trim()}
                  </option>
                ))}
              </select>
            )}
          </LocalizationProvider>
        </div>
        <div className="chart-canvas">
          {type === 'bar' ? (
            <Bar data={dataFn()} options={chartOptions(title, true)} />
          ) : (
            <Pie data={dataFn()} options={chartOptions(title, false)} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="project-statistics">
      <div className="statistics-header">
        <button
          onClick={toggleAllCharts}
          style={{
            backgroundColor: getCSSVariable('--button-bg'),
            color: getCSSVariable('--button-text'),
            border: `1px solid ${getCSSVariable('--border-light')}`,
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginRight: '15px',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = getCSSVariable('--button-hover-bg');
            e.target.style.color = getCSSVariable('--button-hover-text');
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = getCSSVariable('--button-bg');
            e.target.style.color = getCSSVariable('--button-text');
          }}
        >
          <span>{areChartsExpanded ? '▼' : '▶'}</span>
          {areChartsExpanded ? 'Свернуть все' : 'Развернуть все'}
        </button>
        <h3 style={{ color: getCSSVariable('--text-primary') }}>Статистика проекта</h3>
      </div>
      <div className="charts-container">
        {renderChart('members', 'Задачи по участникам', 'bar', getTasksByMember)}
        {renderChart('statuses', 'Задачи по статусам', 'pie', getTasksByStatus)}
        {renderChart('memberTasks', 'Задачи выбранного участника', 'bar', getTasksBySelectedMember)}
      </div>
    </div>
  );
};

export default ProjectStatistics;