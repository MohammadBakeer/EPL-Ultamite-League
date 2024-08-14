import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { FaAngleDown } from 'react-icons/fa'; // Example using FontAwesome's angle down icon
import ManageProfile from './ManageProfile.jsx';
import { FaHamburger } from "react-icons/fa";
import '../styles/nav.css';

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleToggleNav = () => {
    document.querySelector('#nav-items').classList.toggle("toggle-navlist")
  }

  const handleManageProfileClick = (event) => {
    event.preventDefault();
    handleToggleNav()
    setShowProfileModal(true);
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
  };


  const handleMouseEnter = () => {
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    setShowDropdown(false);
  };


  return (
    <>
    <header className='nav-header'>
      <nav className='main-nav'>
        <div className="navlogo">
        <Link to="/home">
         <img src="/epl-badge.png" alt="league" />
        </Link>
        </div>
        <ul className="nav-listItems" id="nav-items">
          <li onClick={handleToggleNav}>
            <Link to="/home">Home</Link>
          </li>
          <li onClick={handleToggleNav} className="dropdown" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Link to="/fantasyleague">Leagues <FaAngleDown size={12} /></Link> 
            {showDropdown && (
              <div className="dropdown-content">
                <Link to="/fantasyleague" style={{ fontSize: '14px' }}>Fantasy League</Link>
                <Link to="/predictionleague" style={{ fontSize: '14px' }}>Prediction League</Link>
              </div>
            )}
          </li>
          <li onClick={handleToggleNav}>
            <Link to="/schedule">Schedule</Link>
          </li>
          <li onClick={handleToggleNav}>
            <Link to="/prizes">Prizes</Link>
          </li>
          <li onClick={handleToggleNav}>
            <Link to="/rules">Rules & FAQ</Link>
          </li>
          <li onClick={handleToggleNav}>
            <Link onClick={handleManageProfileClick}>Manage Profile</Link>
          </li>
          <li onClick={handleToggleNav}>
            <Link to="/contactus">Contact Us</Link>
          </li>
        </ul>
      </nav>
      <button onClick={handleToggleNav} className="nav-burger"><FaHamburger className="nav-burger-icon"/></button>
    </header>
     <ManageProfile show={showProfileModal} onClose={handleCloseModal} />
    </>
  );
}

export default Navbar;
