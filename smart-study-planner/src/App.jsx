import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import Dashboard from './Dashboard';
import Auth from './Auth'; 
import Assignment from './Assignment';
import Reminder from './Reminder';
import Goals from './Goals'; 
import Progress from './Progress'; 
import Reschedule from './Reschedule';
import Task from './Task';  
import { 
  LayoutDashboard, CheckCircle2, BookOpen, CalendarDays, 
  Target, Activity, Bell, LogOut, Clock
} from 'lucide-react';
import './App.css'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState([]); 
  const [goals, setGoals] = useState([]);

  const [studyStats, setStudyStats] = useState([
    { name: 'Mon', hours: 0 }, { name: 'Tue', hours: 0 },
    { name: 'Wed', hours: 0 }, { name: 'Thu', hours: 0 },
    { name: 'Fri', hours: 0 }, { name: 'Sat', hours: 0 }, { name: 'Sun', hours: 0 }
  ]);

  const [stats, setStats] = useState([
    { label: "Tasks Today", count: 0, bgColor: "#e0e7ff", icon: <CalendarDays color="#7c4dff"/> },
    { label: "Completed", count: 0, bgColor: "#d1fae5", icon: <CheckCircle2 color="#10b981"/> },
    { label: "In Progress", count: 0, bgColor: "#ffedd5", icon: <Activity color="#f59e0b"/> },
    { label: "Pending", count: 0, bgColor: "#fee2e2", icon: <Clock color="#ef4444"/> },
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const getNotificationCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return assignments.filter(asgn => {
      if (!asgn.deadline || asgn.status !== 'Pending') return false;
      const dueDate = new Date(asgn.deadline);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate <= today;
    }).length;
  };

  const notificationCount = getNotificationCount();

  useEffect(() => {
    const fetchAllUserData = async () => {
      if (isAuthenticated && currentUser) {
        try {
          const userId = currentUser._id || currentUser.id;
          
          const goalsRes = await axios.get(`http://localhost:5000/api/goals/${userId}`);
          setGoals(goalsRes.data);

          try {
            const tasksRes = await axios.get(`http://localhost:5000/api/tasks/${userId}`);
            const fetchedTasks = tasksRes.data;
            setTasks(fetchedTasks);

            const todayStr = new Date().toISOString().split('T')[0];
            const tasksTodayCount = fetchedTasks.filter(t => {
                const taskDate = t.deadline?.includes('T') ? t.deadline.split('T')[0] : t.deadline;
                return taskDate === todayStr && t.status !== 'Completed';
            }).length;

            setStats(prevStats => prevStats.map(s => 
              s.label === "Tasks Today" ? { ...s, count: tasksTodayCount } : s
            ));
          } catch (e) { console.log("Tasks error"); }

          try {
            const assignmentsRes = await axios.get(`http://localhost:5000/api/assignments/${userId}`);
            setAssignments(assignmentsRes.data);
          } catch (e) { console.log("Assignments error"); }

        } catch (err) {
          console.error("Error fetching data:", err);
        }
      }
    };
    fetchAllUserData();
  }, [isAuthenticated, currentUser]);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActivePage('dashboard');
    setTasks([]);
    setAssignments([]);
    setGoals([]);
  };

  const completeTask = (taskId, taskTitle, taskDate, taskHours) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dateObj = taskDate ? new Date(taskDate) : new Date();
    const taskDayName = days[dateObj.getDay()];
    const timeToLog = parseFloat(taskHours) || 0; 

    setStudyStats(prev => prev.map(d => 
      d.name === taskDayName ? { ...d, hours: Number((d.hours + timeToLog).toFixed(2)) } : d
    ));

    setGoals(prevGoals => prevGoals.map(goal => {
      if (taskTitle && goal.title && taskTitle.toLowerCase().includes(goal.title.toLowerCase())) {
        const parts = goal.val.split('/');
        let currentProgress = parseInt(parts[0]) || 0;
        const target = parseInt(parts[1]) || 1;
        const newProgress = Math.min(currentProgress + 1, target);
        const newPercentage = Math.round((newProgress / target) * 100);
        return { ...goal, val: `${newProgress} / ${target}`, p: newPercentage };
      }
      return goal;
    }));
    deleteTask(taskId);
  };

  const deleteTask = (id) => setTasks(tasks.filter(task => (task._id || task.id) !== id));
  const deleteAssignment = (id) => setAssignments(assignments.filter(asgn => (asgn._id || asgn.id) !== id));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckCircle2 size={20} /> },
    { id: 'assignments', label: 'Assignments', icon: <BookOpen size={20} /> },
    { id: 'goals', label: 'Goals', icon: <Target size={20} /> },
    { id: 'progress', label: 'Progress', icon: <Activity size={20} /> },
    { id: 'reminders', label: 'Reminders', icon: <Bell size={20} /> },
  ];

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <aside className="global-sidebar">
        <div className="sidebar-logo">
          <div className="logo-box"><BookOpen size={20} color="#6366f1" /></div>
          <span>Smart Planner</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div key={item.id} className={`sidebar-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
            <div className="sidebar-item" style={{ color: '#ef4444' }} onClick={handleLogout}>
                <LogOut size={20} />
                <span>Logout</span>
            </div>
        </div>
      </aside>

      <main className="content-view">
        {activePage === 'dashboard' ? (
          <Dashboard 
            userName={currentUser?.name || "User"} 
            userId={currentUser?._id || currentUser?.id} 
            stats={stats} 
            tasks={tasks} 
            setTasks={setTasks} 
            onNavigate={setActivePage} 
            assignments={assignments} 
            goals={goals} 
            notificationCount={notificationCount} 
          />
        ) : activePage === 'tasks' ? (
          <Task tasks={tasks} setTasks={setTasks} deleteTask={deleteTask} completeTask={completeTask} onNavigate={setActivePage} userId={currentUser?._id || currentUser?.id} />
        ) : activePage === 'assignments' ? (
          <Assignment assignments={assignments} setAssignments={setAssignments} userId={currentUser?._id || currentUser?.id} onNavigate={setActivePage} />
        ) : activePage === 'goals' ? (
          <Goals goals={goals} setGoals={setGoals} userId={currentUser?._id || currentUser?.id} onNavigate={setActivePage} />
        ) : activePage === 'progress' ? (
          <Progress goals={goals} studyStats={studyStats} onNavigate={setActivePage} />
        ) : activePage === 'reminders' ? (
          <Reminder assignments={assignments} onNavigate={setActivePage} />
        ) : null}
      </main>
    </div>
  );
}

export default App;