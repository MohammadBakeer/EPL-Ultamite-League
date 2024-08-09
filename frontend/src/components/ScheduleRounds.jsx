import  { useState, useEffect } from 'react';
import Card from './ScheduleCards.jsx';
import axios from 'axios';
import '../styles/roundBars.css'
// import { current } from '@reduxjs/toolkit';


// eslint-disable-next-line react/prop-types
function ScheduleRounds({ defaultExpanded, roundbarText, roundnum, onSchedulePage, games, currentRoundNum }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [roundNum, setRoundNum] = useState(null);
  const [roundGames, setRoundGames] = useState([]);
  const [blockChanges, setBlockChanges] = useState(false);

  console.log(roundnum);
  console.log(currentRoundNum);

  const toggleVisibility = () => {
    setIsExpanded(prevState => !prevState);
  };

  useEffect(()=>{
    if (currentRoundNum === roundnum) {
      setIsExpanded(true);
    }
  }, [currentRoundNum])

  useEffect(()=>{
    setRoundNum(roundnum)
    if(games != null){
    setRoundGames(games)
    }
  }, [roundnum])

  

  const fetchRoundGames = async (roundNum) => {
    if(onSchedulePage){
      return
    }
    try {
      const response = await axios.get(`http://localhost:3000/api/getScheduleRoundGames/${roundNum}`, {
      });     
      setRoundGames(response.data);
    } catch (error) {
      console.error('Error fetching round games:', error.message);
    }
  };

  const fetchRoundStatus = async () => {
    if(onSchedulePage){
      return
    }
    const response = await fetch('http://localhost:3000/api/getScheduleRoundStatus', {
      method: 'GET',
    });
  
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    
    const currentDate = new Date();
  
    const finishedRounds = data
      .filter(round => round.finished)
      .map(round => round.round_num);
  
    const maxRoundNum = finishedRounds.length > 0 ? Math.max(...finishedRounds) : 0;
    const currentRound = maxRoundNum + 1;
    setRoundNum(maxRoundNum > 0 ? maxRoundNum + 1 : 1);
  
    const currentRoundObject = data.find(round => round.round_num === currentRound);
  
    if (currentRoundObject) {
      const { is_current, start_date, finished } = currentRoundObject;
      const startDate = new Date(start_date);
      
      if (is_current || (startDate <= currentDate && !finished)) {
        setBlockChanges(true);
      } else {
        setBlockChanges(false);
      }
    }
    return currentRound;
  };

  useEffect(() => {
    const initialize = async () => {
      const currentRoundNum = await fetchRoundStatus();
      fetchRoundGames(currentRoundNum);
    };

    initialize();
  }, []);

  const splitGamesIntoPairs = (games) => {
    let pairs = [];
    // eslint-disable-next-line react/prop-types
    for (let i = 0; i < games.length; i += 2) {
      // eslint-disable-next-line react/prop-types
      pairs.push(games.slice(i, i + 2));
    }
    return pairs;
  };

  const formatTime = (time) => {
    // Create a Date object using the input time as UTC
    const date = new Date(`1970-01-01T${time}Z`); // Treat the time as UTC
  
    // Add 1 hour to the date
    date.setHours(date.getHours() + 1);
  
    // Detect the user's time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
    // Use Intl.DateTimeFormat to format the time to the user's time zone
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: userTimeZone, // Use the detected time zone
    };
  
    // Format the date and return it as a string
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

  const gamePairs = splitGamesIntoPairs(roundGames);

  const renderedCards = gamePairs.map((pair, index) => {
    return (
      <Card 
        key={index} 
        gamePairs={pair.map(game => ({
          ...game,
          game_time: formatTime(game.game_time), // Format the game_time here
        }))} 
        blockChanges={blockChanges} 
        roundNum={roundNum}
      />
    );
  });
  
  return (
    <div className="container-round">
      <div className="round-completed-bar"
           style={{ backgroundColor: '#a000cc'}}>
       
        <div className="rounds" style={{ color:  '#fff'  }}>
          Round {roundNum}
        </div>
        
        <div className="completed-arrow" onClick={toggleVisibility}>
          <span style={{ color: '#fff' }}>{roundNum < currentRoundNum ? 'COMPLETED' : (roundNum === currentRoundNum ? 'UPCOMING' : 'SCHEDULED')}</span>
          <img 
            src={isExpanded ? "/arrow_drop_up.png" : "/arrow_drop_down.png"} 
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

export default ScheduleRounds;
