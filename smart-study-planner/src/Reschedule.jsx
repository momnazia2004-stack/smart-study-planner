import React from 'react';
import './Reschedule.css';

const Reschedule = ({ taskName, isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null; 

  return (
    <div className="modal-overlay">
      <div className="reschedule-modal">
        <button className="close-x" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h2>Reschedule Suggestion</h2>
        </div>

        <div className="modal-body">
          <div className="calendar-illustration">
            <div className="icon-wrapper">
               <div className="calendar-bg">
                 <div className="calendar-lines"></div>
               </div>
               <div className="clock-overlay">
                 <div className="clock-hand"></div>
               </div>
            </div>
          </div>

          <h3>You missed "{taskName || 'Physics Assignment'}"</h3>
          <p className="sub-text">Don't worry! We found a better time for you.</p>

          <div className="suggestion-box">
            <span className="suggested-label">Suggested Time</span>
            <div className="time-slot">
              <strong>Tomorrow</strong>
              <p>04:00 PM - 05:00 PM</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="reschedule-btn" onClick={onConfirm}>
            Reschedule
          </button>
          
          <button className="not-now-btn" onClick={onClose}>
            Not Now
          </button>
        </div>
        
        <p className="footer-note">We automatically find free slots for you.</p>
      </div>
    </div>
  );
};

export default Reschedule;