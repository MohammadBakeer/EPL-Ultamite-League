import { useState } from 'react';
import React from 'react';
import Card from './Card.jsx';
import '../styles/roundBars.css'



function Rounds({ number }) {
  // State to manage visibility and toggle state
  const [isExpanded, setIsExpanded] = useState(false);
   
  // Function to toggle the visibility and background color
  const toggleVisibility = () => {
    setIsExpanded(prevState => !prevState);
  };

  return (
    <div className="container">
      <div className="round-completed-bar"
           style={{ backgroundColor: isExpanded ? '#007bff' : '#fff', transition: '.3s' }}>
       
        <div className="rounds" style={{ color: isExpanded ? '#fff' : '#000', transition: '.3s' }}>
          Round {number}
        </div>
           
        <div className="completed-arrow" onClick={toggleVisibility}>
          <span style={{ color: isExpanded ? '#fff' : '#000', transition: '.3s' }}>completed</span>
          <img 
            src={isExpanded ? "images/arrow_drop_up.png" : "images/arrow_drop_down.png"} 
            alt="arrow" 
          />
        </div>
      </div>
      
      {isExpanded && (
        <div className="teams-card-container">
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
        </div>
      )}
    </div>
  );
}

export default Rounds;
