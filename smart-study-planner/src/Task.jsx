import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Task.css';
import { Trash2, CheckCircle2 } from 'lucide-react'; 

const Task = ({ onNavigate, completeTask: markAsCompleteInApp, onTaskAction, userId: propUserId }) => { 
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newPriority, setNewPriority] = useState('High');
  const [newHours, setNewHours] = useState(''); 
  const [newMins, setNewMins] = useState(''); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskName, setSelectedTaskName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);

  const userId = propUserId || "uzma_nisar"; 

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/${userId}${filter !== 'All' ? `?priority=${filter}` : ''}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter, userId]); 
  const handleSaveTask = async (e) => {
    e.preventDefault();
    const h = parseFloat(newHours) || 0;
    const m = parseFloat(newMins) || 0;
    const totalTime = h + (m / 60);

    const newTask = { 
        user: userId,
        title: newTitle, 
        priority: newPriority, 
        deadline: newDeadline, 
        hours: totalTime, 
        color: newPriority === 'High' ? '#ef4444' : newPriority === 'Medium' ? '#f97316' : '#22c55e'
    };

    try {
      await axios.post('http://localhost:5000/api/tasks/add', newTask);
      setNewTitle(''); 
      setNewDeadline(''); 
      setNewHours(''); 
      setNewMins('');
      setShowForm(false);
      fetchTasks(); 
      if (onTaskAction) onTaskAction(); 
    } catch (err) {
      alert("Task save nahi ho saka");
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/complete/${task._id}`);
      
      if (markAsCompleteInApp) {
        markAsCompleteInApp(task._id, task.title, task.deadline, task.hours);
      }

      if (onTaskAction) {
        onTaskAction(); 
      }
      
      // 4. List refresh
      fetchTasks(); 
    } catch (err) {
      console.error("Complete Error:", err);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/delete/${taskIdToDelete}`);
      setShowDeleteModal(false);
      fetchTasks();
      if (onTaskAction) onTaskAction(); 
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleTaskCardClick = (task) => {
    
  };

  const openDeleteModal = (id) => {
    setTaskIdToDelete(id);
    setShowDeleteModal(true);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'All') return true;
    return task.priority === filter;
  });

  return (
    <div className="task-page">
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="custom-modal delete-modal">
            <div className="modal-icon-wrapper" style={{ backgroundColor: '#fff1f0', display: 'flex', justifyContent: 'center', padding: '20px', borderRadius: '50%', width: 'fit-content', margin: '0 auto 20px' }}>
              <Trash2 size={40} color="#ff4d4f" />
            </div>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this task?</p>
            <div className="modal-buttons" style={{ display: 'flex', gap: '12px' }}>
              <button className="modal-btn-primary" style={{ backgroundColor: '#ff4d4f', flex: 1 }} onClick={confirmDelete}>Yes, Delete it</button>
              <button className="modal-btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="task-header">
        <h1>Tasks</h1>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Task'}
        </button>
      </div>

      <div className="filter-tabs">
        {['All', 'High', 'Medium', 'Low'].map((type) => (
          <button key={type} className={`filter-btn ${filter === type ? 'active' : ''} ${type.toLowerCase()}`} onClick={() => setFilter(type)}>
            {type !== 'All' && <span className={`dot ${type.toLowerCase()}`}></span>}
            {type}
          </button>
        ))}
      </div>

      {showForm && (
        <form className="add-task-form" onSubmit={handleSaveTask}>
          <input type="text" placeholder="Task Name" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" placeholder="Hrs" value={newHours} onChange={(e) => setNewHours(e.target.value)} min="0" required style={{ flex: 1 }} />
            <input type="number" placeholder="Mins" value={newMins} onChange={(e) => setNewMins(e.target.value)} min="0" max="59" style={{ flex: 1 }} />
          </div>
          <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="priority-select">
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} required />
          <button type="submit" className="save-btn">Save Task</button>
        </form>
      )}

      <div className="task-list">
       {filteredTasks.map(task => {
          const today = new Date().toLocaleDateString('en-CA'); 
          const isMissed = task.deadline && task.deadline < today && task.status !== 'Completed';
          const displayH = Math.floor(task.hours);
          const displayM = Math.round((task.hours - displayH) * 60);

          return (
            <div key={task._id} className={`task-card ${isMissed ? 'missed-card' : ''} ${task.status === 'Completed' ? 'completed-card' : ''}`} 
                 onClick={() => handleTaskCardClick(task)} style={{ opacity: task.status === 'Completed' ? 0.6 : 1 }}>
              <div className="task-left">
                <span className={`dot ${isMissed ? 'missed' : task.priority.toLowerCase()}`}></span>
                <span className="title" style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
                    {task.title} {isMissed && <span className="missed-tag">Missed</span>}
                </span>
              </div>
              <div className="task-right">
                <span className={`tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                <span className="deadline-text">{displayH}h {displayM}m | Due: {task.deadline}</span>
                
                {task.status !== 'Completed' && (
                    <button className="complete-task-btn" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleCompleteTask(task); 
                            }} 
                            style={{ marginLeft: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}>
                        <CheckCircle2 size={20} />
                    </button>
                )}

                <button className="delete-task-btn" onClick={(e) => { e.stopPropagation(); openDeleteModal(task._id); }} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
};

export default Task;