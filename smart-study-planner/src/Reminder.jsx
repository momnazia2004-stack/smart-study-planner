import React, { useState } from 'react';
import './Reminder.css';

const Reminder = ({ assignments, onNavigate }) => {
  const [filter, setFilter] = useState('All');

  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const todayStr = today.toISOString().split('T')[0];

  const reminderData = assignments
    .filter(asgn => asgn.status === 'Pending')
    .map(asgn => {
      const dueDate = new Date(asgn.deadline);
      dueDate.setHours(0, 0, 0, 0); 

      const diffTime = today - dueDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const isOverdue = asgn.deadline < todayStr;
      const isToday = asgn.deadline === todayStr;

      let timeLabel = "";
      let currentStatus = "";

      if (isToday) {
        timeLabel = "Due Today";
        currentStatus = "Upcoming"; 
      } else if (isOverdue) {
        timeLabel = `Overdue by ${diffDays} day${diffDays > 1 ? 's' : ''}`;
        currentStatus = "Overdue";
      } else {
        timeLabel = `Due on ${asgn.deadline}`;
        currentStatus = "Upcoming";
      }

      return {
        id: asgn._id || asgn.id, 
        title: asgn.title,
        time: timeLabel,
        status: currentStatus,
        rawDate: asgn.deadline 
      };
    });

  const filteredReminders = reminderData.filter(item => 
    filter === 'All' ? true : item.status === filter
  );

  return (
    <div className="content-area">
      <header className="content-header">
        <div className="title-group">
          <h1>Reminders</h1>
        </div>
      </header>

      <div className="filter-bar">
        {['All', 'Upcoming', 'Overdue'].map(tab => (
          <button 
            key={tab}
            className={`filter-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="assignment-list">
        {filteredReminders.length === 0 ? (
          <p className="no-data">
            {filter === 'Overdue' ? "Good job! There are no overdue assignments." : "There are no assignments in this tab."}
          </p>
        ) : (
          filteredReminders
            .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate)) 
            .map((item) => (
              <div 
                key={item.id} 
                className="assignment-card-wide" 
                onClick={() => onNavigate('assignments')} 
                style={{ cursor: 'pointer' }}
              >
                <div className="card-left">
                  <div className={`doc-icon-box ${item.status === 'Overdue' ? 'red-icon' : ''}`}>
                    {item.status === 'Overdue' ? '⏰' : '🔔'}
                  </div>
                  <div className="card-info">
                    <h3>{item.title}</h3>
                    <p style={{ color: item.status === 'Overdue' ? '#ef4444' : '#64748b' }}>
                      {item.time}
                    </p>
                  </div>
                </div>
                <div className={`status-pill-reminder ${item.status.toLowerCase()}`}>
                  {item.status}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Reminder;