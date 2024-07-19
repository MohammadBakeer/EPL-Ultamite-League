import React, { useState, useEffect } from 'react';
import Badges from '../../../images/badges/exportBadges.js'; // Adjust the path as per your project structure
import axios from 'axios';
import '../../../styles/cards.css'

function TeamCard({ gameId, roundNum, team1Name, matchDate, matchTime, team2Name }) {
  // State to manage whether the prediction button is clicked
  const [isPredicted, setIsPredicted] = useState(false);
  // State to manage the input values for the match score
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const token = sessionStorage.getItem('authToken'); 

  const fetchMatchPredictions = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/getRoundPredictions/${roundNum}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const predictions = response.data;
      console.log(predictions.length);
      if(predictions.length >= 3){
      

      }
      else if(predictions.length < 3){

      }

     const matchPrediction = predictions.find(prediction => prediction.game_id === gameId);
    
      if (matchPrediction) {
        setTeam1Score(matchPrediction.team_1_result);
        setTeam2Score(matchPrediction.team_2_result);
        setIsPredicted(true);
      } else {
        setIsPredicted(false);
        setTeam1Score('');
        setTeam2Score('');
      }
      setIsLoading(false);

    } catch (error) {
      console.error('Error fetching round games:', error.message);
      setIsLoading(false);
    }
  };

  const handlePredictionClick = () => {
    setIsPredicted(true);
  }; 


  // Function to handle cancel prediction
  const handleCancelPrediction = async () => {
    try {
      if (isPredicted) {
        const response = await axios.delete(`http://localhost:3000/api/deleteGlobalPrediction/${gameId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 200) {
   
          setIsPredicted(false);
          setTeam1Score('');
          setTeam2Score('');
        
        } else {
          console.warn('Failed to delete prediction.');
        }
      } else {
        setIsPredicted(false);
        setTeam1Score('');
        setTeam2Score('');
      }
    } catch (error) {
      console.error('Error deleting prediction:', error.message);
    }
  };

  // Function to handle save prediction
  const handleSavePrediction = async () => {
    // Check if both scores are provided
    if (!team1Score || !team2Score) {
      console.warn('Please enter scores for both teams.');
      return;
    }
  
    // Parse scores to integers
    const parsedTeam1Score = parseInt(team1Score, 10);
    const parsedTeam2Score = parseInt(team2Score, 10);
  
    // Check if both scores are non-negative integers
    if (parsedTeam1Score < 0 || parsedTeam2Score < 0) {
      console.warn('Please enter positive scores.');
      return;
    }
  
    try {
      // Send the scores to the server
      const response = await axios.post('http://localhost:3000/api/storeGlobalPredictions', {
        team1Score: parsedTeam1Score,
        team2Score: parsedTeam2Score,
        roundNum,
        gameId
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.status === 200) {
        setIsPredicted(true);
      } else {
        console.warn('Failed to save prediction.');
      }
    } catch (error) {
      console.error('Error saving prediction:', error);
    }
  };

  useEffect(() => {
    fetchMatchPredictions();
  }, [roundNum, gameId, token]);

  // Function to get badge URL based on team name
  const getBadgeForTeam = (teamName) => {
    const badgeImage = Badges[teamName];
    return badgeImage || ''; // Return badge URL or empty string if not found
  };

  // Get badge URLs for both teams
  const team1Badge = getBadgeForTeam(team1Name);
  const team2Badge = getBadgeForTeam(team2Name);


  return (
    <div className="teams-card">
      <div className="card-header">
        {/* Assuming leagueName is static, you can make it dynamic if needed */}
        <img src="https://assets.codepen.io/285131/pl-logo.svg" alt="league" />
        <p>English Premier League</p>
      </div>

      <div className="card-contents">
        <div className="column-first-team">
          <img src={team1Badge} alt={`${team1Name} badge`} />
          <p>{team1Name}</p>
        </div>

        <div className="column-match-result">
          <div className="match-date">
            <p>{matchDate} at <strong>{matchTime}</strong></p>
          </div>
          {/* Conditionally render input fields for score */}
          {isPredicted && !isLoading ? (
            <div className="match-score">
              <input 
                type="number" 
                className="match-score-number" 
                value={team1Score} 
                onChange={(e) => setTeam1Score(e.target.value)} 
              />
              <span className="match-score-divider">:</span>
              <input 
                type="number" 
                className="match-score-number" 
                value={team2Score} 
                onChange={(e) => setTeam2Score(e.target.value)} 
              />
            </div>
          ) : null}
          {/* Conditionally render buttons based on prediction state */}
          {isPredicted ? (
            <div className="prediction-buttons">
              <button className="cancel-btn" onClick={handleCancelPrediction}>Cancel</button>
              <button className="save-btn" onClick={handleSavePrediction}>Save</button>
            </div>
          ) : (
            <button 
            className="prediction-btn" 
            onClick={handlePredictionClick} 
          >
            Make Prediction
          </button>
          )}
        </div>

        <div className="column-second-team">
          <img src={team2Badge} alt={`${team2Name} badge`} />
          <p>{team2Name}</p>
        </div>
      </div>
    </div>
  );
}

function Card({ gamePairs }) {
  return (
    <div className="container">
      <div className="teams-card-container">
        {gamePairs.map((pair) => {
       
          return (
            <TeamCard
              key={pair.game_id} // Add a unique key to each card
              team1Name={pair.team_1}
              matchDate={new Date(pair.game_date).toLocaleDateString()}
              matchTime={new Date(pair.game_date).toLocaleTimeString()}
              team2Name={pair.team_2}
              roundNum={pair.round_num} 
              gameId={pair.game_id}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Card;
