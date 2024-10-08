import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { decodeJWT } from '../jwtUtils.js';
import { setLeagueId } from '../redux/leagueSlice';
import Badges from '../images/badges/exportBadges.js'; // Adjust the path as per your project structure
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { setViewId } from '../redux/viewSlice.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/PrivateFantasyLeague.css'; // Import your CSS for styling
import ConfirmModal from '../components/ConfirmModal';
import ConfirmLeaveModal from '../components/ConfirmLeaveModal';

const ITEMS_PER_PAGE = 10;

const PrivateFantasyLeague = () => {
  const leagueId = useSelector((state) => state.leagueId.leagueId);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  // State variables to store fetched data
  const [leagueName, setLeagueName] = useState('');
  const [leagueBadge, setLeagueBadge] = useState('');
  const [startRound, setStartRound] = useState(0);
  const [members, setMembers] = useState([]);
  const [roundNum, setRoundNum] = useState(null);
  const [memberTeams, setMemberTeams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOwner, setIsOwner] = useState(false);
  const [leagueCode, setLeagueCode] = useState(0)
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    const decodedToken = decodeJWT();
    if (decodedToken && decodedToken.leagueId) {
      dispatch(setLeagueId(decodedToken.leagueId));
    }
  }, [dispatch]);

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

    const finishedRounds = data
      .filter(round => round.finished)
      .map(round => round.round_num);

    const maxRoundNum = finishedRounds.length > 0 ? Math.max(...finishedRounds) : 0;
    const currentRound = maxRoundNum + 1;

    setRoundNum(maxRoundNum > 0 ? maxRoundNum + 1 : 1);

    return currentRound;
  };

  const fetchMembersTeams = async (memberIds, roundNum, startRound) => {
    const token = sessionStorage.getItem('authToken');
    try {
      const response = await fetch(`https://epl-ultimate-league-server.up.railway.app/api/fetchMembersTeams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberIds, roundNum, startRound })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setMemberTeams(data);
    } catch (error) {
      console.error('Failed to fetch members teams:', error);
    }
  };

  const fetchPrivateFantasyLeague = async () => {
    const token = sessionStorage.getItem('authToken');
    try {
      const response = await fetch(`https://epl-ultimate-league-server.up.railway.app/api/fetchPrivateFantasyLeague/${leagueId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
     
      setLeagueName(data.leagueName);
      setLeagueBadge(data.leagueBadge);
      setStartRound(data.startRound);
      setMembers(data.members);

      return { memberIds: data.members, startRound: data.startRound };
    } catch (error) {
      console.error('Failed to fetch private fantasy league data:', error);
    }
  };

  const checkIfOwner = async () => {
    if (!leagueId) {
      console.warn('League ID is not available.');
      return;
    }
    const token = sessionStorage.getItem('authToken');
    try {
      const response = await axios.get(`https://epl-ultimate-league-server.up.railway.app/api/checkIfFantasyOwner/${leagueId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const { isOwner, leagueCode } = response.data;

      setIsOwner(isOwner);
    
      if(isOwner){
        setLeagueCode(leagueCode)
      }

    } catch (error) {
      console.error('Error checking if owner:', error);
    }
  };


  useEffect(() => {
    const initialize = async () => {
      if (leagueId) {
        const { memberIds, startRound } = await fetchPrivateFantasyLeague();
        const currentRoundNum = await fetchRoundStatus();
        fetchMembersTeams(memberIds, currentRoundNum, startRound);
        checkIfOwner()
      }
    };
    initialize();
  }, [leagueId]);


  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Calculate the items to display on the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = memberTeams.slice(startIndex, endIndex);
  const totalPages = Math.ceil(memberTeams.length / ITEMS_PER_PAGE);

  const handleDeleteLeague = async () => {
    setShowConfirmModal(true); // Show the confirmation modal
  };

  const handleConfirmDelete = async () => {
    const token = sessionStorage.getItem('authToken');

    try {
      const response = await axios.delete(`https://epl-ultimate-league-server.up.railway.app/api/deleteFantasyLeague/${leagueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        toast.success(`League deleted successfully`);
        navigate('/fantasyleague');
      } else {
        alert('Failed to delete the league.');
      }
    } catch (error) {
      console.error('Error deleting the league:', error);
      alert('An error occurred while deleting the league.');
    } finally {
      setShowConfirmModal(false); // Hide the confirmation modal
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false); // Hide the confirmation modal
  };


  const handleLeaveLeague = () => {
    setShowLeaveModal(true); // Show the leave modal
  };

  const handleConfirmLeave = async () => {
    const token = sessionStorage.getItem('authToken');

    try {
      const response = await axios.delete(`https://epl-ultimate-league-server.up.railway.app/api/leavefantasyleague/${leagueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        toast.success(`Successfully left the league!`);
        navigate('/fantasyleague');
      } else {
        alert('Failed to leave the league.');
      }
    } catch (error) {
      console.error('Error leaving the league:', error);
      alert('An error occurred while leaving the league.');
    } finally {
      setShowLeaveModal(false); // Hide the leave modal
    }
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false); // Hide the leave modal
  };

  const handleTokenUpdate = async (newPayload) => {
    try {
      const response = await axios.post('https://epl-ultimate-league-server.up.railway.app/api/updatetoken', newPayload, {
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

  const currentToken = sessionStorage.getItem('authToken');
  
  const handleViewSquadClick = async (viewUserId) => {
    const newToken = await handleTokenUpdate({ viewId: viewUserId });
    if (newToken) {
      dispatch(setViewId(viewUserId)); 
      navigate('/squad-view');
    }
  };

  return (
    <>
      <Navbar />
      <div className="private-fantasy-league">
        <div className="private-fantasy-league-title">
          <h1>{leagueName}</h1>
          {leagueBadge && (
            <img src={Badges[leagueBadge]} alt={`${leagueBadge} Badge`} className="fantasy-league-badge" />
          )}
        </div>
        <table className="stylish-table">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Points</th>
              <th className="team-view-column">Team View</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((member, index) => (
              <tr key={index}>
                <td>{member.team_name}</td>
                <td>{member.points}</td>
                <td className="team-view-column">
                  <button className='btn-view-table' onClick={() => handleViewSquadClick(member.user_id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="fantasy-pagination">
          <button
            className="fantasy-pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="fantasy-pagination-span">{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            className="fantasy-pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
        {isOwner && (
          <div className="bottom-bar-container">
            <div className="bottom-bar">
              <span className="league-code">League Code: {leagueCode}</span>
              <button className="delete-league-button" onClick={handleDeleteLeague}>
                <FontAwesomeIcon icon={faTrash} /> Delete League
              </button>
            </div>
          </div>
        )}
        {!isOwner && (
          <div className="bottom-bar-container">
            <div className="bottom-bar">
              <button className="delete-league-button" onClick={handleLeaveLeague}>
                <FontAwesomeIcon icon={faTrash} /> Leave League
              </button>
            </div>
          </div>
        )}
        {showConfirmModal && (
          <ConfirmModal
            leagueName={leagueName}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}
          {showLeaveModal && (
          <ConfirmLeaveModal
            leagueName={leagueName}
            onConfirm={handleConfirmLeave}
            onCancel={handleCancelLeave}
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default PrivateFantasyLeague;