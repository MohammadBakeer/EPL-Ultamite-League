import React, { useState, useEffect } from 'react';
import Badges from '../images/badges/exportBadges.js'; // Adjust the path as per your project structure
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/cards.css';

function TeamCard({ gameId, roundNum, team1Name, matchDate, matchTime, team2Name, team1Score, team2Score, minute, live, finished }) {
  const [isPredicted, setIsPredicted] = useState(false);

  const getBadgeForTeam = (teamName) => {
    const badgeImage = Badges[teamName];
    return badgeImage || ''; // Return badge URL or empty string if not found
  };

  const team1Badge = getBadgeForTeam(team1Name);
  const team2Badge = getBadgeForTeam(team2Name);

  return (
    <div className="teams-card">
      <div className="card-header">
        {live && (
          <div className="live-status">
            <span className="live-dot"></span>
            <span>Live</span>
          </div>
        )}
         <img src="/epl-badge.png" alt="league" />
        <p>English Premier League</p>
        {live && (
          <div className="live-minute">
            <p>{minute}'</p>
            <div className="live-dash">-</div>
          </div>
        )}
      </div>
      <div className="card-contents">
        <div className="column-first-team">
          <img src={team1Badge} alt={`${team1Name} badge`} />
          <p>{team1Name}</p>
        </div>
        <div className="column-match-result">
          {finished ? ( // Check if the game has finished
            <div className="match-score">
              <input 
                type="number" 
                className="match-score-number" 
                value={team1Score} 
                readOnly
              />
              <span className="match-score-divider">:</span>
              <input 
                type="number" 
                className="match-score-number" 
                value={team2Score} 
                readOnly
              />
            </div>
          ) : (
            <>
              {live && (
                <div className="match-score">
                  <input 
                    type="number" 
                    className="match-score-number" 
                    value={team1Score} 
                    readOnly
                  />
                  <span className="match-score-divider">:</span>
                  <input 
                    type="number" 
                    className="match-score-number" 
                    value={team2Score} 
                    readOnly
                  />
                </div>
              )}
              {!live && (
                <div className="match-date">
                  <p>{matchDate} at <strong>{matchTime}</strong></p>
                </div>
              )}
            </>
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

function Card({ gamePairs, blockChanges, roundNum }) {
  const [scores, setScores] = useState({});

  useEffect(() => {
    if (!blockChanges) return; // if block changes is true we dont want it to return. so change it to !blockChanges when done testing
   
    const fetchLiveScores = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/fetchLiveScores/${roundNum}`);
        
        const data = response.data;
    
        if (data && Array.isArray(data) && data.length > 0) {
          const newScores = {};
          let hasLiveGame = false; // Initialize a flag for live games
    
          data.forEach(game => {
            newScores[game.gameid] = {
              team1Score: game.team1score,
              team2Score: game.team2score,
              minute: game.minute,
              live: game.live,
              finished: game.finished 
            };
            
            // Check if any game has live set to true
            if (game.live) {
              hasLiveGame = true; // Set the flag to true if a live game is found
            }
          });
    
          setScores(newScores);
    
          // If there's no live game, clear the interval
          if (!hasLiveGame) {
            clearInterval(pollingInterval); // Clear the polling interval
         
          }
        } else {

        }
      } catch (error) {
        console.error('Error fetching live scores:', error);
      }
    };
    
    
    fetchLiveScores();
    const pollingInterval = setInterval(fetchLiveScores, 20000);

    return () => clearInterval(pollingInterval);
  }, [blockChanges]);


  const setTeamScores = (gameId, team, score) => {
    setScores(prevScores => ({
      ...prevScores,
      [gameId]: {
        ...prevScores[gameId],
        [team]: score
      }
    }));
  };

  return (
    <div className="teams-card-container">
      {gamePairs.map(pair => {
        const score = scores[pair.game_id] || { team1Score: '', team2Score: '', minute: 0, live: false };

        return (
          <TeamCard
            key={pair.game_id}
            team1Name={pair.team_1}
            matchDate={new Date(pair.game_date).toLocaleDateString()}
            matchTime={pair.game_time}
            team2Name={pair.team_2}
            roundNum={pair.round_num}
            gameId={pair.game_id}
            team1Score={score.team1Score}
            team2Score={score.team2Score}
            minute={score.minute}
            live={score.live} // Pass the live status to TeamCard
            finished={score.finished}
            blockChanges={blockChanges}
            setTeamScores={setTeamScores}
          />
        );
      })}
    </div>
  );
}

export default Card;