import React, { useState, useEffect } from 'react';
import '../styles/Table.css';

const Table = ({ onPlayerSelect }) => {
  const [table, setTable] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [manualPage, setManualPage] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterClub, setFilterClub] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [eplClubs, setEplClubs] = useState([]);
  const [positions, setPositions] = useState(['GK', 'DEF', 'MID', 'FWD']);
  const playersPerPage = 15;

  const calculatePointsAndPrice = (table) => {
    table.forEach((player) => {
      let points = 0;
      let price = player.price || 0; // Assuming a default value for price

      switch (player.position) {
        case 'FWD':
          points += player.goalsScored * 14;
          points += player.assists * 10;
          points += player.cleanSheets * 4;
          points += player.goalsConceded * -1;
          points += player.yellowCards * -5;
          points += player.redCards * -15;
          points += Math.floor(player.minutes / 90) * 10;
          break;
        case 'MID':
          points += player.goalsScored * 18;
          points += player.assists * 10;
          points += player.cleanSheets * 6;
          points += player.goalsConceded * -3;
          points += player.yellowCards * -2;
          points += player.redCards * -8;
          points += Math.floor(player.minutes / 90) * 10;
          break;
        case 'DEF':
          points += player.goalsScored * 20;
          points += player.assists * 15;
          points += player.cleanSheets * 18;
          points += player.goalsConceded * -5;
          points += player.yellowCards * -2;
          points += player.redCards * -8;
          points += Math.floor(player.minutes / 90) * 15;
          break;
        case 'GK':
          points += player.cleanSheets * 25;
          points += player.goalsConceded * -10;
          points += player.penaltiesSaved * 50;
          points += player.saves * 4;
          points += Math.floor(player.minutes / 90) * 10;
          break;

        default:
          break;
      }

      let additionalPrice = Math.floor(points / 50) * 25;
      price += additionalPrice;

      player.points = points;
      player.price = price;
    });


    return {
      table
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assuming you have a proper endpoint to fetch player data
        const playerResponse = await fetch('http://localhost:3000/playerNames/api');
        const playerData = await playerResponse.json();

      // Assuming you have a proper endpoint to fetch team data
      const teamResponse = await fetch('http://localhost:3000/teams/api');
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
            ...stats,
            };
          } else {
            console.warn(`No matching team found for player with teamId ${teamId}`);
            return null;
          }
        });

        const { table: newTable } = calculatePointsAndPrice(updatedTable);
        const orderedTable = newTable.sort((a, b) => b.price - a.price);
        setTable(orderedTable);

        const eplClubsList = Array.from(new Set(teamData.team.map((team) => team.club)));
        setEplClubs(eplClubsList);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();

  }, []);

  
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


  const handlePageChange = (direction) => {
    if (direction === 'next') {
      const nextPage = currentPage + 1;
      const lastPage = Math.ceil(table.length / playersPerPage);
  
      if (nextPage <= lastPage && filterTable().slice(nextPage * playersPerPage, (nextPage + 1) * playersPerPage).length > 0) {
        setCurrentPage(nextPage);
      }
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    }
  };

  const handleManualPageChange = () => {
    const newPage = parseInt(manualPage, 10);
    if (!isNaN(newPage) && newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualPageChange();
    }
  };

  const handleClearFilters = () => {
    setFilterName('');
    setFilterClub('');
    setFilterPosition('');
  };

  const filterTable = () => {
    const filteredTable = table.filter((player) => {
      if (player) {
        const nameMatch = player.lastName.toLowerCase().includes(filterName.toLowerCase());
        const clubMatch =
          filterClub === '' || player.club.toLowerCase().includes(filterClub.toLowerCase());
        const positionMatch =
          filterPosition === '' || player.position.toLowerCase().includes(filterPosition.toLowerCase());
  
        return nameMatch && clubMatch && positionMatch;
      }
      return false;
    });
    return filteredTable;
  };

  const totalPages = Math.ceil(filterTable().length / playersPerPage) - 1;
  
  useEffect(() => {
    // Reset to page 1 whenever any filter changes
    setCurrentPage(1);
  }, [filterName, filterClub, filterPosition]);

  return (
    <div className='table-container'>
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
    {positions.map((position, index) => (
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
      <div className="manual-page-input">
        <input
          type="text"
          placeholder={`#`}
          value={manualPage}
          onChange={(e) => setManualPage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleManualPageChange}>Go to Page</button>
      </div>
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
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Club</th>
            <th>Position</th>
            <th>Price</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {filterTable().slice((currentPage - 1) * playersPerPage, currentPage * playersPerPage).map((player, index) => (
            <tr key={index} onClick={() => onPlayerSelect(player)}>
              <td>{player.firstName}</td>
              <td>{player.lastName}</td>
              <td>{player.club}</td>
              <td>{player.position}</td>
              <td>{player.price}</td>
              <td>{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
