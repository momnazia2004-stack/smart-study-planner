import React, { useState } from 'react';
import axios from 'axios'; 
import { Plus, Trash2, X, Target, CheckCircle2 } from 'lucide-react';
import './Goals.css';

const Goals = ({ goals, setGoals, userId }) => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoalId, setCurrentGoalId] = useState(null);

  const [formData, setFormData] = useState({ title: '', target: '', type: 'weekly', progress: '' });

  const openForm = (goal = null) => {
    if (goal) {
      setIsEditing(true);
      setCurrentGoalId(goal._id || goal.id); 
      const parts = goal.val.split('/');
      setFormData({
        title: goal.title,
        target: parts[1]?.trim() || '',
        type: goal.type || 'weekly',
        progress: parts[0]?.trim() || '0'
      });
    } else {
      setIsEditing(false);
      setFormData({ title: '', target: '', type: activeTab, progress: '0' });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      console.error("Error: userId is missing!");
      alert("User session not found. Please logout and login again.");
      return;
    }

    const targetVal = parseInt(formData.target) || 1;
    let progressVal = parseInt(formData.progress) || 0;

    if (progressVal > targetVal) progressVal = targetVal;

    const finalPercentage = Math.round((progressVal / targetVal) * 100);

    const goalObject = {
      userId: userId, 
      title: formData.title,
      val: `${progressVal} / ${targetVal}`,
      p: finalPercentage,
      type: formData.type
    };

    console.log("Sending to Backend:", goalObject);

    try {
      if (isEditing) {
        const res = await axios.put(`http://localhost:5000/api/goals/update/${currentGoalId}`, goalObject);
        setGoals(goals.map(g => (g._id === currentGoalId || g.id === currentGoalId) ? res.data : g));
      } else {
        const res = await axios.post('http://localhost:5000/api/goals/add', goalObject);
        setGoals([...goals, res.data]);
      }
      setShowForm(false);
    } catch (err) {
      console.error("Goal save karne mein error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || "Backend connection issue";
      alert(`Goal save nahi ho saka: ${errorMsg}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/goals/delete/${id}`);
      setGoals(goals.filter(g => (g._id !== id && g.id !== id)));
    } catch (err) {
      console.error("Delete karne mein error:", err);
    }
  };

  const filteredGoals = goals.filter(goal => goal.type === activeTab);

  return (
    <div className="goals-page">
      <div className="header-section">
        <div className="title-group">
          <h1>Goal Setting</h1>
        </div>
        <button className="add-goal-btn" onClick={() => openForm()}>
          <Plus size={18} /> Add New Goal
        </button>
      </div>

      <div className="tab-container">
        <button className={`tab ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')}>Weekly Targets</button>
        <button className={`tab ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => setActiveTab('monthly')}>Monthly Vision</button>
      </div>

      <div className="goals-list">
        {filteredGoals.length === 0 ? (
          <div className="no-data-card">
            <Target size={40} color="#cbd5e1" />
            <p>No {activeTab} goals yet.</p>
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <div key={goal._id || goal.id} className={`goal-card ${goal.p === 100 ? 'goal-completed-card' : ''}`}>
              <div className="goal-content">
                <div className="goal-header">
                  <div className="title-with-badge">
                    <span className="goal-title">{goal.title}</span>
                    {goal.p === 100 && <span className="achieved-badge"><CheckCircle2 size={12}/> Achieved</span>}
                  </div>
                  <span className="goal-percentage">{goal.p}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className={`progress-bar-fill ${goal.p === 100 ? 'bg-success' : ''}`} style={{ width: `${goal.p}%` }}></div>
                </div>
                <div className="goal-meta-row">
                  <span className="meta-label">Progress: {goal.val}</span>
                  <span className="meta-type">{goal.type}</span>
                </div>
              </div>
              
              <div className="goal-actions">
                <button className="update-progress-link" onClick={() => openForm(goal)}>
                  Update
                </button>
                <button className="action-icon-btn delete" onClick={() => handleDelete(goal._id || goal.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="goal-form animate-in">
            <div className="form-header">
              <h3>{isEditing ? 'Update Progress' : 'Set New Goal'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Goal Name</label>
                {isEditing ? (
                  <div className="read-only-field">{formData.title}</div>
                ) : (
                  <input 
                    type="text" 
                    placeholder="e.g. Finish React Course"
                    value={formData.title} 
                    required 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  />
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Current Progress</label>
                  <input 
                    type="number" 
                    value={formData.progress} 
                    min="0"
                    max={formData.target}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      const target = parseInt(formData.target) || 0;
                      setFormData({...formData, progress: val > target ? target : val});
                    }} 
                  />
                </div>
                <div className="form-group">
                  <label>Final Target</label>
                  {isEditing ? (
                    <div className="read-only-field">{formData.target}</div>
                  ) : (
                    <input 
                      type="number" 
                      placeholder="Total"
                      value={formData.target} 
                      required 
                      onChange={(e) => setFormData({...formData, target: e.target.value})} 
                    />
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="form-group">
                  <label>Timeframe</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
              
              <button type="submit" className="save-btn">
                {isEditing ? 'Save Progress' : 'Launch Goal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;