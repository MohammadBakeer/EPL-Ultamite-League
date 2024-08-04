import React, { useState, useEffect } from 'react';
import '../../styles/Table.css';
import { calculatePlayerPrice, updatePlayerPrices  } from './playerPrices'
import { toast } from 'react-toastify';


// onPlayerSelect is a function that takes in the player object from the table and sends it to the create team page to then pass the player object to the Fiel.jsx component
const Table = ({ onPlayerSelect, blockChanges, roundNum }) => {
  
  // State variables to hold table data, current page, filters, and auxiliary data
  const [table, setTable] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [manualPage, setManualPage] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterClub, setFilterClub] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [eplClubs, setEplClubs] = useState([]);

  // Players per table page
  const playersPerPage = 15;

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
        try {

            const token = sessionStorage.getItem('authToken');
          
           
            const playerResponse = await fetch('http://localhost:3000/api/playerNames', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const playerData = await playerResponse.json();

            const teamResponse = await fetch('http://localhost:3000/api/teams', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const teamData = await teamResponse.json();

            const updatedTable = playerData.playerNames.map((player) => {
                const { firstName, lastName, teamId, positionId, ...stats } = player;
                const matchingTeam = teamData.team.find((team) => team.id === teamId);
                   
                if (matchingTeam) {
                    return {
                        firstName,
                        lastName,
                        club: matchingTeam.club,
                        position: mapPosition(positionId),
                        price: '',
                        points: '',
                        roundPoints: 0, 
                        ...stats,
                    };
                } else {
                    console.warn(`No matching team found for player with teamId ${teamId}`);
                    return null;
                }
            });

            // Calculate points and price for each player and sort by price
            const { table: newTable } = calculatePlayerPrice(updatedTable);
              console.log(table);
            const orderedTable = newTable.sort((a, b) => b.price - a.price);
            
            updatePlayerPrices(orderedTable)

            setTable(orderedTable); 

            // Extract unique club names for the filter dropdown
            const eplClubsList = Array.from(new Set(teamData.team.map((team) => team.club)));
            setEplClubs(eplClubsList);
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };

    fetchData();
}, []);


  // Map numerical position IDs to position strings
  const mapPosition = (positionId) => {
    switch (positionId) {
      case 1:
        return 'GK';
      case 2:
        return 'DEF';
      case 3:
        return 'MID';
      case 4:
        return 'FWD';
      default:
        return 'Unknown';
    }
  };

  // Handle page change when clicking next or previous
  const handlePageChange = (direction) => {
    if (direction === 'next') {
      const nextPage = currentPage + 1;
      const lastPage = Math.ceil(table.length / playersPerPage);

      if (direction === 'next' && currentPage < lastPage) {
        setCurrentPage(nextPage);
      }
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    }
  };

  // Handle manual page change via user input
  const handleManualPageChange = () => {
   
    const newPage = parseInt(manualPage, 10);
    if (!isNaN(newPage) && newPage > 0 && newPage <= totalPages) {
      
      setCurrentPage(newPage);
    }
  };

  // Execute manual page change on "Enter" key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualPageChange();
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilterName('');
    setFilterClub('');
    setFilterPosition('');
  };

  // Filter table based on name, club, and position filters
  const filterTable = () => {
    return table.filter((player) => {
      if (player) {
        const nameMatch = player.firstName.toLowerCase().includes(filterName.toLowerCase()) || player.lastName.toLowerCase().includes(filterName.toLowerCase());
        const clubMatch = filterClub === '' || player.club.toLowerCase().includes(filterClub.toLowerCase());
        const positionMatch = filterPosition === '' || player.position.toLowerCase().includes(filterPosition.toLowerCase());
        return nameMatch && clubMatch && positionMatch;
      }
      return false;
    });
  };

  const totalPages = Math.ceil(filterTable().length / playersPerPage);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterName, filterClub, filterPosition]);

  const changesBlocked = () => {
    toast.error(`Round ${roundNum} is Live. Change Window Closed.`);
  };
  

  return (
    <div className="table-container">
      {/* Filter Controls */}
      <div className="filter-container">
        <div className="filter-bars">
          <div className="name-filter">
            <input
              type="text"
              placeholder="Filter by Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="filter-input"
            />
          </div>
          <select
            value={filterClub}
            onChange={(e) => setFilterClub(e.target.value)}
            className="filter-select"
          >
            <option className="All-club" value="">All Clubs</option>
            {eplClubs.map((club, index) => (
              <option key={index} value={club}>
                {club}
              </option>
            ))}
          </select>
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="filter-select"
          >
            <option value="">All Positions</option>
            {['GK', 'DEF', 'MID', 'FWD'].map((position, index) => (
              <option key={index} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleClearFilters} className="clear-filters-btn">
          Clear Filters
        </button>
      </div>

      {/* Manual Page Navigation */}
      <div className="manual-page-input">
        <input
          type="text"
          placeholder={`#`}
          value={manualPage}
          onChange={(e) => setManualPage(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleManualPageChange}>Go to Page</button>
      </div>

      {/* Pagination Controls */}
      <div className="pagination-bar">
        <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages > 0 ? totalPages : 1}
        </span>
        <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
      {/* Player Table */}
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Club</th>
            <th>Position</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {filterTable()
            .slice((currentPage - 1) * playersPerPage, currentPage * playersPerPage)
            .map((player, index) => (
              <tr
                  key={index}
                  onClick={() => {
                    if (blockChanges) {
                      changesBlocked(); // Call changesBlocked if blockChanges is true
                    } else {
                      onPlayerSelect(player); // Call onPlayerSelect if blockChanges is false
                    }
                  }}
                >
                <td>{player.firstName}</td>
                <td>{player.lastName}</td>
                <td>{player.club}</td>
                <td>{player.position}</td>
                <td>{player.price}</td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
