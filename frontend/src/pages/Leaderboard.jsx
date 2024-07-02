// Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Leaderboard.css'; // Ensure the correct path to your CSS file
import { decodeJWT } from '../jwtUtils.js';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';





const Pagination = ({ totalPages, currentPage, onPageChange }) => (
  <div className="pagination">
    <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
      <FontAwesomeIcon icon={faChevronLeft} />
    </button>

    <span className="of">{`${currentPage} of ${totalPages}`}</span>

    <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
      <FontAwesomeIcon icon={faChevronRight} />
    </button>
  </div>
);

const CreateLeagueModal = ({ onClose }) => {

  const [leagueName, setLeagueName] = useState('');
  const [startRound, setStartRound] = useState(1);

  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;


  const handleCreateLeague = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('authToken');
  

      const response = await axios.post(
        'http://localhost:3000/api/createleague', 
        {
          leagueName,
          ownerId: userId, 
          startRound
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }
      );
  
      console.log(response.data.message); 
      onClose(); 
    } catch (error) {
      console.error('Error creating league:', error.message); 
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create New League</h2>
        <form onSubmit={handleCreateLeague}>
          <label>
            League Name:
            <input 
              type="text" 
              value={leagueName} 
              onChange={(e) => setLeagueName(e.target.value)} 
              maxLength={20} 
              required
            />
          </label>
          <label>
            Points Start Round:
            <select value={startRound} onChange={(e) => setStartRound(Number(e.target.value))}>
              {Array.from({ length: 38 }, (_, index) => (
                <option key={index} value={index + 1}>
                  Round {index + 1}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Create</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};



const JoinLeagueModal = ({ onClose }) => {

  const [leagueCode, setLeagueCode] = useState('');

  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;

  const handleJoinLeague = async (e) => {
    e.preventDefault();
  
    try {
      const token = sessionStorage.getItem('authToken');
        console.log(token);
      const response = await axios.post(
        'http://localhost:3000/api/joinleague',
        {
          userId, 
          leagueCode 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log(response.data.message);
      onClose();
    } catch (error) {
      console.error('Error joining league:', error.message);
    }
  };
  

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Join League</h2>
        <form onSubmit={handleJoinLeague}>
          <label>
            League Code:
            <input 
            type="text" 
            value={leagueCode}
            onChange={(e) => setLeagueCode(e.target.value)} />
          </label>
          <button type="submit">Join</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};








const Leaderboard = () => {

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dbuserId, setDbUserId] = useState([]);
  const itemsPerPage = 10;
  const [viewAllow, setViewAllow] = useState(false)
  const { viewId, setViewId } = useUser();
  const navigate = useNavigate();

  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // Fetch JWT token from session storage
        const token = sessionStorage.getItem('authToken');

        // Make a GET request to fetch leaderboard data with authorization header
        const response = await axios.get('http://localhost:3000/api/alldataleaderboard', {
          headers: {
            'Authorization': `Bearer ${token}` // Pass the token in the Authorization header
          }
        });

        // Set leaderboard data in state
        setLeaderboardData(response.data);

        // Extract userIds from response data and set in state
        const userIds = response.data.map(item => item.userId);
        setDbUserId(userIds);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error.message);
      }
    };

    fetchLeaderboardData();
  }, []); 

  const sortedData = [...leaderboardData].sort((a, b) => b.totalPrice - a.totalPrice);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const remainingBlankRows = itemsPerPage - currentItems.length;
  const displayItems = [
    ...currentItems,
    ...Array.from({ length: remainingBlankRows }, (_, index) => ({ emptyRow: true, id: `empty-${index}` })),
  ].map((team, index) => ({
    ...team,
    teamName: team.emptyRow ? 'NONE' : team.teamName,
    totalBudget: team.emptyRow ? 'NONE' : team.totalBudget,
    totalPrice: team.emptyRow ? 'NONE' : team.totalPrice,
    rank: index + 1 + indexOfFirstItem,
  }));

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewSquadClick = (viewUserId) => {
    // Set viewId in the UserContext
    setViewId(viewUserId);
    setViewAllow(true)
  };
  console.log(viewAllow);

  useEffect(() => {
if(viewAllow){
      navigate(`/squad-view/${userId}`);
}
}, [viewAllow]);


  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState(false);
  const [showJoinLeagueModal, setShowJoinLeagueModal] = useState(false);

  return (
    <div className="leaderboard-page">
       {showCreateLeagueModal && <CreateLeagueModal onClose={() => setShowCreateLeagueModal(false)} />}
       {showJoinLeagueModal && <JoinLeagueModal onClose={() => setShowJoinLeagueModal(false)} />}
      <div className="leader-nav-bar">
        <Link to={`/home`} className="leader-nav-item" title="Home">
          <i className="fas fa-home"></i>
        </Link>
        <Link to={'/leaderboard'} className="leader-nav-item" title="Leaderboard">
          <i className="fas fa-trophy"></i>
        </Link>
        <Link to={`/predictor`} className="leader-nav-item" title="Predictor">
          <i className="fas fa-futbol"></i>
        </Link>
        <Link to={`/rules`} className="leader-nav-item" title="Rules">
          <i className="fas fa-scroll"></i>
        </Link>
        <Link to={`/schedule`} className="leader-nav-item" title="Schedule">
          <i className="fas fa-calendar-alt"></i>
        </Link>
      </div>
      <div className="main-leader">
        <div className="leader-heading">
          {/* <h1 className="leaderboard-heading">Leaderboard</h1> */}
          <h1 className="leaderboard-heading">Leagues</h1>
        </div>
        <div className='league-buttons'>
          <button onClick={() => setShowCreateLeagueModal(true)}>Create new league</button>
          <button onClick={() => setShowJoinLeagueModal(true)}>Join league</button>
        </div>
        <div className='cards-container'>
          <div className='card'>
            <div className='card-title'>
              <h4>Global league</h4>
            </div>
            <div className="leaderboard-container">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>Squad</th>
                    {/* <th>Budget</th> */}
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((team, index) => (
                    <tr key={team.emptyRow ? team.id : index} className={team.rank <= 1 ? 'highlighted' : ''}>
                      <td>{team.rank}</td>
                      <td>{team.teamName}</td>
                      <td>
                        {team.emptyRow ? (
                          <button disabled>View Squad</button>
                        ) : (
                          <button onClick={() => handleViewSquadClick(team.userId)}>
                            View Squad
                          </button>
                        )}
                      </td>
                      {/* <td>{team.totalBudget}</td> */}
                      <td>{team.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className='card'>
            <h1>This is where it shows the players private leagues he is in.</h1>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Leaderboard;
