import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { FaAngleDown } from 'react-icons/fa'; // Example using FontAwesome's angle down icon
import '../styles/nav.css';

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleMouseEnter = () => {
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    setShowDropdown(false);
  };

  return (
    <header className='nav-header'>
      <nav className='main-nav'>
        <div className="logo">
          <img className='nav-image' src="https://assets.codepen.io/285131/pl-logo.svg" alt="league" />
        </div>
        <ul className="nav-listItems">
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li className="dropdown" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Link to="/fantasyleague">Leagues <FaAngleDown size={12} /></Link> {/* Smaller dropdown arrow */}
            {showDropdown && (
              <div className="dropdown-content">
                <Link to="/fantasyleague" style={{ fontSize: '14px' }}>Fantasy League</Link> {/* Smaller text */}
                <Link to="/predictionleague" style={{ fontSize: '14px' }}>Prediction League</Link> {/* Smaller text */}
              </div>
            )}
          </li>
          <li>
            <Link to="/schedule">Schedule</Link>
          </li>
          <li>
            <Link to="/prizes">Prizes</Link>
          </li>
          <li>
            <Link to="/rules">Rules & FAQ</Link>
          </li>
        </ul>
        <div className="profile-button">
          <span className="user-initial">MB</span>
          <span className='profile-arrow'>
            <FaAngleDown /> {/* Larger profile arrow */}
          </span>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
