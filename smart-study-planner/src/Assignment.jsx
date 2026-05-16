import React, { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react'; 
import axios from 'axios'; 
import './Assignment.css';

const Assignment = ({ assignments, setAssignments, userId: propsUserId }) => {
  const [filter, setFilter] = useState('All');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [tempAsgn, setTempAsgn] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [asgnToDeleteId, setAsgnToDeleteId] = useState(null);

  const userData = JSON.parse(localStorage.getItem('user')); 
  const userId = propsUserId || userData?._id || userData?.id; 

  const fetchAssignments = async () => {
    try {
      if (userId) {
        const response = await axios.get(`http://localhost:5000/api/assignments/${userId}`);
        setAssignments(response.data); 
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [userId]); 

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(newDate);
    
    const newAsgnData = { 
      userId: userId, 
      title: newName, 
      deadline: newDate 
    };

    if (selectedDate < today) {
      setTempAsgn(newAsgnData);
      setShowModal(true);
    } else {
      try {
        await axios.post('http://localhost:5000/api/assignments/add', { ...newAsgnData, status: 'Pending' });
        fetchAssignments(); 
        resetForm();
      } catch (error) {
        alert("Error saving assignment to database.");
      }
    }
  };

  const confirmWithStatus = async (status) => {
    try {
      await axios.post('http://localhost:5000/api/assignments/add', { ...tempAsgn, status: status });
      fetchAssignments();
      setShowModal(false);
      setTempAsgn(null);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewDate('');
    setShowAddModal(false);
  };

  const handleMarkDone = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/assignments/update/${id}`, { status: 'Completed' });
      fetchAssignments(); 
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const openDeleteModal = (id) => {
    setAsgnToDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/assignments/delete/${asgnToDeleteId}`);
      fetchAssignments();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  const filteredData = assignments.filter(item => 
    filter === 'All' ? true : item.status === filter
  );

  return (
    <div className="content-area">
      {showAddModal && (
        <div className="modal-overlay">
          <form className="custom-modal add-modal" onSubmit={handleSaveAssignment}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Add New Assignment</h2>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#64748b" />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'left' }}>
              <div className="input-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Assignment Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Assignment"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Deadline</label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  required
                />
              </div>
            </div>
            <div className="modal-buttons" style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="modal-btn-primary" style={{ flex: 1 }}>Save</button>
              <button type="button" className="modal-btn-secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <div className="modal-icon">📅</div>
            <h2>Past Date Detected</h2>
            <p>You have selected a past date. Do you want to mark it as ‘Completed’?</p>
            <div className="modal-buttons">
              <button className="modal-btn-primary" onClick={() => confirmWithStatus('Completed')}>
                Yes, Mark Completed
              </button>
              <button className="modal-btn-secondary" onClick={() => confirmWithStatus('Pending')}>
                No, Keep Pending
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <div className="modal-icon" style={{ color: '#ff4d4d' }}>🗑️</div>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this assignment? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="modal-btn-primary" style={{ backgroundColor: '#ff4d4d' }} onClick={confirmDelete}>
                Yes, Delete it
              </button>
              <button className="modal-btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="content-header">
        <div className="title-group">
          <h1>Assignments</h1>
        </div>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>+ Add Assignment</button>
      </header>

      <div className="filter-bar">
        {['All', 'Pending', 'Completed'].map(tab => (
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
        {filteredData.length === 0 ? (
          <p className="no-data">No assignments found in Database.</p>
        ) : (
          filteredData.map((item) => (
            <div key={item._id} className="assignment-card-wide">
              <div className="card-left">
                <div className="doc-icon-box">📄</div>
                <div className="card-info">
                  <h3>{item.title}</h3>
                  <p>Due: {formatDate(item.deadline)}</p>
                </div>
              </div>

              <div className="card-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {item.status === 'Pending' && (
                  <button 
                    className="done-action-btn"
                    onClick={() => handleMarkDone(item._id)}
                    style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                  >
                    Mark Done
                  </button>
                )}

                <div className={`status-pill ${item.status.toLowerCase()}`}>
                  {item.status}
                </div>

                <button 
                  className="delete-action-icon"
                  onClick={() => openDeleteModal(item._id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={20} color="#ff4d4d" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Assignment;