import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Plus, CalendarDays, Target } from 'lucide-react'; 
import './Dashboard.css';

const Dashboard = ({ userName, stats, onNavigate, assignments = [], goals = [], notificationCount, userId }) => {
  const [tasks, setTasks] = useState([]);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState('Medium');
  const [quickHours, setQuickHours] = useState('');
  const [quickMinutes, setQuickMinutes] = useState('');
  
  const todayStr = new Date().toISOString().split('T')[0]; 
  const [quickDate, setQuickDate] = useState(todayStr);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/tasks/${userId}`);
        setTasks(res.data);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      }
    };
    fetchTasks();
  }, [userId]);

  const totalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + (g.p || 0), 0) / goals.length) 
    : 0;

  const handleQuickAdd = async () => {
    if (!quickTitle || !quickDate) return;
    const priorityColors = { High: '#ef4444', Medium: '#f97316', Low: '#22c55e' };
    
    const newTask = {
      user: userId,
      title: quickTitle,
      priority: quickPriority,
      deadline: quickDate,
      hours: parseInt(quickHours) || 0,
      minutes: parseInt(quickMinutes) || 0, 
      color: priorityColors[quickPriority]
    };

    try {
      await axios.post('http://localhost:5000/api/tasks/add', newTask);
      setQuickTitle('');
      setQuickHours('');
      setQuickMinutes('');
      setQuickDate(todayStr);
      // Refresh list
      const res = await axios.get(`http://localhost:5000/api/tasks/${userId}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Quick Add Error:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <main className="main-content">
        <header style={{ justifyContent: 'flex-end' }}>
          <div className="header-icons">
            <div className="notification-wrapper" onClick={() => onNavigate('reminders')}>
              <Bell size={20} />
              {notificationCount > 0 && <span className="bell-badge">{notificationCount}</span>}
            </div>
          </div>
        </header>

        <section className="welcome">
          <h1>Hello, {userName}</h1>
        </section>

        <div className="stats-grid">
          {stats.map((item, index) => {
            let displayCount = item.count;
            let label = item.label;
            let icon = item.icon;
            let bgColor = item.bgColor;

            if (label === "Tasks Today") {
                displayCount = tasks.filter(t => {
                    const tDate = t.deadline?.includes('T') ? t.deadline.split('T')[0] : t.deadline;
                    return tDate === todayStr && t.status !== 'Completed';
                }).length;
            } else if (label === "Completed") {
                displayCount = assignments.filter(a => a.status === 'Completed').length;
            } else if (label === "In Progress" || label === "Goals Progress") {
                label = "Goals Progress";
                displayCount = `${totalProgress}%`;
                icon = <Target color="#f59e0b" />; 
            } else if (label === "Pending") {
                displayCount = assignments.filter(a => a.status === 'Pending').length;
            }
            
            return (
              <div key={index} className="stat-card" style={{ borderBottom: `4px solid ${icon.props.color}` }}>
                <div className="icon-wrapper" style={{ backgroundColor: bgColor, padding: '10px', borderRadius: '10px', display: 'flex' }}>
                  {icon}
                </div>
                <div>
                  <p>{label}</p>
                  <h3>{displayCount}</h3>
                </div>
              </div>
            );
          })}
        </div>

        <div className="content-grid">
          <div className="card tasks-card">
            <h2>Upcoming Tasks</h2>
            <div className="task-list">
              {tasks
                .filter(t => {
                    const tDate = t.deadline?.includes('T') ? t.deadline.split('T')[0] : t.deadline;
                    return tDate > todayStr && t.status !== 'Completed' && t.priority === 'High';
                })
                .slice(0, 2)
                .map((task) => (
                <div key={task._id} className="task-item">
                  <div className="status-dot" style={{ backgroundColor: task.color }}></div>
                  <span className="task-name">{task.title}</span>
                  <span style={{fontSize: '12px', color: '#64748b', marginLeft: 'auto', marginRight: '10px'}}>
                    {task.hours}h {task.minutes}m
                  </span>
                  <span className="priority-tag" style={{ color: task.color, backgroundColor: `${task.color}20` }}>{task.priority}</span>
                </div>
              ))}
              {tasks.filter(t => t.deadline > todayStr && t.status !== 'Completed' && t.priority === 'High').length === 0 && <p>No high priority tasks</p>}
            </div>
            <button className="view-all-btn" onClick={() => onNavigate('tasks')}>View All</button>
          </div>

          <div className="card deadlines-card">
            <h2>Upcoming Deadlines</h2>
            <div className="deadline-list">
              {assignments.filter(asgn => asgn.status === 'Pending').length > 0 ? (
                assignments.filter(asgn => asgn.status === 'Pending')
                  .sort((a, b) => new Date(a.due) - new Date(b.due))
                  .slice(0, 4).map((dl) => (
                    <div key={dl._id || dl.id} className="deadline-item">
                      <div className="deadline-icon"><CalendarDays size={20} color="#64748b" /></div>
                      <div className="deadline-info">
                        <p className="deadline-title">{dl.title}</p>
                        <span className="deadline-date">{dl.deadline || dl.due}</span>
                      </div>
                    </div>
                  ))
              ) : <p>No pending assignments.</p>}
            </div>
          </div>
        </div>

        <div className="quick-add">
          <h2>Quick Add Task</h2>
          <div className="add-input-group">
            <input type="text" placeholder="What do you want to study?" value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} />
            <input type="number" placeholder="Hrs" value={quickHours} onChange={(e) => setQuickHours(e.target.value)} style={{ width: '65px' }} min="0" />
            <input type="number" placeholder="Min" value={quickMinutes} onChange={(e) => setQuickMinutes(e.target.value)} style={{ width: '65px' }} min="0" max="59" />
            <input type="date" className="quick-date-input" value={quickDate} onChange={(e) => setQuickDate(e.target.value)} />
            <select 
  className="quick-priority-select" 
  value={quickPriority} 
  onChange={(e) => setQuickPriority(e.target.value)}
>
  <option value="High">High</option>
  <option value="Medium">Medium</option>
  <option value="Low">Low</option>
</select>
            <button onClick={handleQuickAdd}><Plus size={18} /> Add Task</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;