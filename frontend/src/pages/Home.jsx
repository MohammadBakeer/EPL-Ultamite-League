import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { decodeJWT } from '../jwtUtils.js';
import Field from '../components/field/Field.jsx';  // Update the path accordingly
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import LargeCard from '../components/LargeCard.jsx';
import SmallCard from '../components/SmallCard.jsx';
import ScheduleRounds from '../components/ScheduleRounds.jsx'
import '../styles/Home.css';

const Home = () => {

  const [teamName, setTeamName] = useState('');
  const [roundNum, setRoundNum] = useState(null)
  const [blockChanges, setBlockChanges] = useState(false)

  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;

  const fetchRoundStatus = async () => {
  
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/getRoundStatus', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    
    const currentDate = new Date();
   
    const finishedRounds = data
      .filter(round => round.finished) // Filter objects with finished as true
      .map(round => round.round_num); // Map to round_num
  
      // Find the maximum round_num
      const maxRoundNum = finishedRounds.length > 0 ? Math.max(...finishedRounds) : 0;
      const currentRound = maxRoundNum + 1
      // Set roundNum to maxRoundNum + 1 or 1 if no finished rounds are found
      setRoundNum(maxRoundNum > 0 ? maxRoundNum + 1 : 1);

      const currentRoundObject = data.find(round => round.round_num === currentRound);

      if (currentRoundObject) {
        const { is_current, start_date, finished } = currentRoundObject;
        const startDate = new Date(start_date);
        
        if (is_current || (startDate <= currentDate && !finished)) {
          setBlockChanges(true)

        } else {
          setBlockChanges(false)
        }
      }

      return currentRound
  };
  
 
useEffect(() => {
  fetchRoundStatus();
}, []);


    useEffect(() => {
        // Fetch team name when component mounts
        const fetchTeamName = async () => {
          try {
            const token = sessionStorage.getItem('authToken');
            const response = await axios.post( 
              'http://localhost:3000/api/getTeamName',
              { userId }, // Request body
              {
                headers: {
                  'Authorization': `Bearer ${token}`, // Include the token in Authorization header
                  'Content-Type': 'application/json' // Optional, specify the content type
                }
              }
            );
            setTeamName(response.data.teamName);
          } catch (error) {
            console.error('Error fetching team name:', error.message);
          }
        };
    
        fetchTeamName();
      }, [userId]); // Fetch team name when userId changes

  return (
  <div className="home-page">
    < Navbar/>
    <div className="home-field-container">
        <div className="home-field">
            <h1 className="home-team">{teamName}</h1>
            <Field userId={userId} isHomePage={false} roundNum = {roundNum} blockChanges = {blockChanges}/> {/* Pass userId only */}
            <Link to={`/editteam`} className="Edit-team-link">
                <button className="Edit-team">View Squad</button>
            </Link>
        </div>
      </div>
       <div className="smallCard">
      < SmallCard/>
        </div>  
        <div className="largeCard">
      < LargeCard/>
        </div>
        <ScheduleRounds />
    <Footer />
    </div>
  );
};

export default Home;


