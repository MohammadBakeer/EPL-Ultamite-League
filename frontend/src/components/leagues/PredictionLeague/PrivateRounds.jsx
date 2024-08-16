import React, { useState, useEffect } from 'react';
import Card from './PrivateCards.jsx';
import axios from 'axios';
import '../../../styles/roundBars.css'

function Rounds({ defaultExpanded, roundbarText, predictionOption, isOwner, notAllowStarClick, setChosenGames, setAnyPrivateGames, setStarClicked, isSubmitted }) {

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [roundGames, setRoundGames] = useState([]);
  const [roundNum, setRoundNum] = useState(null)
  const [blockChanges, setBlockChanges] = useState(false)

  const toggleVisibility = () => {
    setIsExpanded(prevState => !prevState);
  };


    const fetchRoundGames = async (roundNum) => {

      try {
        const token = sessionStorage.getItem('authToken'); // Fetch JWT token from session storage
        // Make a GET request to fetch round games data with authorization header
        const response = await axios.get(`https://epl-ultimate-league-server.up.railway.app/api/getRoundGames/${roundNum}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
   
        setRoundGames(response.data)

      } catch (error) {
        console.error('Error fetching round games:', error.message);
      }
    };

    const fetchRoundStatus = async () => {
    
      const token = sessionStorage.getItem('authToken');
      const response = await fetch('https://epl-ultimate-league-server.up.railway.app/api/getRoundStatus', {
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
    const initialize = async () => {
      const currentRoundNum = await fetchRoundStatus(); 
      fetchRoundGames(currentRoundNum)
    };

    initialize();
  }, []);



  //New table to just store which option the owner chose for his leagues round. League_id, round_num, and prediction_type will be stored here.
  //When a private prediction is made first have to query above to see what kind then make new coulmn in preivate prediciton to store that type here

  const splitGamesIntoPairs = (games) => {
    let pairs = [];
    for (let i = 0; i < games.length; i += 2) {
      pairs.push(games.slice(i, i + 2));
    }
    return pairs;
  };

  const gamePairs = splitGamesIntoPairs(roundGames);

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



  const choose_cards =  predictionOption === 'choose_games';

  const renderedCards = [];
  gamePairs.forEach((pair, index) => {
    renderedCards.push(
      <Card
        key={index}
        gamePairs={pair.map(game => ({
          ...game,
          game_time: formatTime(game.game_time), // Format the game_time here
        }))}
        choose_cards={choose_cards}
        isOwner={isOwner}
        notAllowStarClick={notAllowStarClick}
        setChosenGames={setChosenGames} 
        isExpanded={isExpanded} 
        setAnyPrivateGames={setAnyPrivateGames}
        predictionOption={predictionOption}
        setStarClicked={setStarClicked}
        isSubmitted={isSubmitted}
        blockChanges={blockChanges}
      />
    );
  });
  

    

    useEffect(()=>{

    },[isExpanded])

  return (
    <div className="container-round">
      <div className="round-completed-bar"
           style={{ backgroundColor:  '#a000cc' }}>
       
        <div className="rounds" style={{ color:  '#fff'  }}>
          Round {roundNum}
        </div>
        
        <div className="completed-arrow" onClick={toggleVisibility}>
          <span style={{ color:  '#fff'  }}>Fixtures</span>
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

export default Rounds;
