// Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Leaderboard.css'; // Ensure the correct path to your CSS file
import { useParams } from 'react-router-dom';
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


const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dbuserId, setDbUserId] = useState([]);
  const itemsPerPage = 10;
  const [viewAllow, setViewAllow] = useState(false)
  const { viewId, setViewId } = useUser();
  const navigate = useNavigate();

  const { userId } = useParams();

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/getLeaderboardDataForAllUsers`);
        setLeaderboardData(response.data);
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

  return (
    <div className="leaderboard-page">
      <div className="leader-nav-bar">
        <Link to={`/home/${userId}`} className="leader-nav-item" title="Home">
          <i className="fas fa-home"></i>
        </Link>
        <Link to={`/leaderboard/${userId}`} className="leader-nav-item" title="Leaderboard">
          <i className="fas fa-trophy"></i>
        </Link>
        <Link to={`/predictor/${userId}`} className="leader-nav-item" title="Predictor">
          <i className="fas fa-futbol"></i>
        </Link>
        <Link to={`/rules/${userId}`} className="leader-nav-item" title="Rules">
          <i className="fas fa-scroll"></i>
        </Link>
        <Link to={`/schedule/${userId}`} className="leader-nav-item" title="Schedule">
          <i className="fas fa-calendar-alt"></i>
        </Link>
      </div>
      <div className="main-leader">
        <div className="leader-heading">
          <h1 className="leaderboard-heading">Leaderboard</h1>
        </div>
        <div className="pag-table">
          <div className="page-change">
            <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={onPageChange} />
          </div>
          <div className="leaderboard-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team</th>
                  <th>Squad</th>
                  <th>Budget</th>
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
                    <td>{team.totalBudget}</td>
                    <td>{team.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
