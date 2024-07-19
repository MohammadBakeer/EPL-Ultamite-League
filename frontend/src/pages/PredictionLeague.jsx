// PredictionLeague.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/FantasyLeague.css'; // Ensure the correct path to your CSS file
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setViewId } from '../redux/viewSlice.js';
import { setLeagueId } from '../redux/leagueSlice.js'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import CreateLeagueModal from '../components/league/CreateLeagueModal.jsx'
import JoinLeagueModal from '../components/league/JoinLeagueModal.jsx'
import LeagueBadgeModal from '../components/league/LeagueBadgeModal.jsx'; // Import LeagueBadgeModal directly
import Badges from '../images/badges/exportBadges.js'; // Adjust the path as per your project structure
import Navbar from '../components/Navbar.jsx'
import GlobalRounds from '../components/GlobalRounds.jsx'





const Leaderboard = () => {

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [privateLeagues, setPrivateLeagues] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState(false);
  const [showJoinLeagueModal, setShowJoinLeagueModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false); // State for badge selection modal
  const [selectedBadge, setSelectedBadge] = useState(null); // State to hold selected badge
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const dispatch = useDispatch();



  useEffect(() => {
    const fetchPrivateLeagues = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
  
        const response = await axios.get('http://localhost:3000/api/privateteamleagues', {
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.data.message === 'No leagues found for this user.') {
        
          console.log('No leagues found for this user.');

          setPrivateLeagues([]); // Set empty array or handle as needed
        } else {
          setPrivateLeagues(response.data);
        }
  
      } catch (error) {
        console.error('Error fetching league data:', error.message);
      }
    };
  
    fetchPrivateLeagues();
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

  const currentToken = sessionStorage.getItem('authToken');

 const handleTokenUpdate = async (newPayload) => {
    try {
      const response = await axios.post('http://localhost:3000/api/updatetoken', newPayload, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      const newToken = response.data.token;
      sessionStorage.setItem('authToken', newToken);
      return newToken;
    } catch (error) {
      console.error('Error updating token:', error.message);
      return null;
    }
  };

  const handleViewSquadClick = async (viewUserId) => {
    const newToken = await handleTokenUpdate({ viewId: viewUserId });
    if (newToken) {
      dispatch(setViewId(viewUserId)); 
      navigate('/squad-view');
    }
  };

  const handleViewLeagueClick = async (newLeagueId) => {
    const newToken = await handleTokenUpdate({ leagueId: newLeagueId });
    if (newToken) {
      dispatch(setLeagueId(newLeagueId));
      navigate('/privatepredictionleague');
    }
  };

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

  const handleOpenBadgeModal = () => {
    setShowBadgeModal(true);
  };

  const handleSelectBadge = (badgeName) => {
    setSelectedBadge(badgeName);
    setShowBadgeModal(false);
    setShowCreateLeagueModal(true); // Show the CreateLeagueModal after badge selection
  };

  const handleBackToBadgeSelection = () => {
    setShowBadgeModal(true); // Show badge selection modal again
    setSelectedBadge(null); // Reset selected badge
    setShowCreateLeagueModal(false); // Hide CreateLeagueModal on cancel
  };


  const NoPrivateLeaguesMessage = (
    <div className="no-leagues-message">
      <p className="no-leagues-text">Create or Join your first private league</p>
      <p className="no-leagues-info">Leagues with 20 people or more can apply to earn prizes for the top 3 of their private league.</p>
      <div className="league-buttons">
        <button className="create-league-button" onClick={() => handleOpenBadgeModal()}>Create new league</button>
        <button className="join-league-button" onClick={() => setShowJoinLeagueModal(true)}>Join league</button>
      </div>
    </div>
  );


   return (
    <>
    < Navbar/>
    <div className="leaderboard-page">
       {showBadgeModal && <LeagueBadgeModal onClose={() => setShowBadgeModal(false)} onSelectBadge={handleSelectBadge} />}
      {showCreateLeagueModal && <CreateLeagueModal onClose={() => setShowCreateLeagueModal(false)}  selectedBadge={selectedBadge} />}
      {showJoinLeagueModal && <JoinLeagueModal onClose={() => setShowJoinLeagueModal(false)} />}
      <div className="main-leader">
        <div className="leader-heading">
          <h1 className="leaderboard-heading">Prediction Leagues</h1>
        </div>
        <div className='league-buttons'>
          {privateLeagues.length > 0 && (
            <>
              <button onClick={() => setShowBadgeModal(true)}>Create new league</button>
              <button onClick={() => setShowJoinLeagueModal(true)}>Join league</button>
            </>
          )}
        </div>       
        <div className='cards-container'>
          <div className='league-card'>
            {/* Pagination component */}
            <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={onPageChange} />
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
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((team, index) => (
                    <tr key={team.emptyRow ? team.id : team.userId} className={team.rank <= 1 ? 'highlighted' : ''}>
                      <td>{team.rank}</td>
                      <td>{team.teamName}</td>
                      <td>
                        {team.emptyRow ? (
                          <button disabled>View Squad</button>
                        ) : (
                          <button onClick={() => handleViewSquadClick(team.userId)}>
                            View
                          </button>
                        )}
                      </td>
                      <td>{team.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="league-card">
            <h1>Private leagues</h1>
            <div className="private-leagues-container">
            { privateLeagues.length === 0 ? (
                NoPrivateLeaguesMessage
              ) : (
                privateLeagues.map((league, index) => (
                  <div key={league.leagueId || `fake-${index}`} className="private-league-row">
                     <img src={Badges[league.leagueBadge]} alt="League Badge" className="league-badge" />
                    <span className="league-name">{league.leagues}</span>
                    <button className="view-league-button" onClick={() => handleViewLeagueClick(league.leagueId)}>View League</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="prediction-league-global-header-container">
          <h3 className="prediction-league-global-header">
            Global League Predictions
          </h3>
        </div>
        <GlobalRounds number={2} defaultExpanded={true} roundbarText="Make 3 predictions per round" />
      </div>
    </div>
    </>
  );
};
export default Leaderboard;
