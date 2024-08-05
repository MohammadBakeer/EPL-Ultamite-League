import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { decodeJWT } from '../jwtUtils.js';
import '../styles/Prizes.css';
import Navbar from '../components/Navbar.jsx';
import Jerseys from '../images/shirts/prize-round-23-24.png';
import AppleWatch from '../images/shirts/prize-quad-23-24.png';
import MacBook from '../images/shirts/macbook.jpg';

const Prizes = () => {

  const location = useLocation();
  const decodedToken = decodeJWT();
  const userId = decodedToken?.userId;
  
  const tabs = ['Round League Winner', 'Quad League Winner', 'Season League Winner'];

  const getCurrentTab = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || 'Round League Winner';
  };

  const currentTab = getCurrentTab();

  return (
    <div>
      <Navbar />
      <div className='prizes-container'>
        <h2>Prizes</h2>
        <div className='mini-navbar'>
          {tabs.map(tab => (
            <Link 
              key={tab} 
              to={`?tab=${tab}`} 
              className={currentTab === tab ? 'active' : ''}
            >
              {tab}
            </Link>
          ))}
        </div>
        <div className='content-container'>
          {currentTab === 'Round League Winner' && (
            <div className='prize-content'>
              <div className='prize-label'>
                <h3>1st Place</h3>
                <h4>Favourite Serie A club jersey</h4>
              </div>
              <div className='prize-img-container'>
                <img src={Jerseys} alt='Prize' className='img-box' />
              </div>   
            </div>
          )}
          {currentTab === 'Quad League Winner' && (
            <div className='quad-league-content'>
              <div className='prize-content'>
                <div className='prize-label'>
                  <h3>1st Place</h3>
                  <h4>Apple Watch SE</h4>
                </div>
                <div className='prize-img-container'>
                  <img src={AppleWatch} alt='Prize' className='img-box' />
                </div> 
              </div>
              <div className='secondary-prizes'>
                <div className='secondary-prize'>
                  <h4>2nd Place</h4>
                  <p>AirPods 3rd Gen</p>
                </div>
                <div className='secondary-prize'>
                  <h4>3rd Place</h4>
                  <p>Favourite Serie A club jersey</p>
                </div>
              </div>
            </div>
          )}
          {currentTab === 'Season League Winner' && (
            <div className='quad-league-content'>
              <div className='prize-content'>
                <div className='prize-label'>
                  <h3>1st place</h3>
                  <h4>MacBook Air (512GB, M2),</h4>
                  <h4>laptop</h4>
                </div>
                <div className='prize-img-container'>
                  <img src={MacBook} alt='Prize' className='img-box' />
                </div> 
              </div>
              <div className='secondary-prizes'>
                <div className='secondary-prize'>
                  <h4>2nd Place</h4>
                  <p>Playstation 5 console</p>
                </div>
                <div className='secondary-prize'>
                  <h4>3rd Place</h4>
                  <p>iPad 10th Gen (256 GB, WiFi) tablet</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prizes;
