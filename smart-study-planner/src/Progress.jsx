import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Progress.css';

const Progress = ({ goals = [], onNavigate, userId, refreshTrigger }) => {
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    chartData: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
  });

  useEffect(() => {
    const fetchStats = async () => {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      const activeId = userId || savedUser?._id || savedUser?.id;

      if (!activeId) {
        console.warn("Progress: No userId found");
        return;
      }

      try {
        console.log("Fetching stats for:", activeId);
        const res = await axios.get(`http://localhost:5000/api/tasks/stats/${activeId}`);
        if (res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [userId, refreshTrigger]); 
  const formattedStudyData = Object.keys(stats.chartData).map(day => ({
    name: day,
    hours: stats.chartData[day]
  }));

  const subjectData = goals.map(goal => ({ name: goal.title, value: goal.p || 0 }));
  const totalPercentage = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + (g.p || 0), 0) / goals.length) : 0;

  const displayHours = Math.floor(stats.totalStudyTime);
  const displayMinutes = Math.round((stats.totalStudyTime - displayHours) * 60);

  const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="progress-page">
      <h2>Progress Tracking</h2>
      <div className="stats-container">
        <div className="stat-card">
          <p>Overall Progress</p>
          <h2>{totalPercentage}%</h2>
          <div className="progress-track">
            <div className="fill" style={{ width: `${totalPercentage}%` }}></div>
          </div>
        </div>
        <div className="stat-card purple-bg">
          <p>Weekly Study Time</p>
          <h2>{displayHours}h {displayMinutes < 10 ? `0${displayMinutes}` : displayMinutes}m</h2>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Study Hours (This Week)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={formattedStudyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Subject Wise Progress</h3>
          {goals.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie 
                    data={subjectData} 
                    innerRadius={65} 
                    outerRadius={85} 
                    paddingAngle={5} 
                    dataKey="value" 
                    stroke="none"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="custom-legend">
                {goals.map((goal, index) => (
                  <div key={goal.id || index} className="legend-item">
                    <span className="dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span> 
                    {goal.title} {goal.p}%
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state-container">
              <div className="empty-icon">🎯</div>
              <h4>No goals added yet</h4>
              <p>
                Go to <span className="clickable-link" onClick={() => onNavigate('goals')}>Goals page</span> to start tracking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;