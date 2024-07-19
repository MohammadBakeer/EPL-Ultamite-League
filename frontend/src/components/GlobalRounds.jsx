import React, { useState, useEffect } from 'react';
import Card from './GlobalCards.jsx';
import axios from 'axios';
import '../styles/roundBars.css';

function Rounds({ number, defaultExpanded, roundbarText }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [roundNum, setRoundNum] = useState(2);
  const [roundGames, setRoundGames] = useState([]);

  const toggleVisibility = () => {
    setIsExpanded(prevState => !prevState);
  };


  useEffect(() => {
    const fetchRoundGames = async () => {
      try {
        const token = sessionStorage.getItem('authToken'); // Fetch JWT token from session storage
        // Make a GET request to fetch round games data with authorization header
        const response = await axios.get(`http://localhost:3000/api/getRoundGames/${roundNum}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
  
    
     
        setRoundGames(response.data)

      } catch (error) {
        console.error('Error fetching round games:', error.message);
      }
    };

    fetchRoundGames();
  }, []);

  const splitGamesIntoPairs = (games) => {
    let pairs = [];
    for (let i = 0; i < games.length; i += 2) {
      pairs.push(games.slice(i, i + 2));
    }
    return pairs;
  };

  const gamePairs = splitGamesIntoPairs(roundGames);

  const renderedCards = [];
  gamePairs.forEach((pair, index) => {
    renderedCards.push(<Card key={index} gamePairs={pair} />);
  });


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
        <>
          <div className="roundbar-predictions-text">
            {roundbarText}
          </div>
          {renderedCards}
        </>
      )}
    </div>
  );
}

export default Rounds;
