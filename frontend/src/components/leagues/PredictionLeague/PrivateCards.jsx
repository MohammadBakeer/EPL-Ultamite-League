//PrivateCards.jsx

import React, { useState, useEffect } from 'react';
import Badges from '../../../images/badges/exportBadges.js'; // Adjust the path as per your project structure
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../../styles/cards.css'


function TeamCard({ gameId, roundNum, team1Name, matchDate, matchTime, team2Name, choose_cards, isOwner, notAllowStarClick, setChosenGames, onStarStatusChange, setAnyPrivateGames, predictionOption, setStarClicked, isSubmitted, blockChanges }) {
  const leagueId = useSelector((state) => state.leagueId.leagueId); 
  const [isPredicted, setIsPredicted] = useState(false);
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [matchedPrediction, setMatchedPrediction] = useState([]);
  const [leagueMemberStar, setLeagueMemberStar] = useState(false)

 
  const navigate = useNavigate();

  const token = sessionStorage.getItem('authToken'); 

  // Function to handle the prediction button click
  const handlePredictionClick = () => {
    if(blockChanges){
      toast.error(`Round ${roundNum} Predictions Window Closed `);
      return
    }
    setIsPredicted(true);
  };


  useEffect(() => {
    const fetchChosenGames = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/fetchChosenGames/${leagueId}/${roundNum}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const chosenGamesData = response.data;
      
        setChosenGames(chosenGamesData); 
       
        const gameIds = chosenGamesData.map(game => game.game_id);

        setIsStarred(gameIds.includes(gameId));
        
        gameIds.forEach(gameId => {
          if (gameIds.includes(gameId)) {
           
            onStarStatusChange(gameId, true); 
          }
        });
        
   
        if (chosenGamesData.length > 0) {
          setStarClicked(true); // Set starClicked to true if there are games in the response
          setLeagueMemberStar(true)
        }
        
      } catch (error) {
        console.error('Error fetching chosen games:', error.message);
      }
    };

    fetchChosenGames();
  }, [leagueId, roundNum, token, gameId, isStarred]);


  

  const handleStarClick = async () => {
    if (isStarred) {

    } else {
      setIsStarred(true); // Star the game
      setStarClicked(true);
      try {
        const response = await axios.post('http://localhost:3000/api/storeChooseCard', {
          gameId,
          leagueId,
          roundNum
        }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
  
        if (response.status === 200) {

       
        } else {
          console.warn('Failed to save card choice.');
        }
      } catch (error) {
        console.error('Error saving card choice:', error);
      }
    }
  };


  // Function to handle cancel prediction
  const handleCancelPrediction = async () => {
    if(blockChanges){
      toast.error(`Round ${roundNum} Predictions Window Closed `);
      return
    }
    try {
      if (isPredicted) {
        const response = await axios.delete(`http://localhost:3000/api/deletePrivatePrediction/${gameId}/${leagueId}`, {
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
      } 

    } catch (error) {
      if (error.response && error.response.status === 404) {

        console.warn('No prediction found to delete.');
        setIsPredicted(false);
        setTeam1Score('');
        setTeam2Score('');
      } else {
        console.error('Error deleting prediction:', error.message);
      }
    }
  };
  

  // Function to handle save prediction
  const handleSavePrediction = async () => {

    if(blockChanges){
      toast.error(`Round ${roundNum} Predictions Window Closed `);
      return
    }

    const score1 = parseInt(team1Score);
    const score2 = parseInt(team2Score);
  
    if (isNaN(score1) && isNaN(score2)) {
      toast.error('Please enter at least one score for the teams.');
      return;
    }
  
    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      toast.error('Scores must be valid non-negative numbers.');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3000/api/storePrivatePredictions', {
        team1Score: team1Score ? parseInt(team1Score) : null, // Allow null if not provided
        team2Score: team2Score ? parseInt(team2Score) : null, // Allow null if not provided
        roundNum,
        gameId,
        leagueId
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });
  
      if (response.status === 200) {
     
         if (predictionOption === "allow_any" ) {
        setAnyPrivateGames(true);
      }
        setIsPredicted(true);
      } else {
        console.warn('Failed to save prediction.');
      }
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.error === 'Cannot save prediction: maximum number of predictions reached for this league and round.') {
        toast.error('Only 4 predictions per round');
      } else {
        console.error('Error saving prediction:', error);
      }
    }
  };
  
  useEffect(() => {
    const fetchMatchPredictions = async () => {
      
      try {
        const response = await axios.get(`http://localhost:3000/api/getPrivateRoundPredictions/${roundNum}/${leagueId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        const predictions = response.data;

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



useEffect(()=>{
  const fetchPredictionOptionType = async () => {
    if (!leagueId) {
      console.warn('League ID is not available.');
      return;
    }
  
    const token = sessionStorage.getItem('authToken');
  
    try {
      const response = await axios.get(`http://localhost:3000/api/fetchOptionType/${leagueId}/${roundNum}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const type = response.data.prediction_type;

      if(type === "allow_any" && matchedPrediction.length >= 1){

        setAnyPrivateGames(true)
      }

    } catch (error) {
      console.error('Error fetching prediction option type:', error);

    }
  };

  fetchPredictionOptionType()

}, [matchedPrediction])



useEffect(() => {
  const fetchAllMatchPredictions = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/getAllPrivateRoundPredictions/${roundNum}/${leagueId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const predictions = response.data;
      const matchPrediction = predictions.filter(prediction => prediction.game_id === gameId);
      setMatchedPrediction(matchPrediction); 
 
    } catch (error) {
      console.error('Error fetching round games:', error.message);
      setIsLoading(false);
    }
  };
  fetchAllMatchPredictions();
}, []);


  return (
    <div className="teams-card">
      <div className="card-header">
        {/* Assuming leagueName is static, you can make it dynamic if needed */}
        <img src="/epl-badge.png" alt="league" />
        <p>English Premier League</p>
        {choose_cards && (
          <div className={`star ${isStarred ? 'filled' : ''}`} 
          onClick={isOwner ? handleStarClick : null} // Only allow star click if isOwner is true
          >
            {isStarred ? '★' : '☆'}
          </div>
        )}
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
              disabled={choose_cards ? !notAllowStarClick : false || (leagueMemberStar && !isSubmitted)}
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


function Card({ gamePairs, choose_cards, isOwner, setChosenGames, notAllowStarClick, isExpanded, setAnyPrivateGames, predictionOption, setStarClicked, isSubmitted, blockChanges }) {
  const [starredGameIds, setStarredGameIds] = useState([]);
  const [filteredGamePairs, setFilteredGamePairs] = useState(gamePairs);

  const handleStarStatusChange = (gameId, isStarred) => {
    setStarredGameIds(prevIds => 
      isStarred ? [...prevIds, gameId] : prevIds.filter(id => id !== gameId)
    );
  };

  // Update filteredGamePairs whenever gamePairs, choose_cards, notAllowStarClick, starredGameIds, or isExpanded changes
  useEffect(() => {

    const updatedFilteredGamePairs = choose_cards && notAllowStarClick
      ? gamePairs.filter(pair => starredGameIds.includes(pair.game_id))
      : gamePairs;

    setFilteredGamePairs(updatedFilteredGamePairs);
  }, [gamePairs, choose_cards, notAllowStarClick, starredGameIds, isExpanded]); // Add dependencies


  return (
      <div className="teams-card-container">
        {filteredGamePairs.map(pair => (
          <TeamCard
            key={pair.game_id} // Ensure unique keys
            team1Name={pair.team_1}
            matchDate={new Date(pair.game_date).toLocaleDateString()}
            matchTime={pair.game_time}
            team2Name={pair.team_2}
            roundNum={pair.round_num} 
            gameId={pair.game_id}
            choose_cards={choose_cards}
            isOwner={isOwner}
            notAllowStarClick={notAllowStarClick}
            setChosenGames={setChosenGames} // Pass setter function
            onStarStatusChange={handleStarStatusChange}
            setAnyPrivateGames={setAnyPrivateGames}
            predictionOption={predictionOption}
            setStarClicked={setStarClicked}
            isSubmitted={isSubmitted}
            blockChanges={blockChanges}

          />
        ))}
      </div>
  );
}

export default Card;