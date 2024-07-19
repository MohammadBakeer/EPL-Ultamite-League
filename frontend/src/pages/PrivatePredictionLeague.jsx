import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar.jsx';
import PrivateRounds from '../components/PrivateRounds.jsx';
import { decodeJWT } from '../jwtUtils.js';
import { setLeagueId } from '../redux/leagueSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/FantasyLeague.css';
import '../styles/PrivatePredictionLeague.css';
import '../styles/pagination.css';
import axios from 'axios';

const PrivatePredictionLeague = () => {
  const dispatch = useDispatch();
  const leagueId = useSelector((state) => state.leagueId.leagueId);
  const [predictionData, setPredictionData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedPredictionOption, setSelectedPredictionOption] = useState("allow_any");
  const [isOwner, setIsOwner] = useState(false);
  const [notAllowStarClick, setNotAllowStarClick] = useState(false) //Changes on submit click for option type and when atleast 1 star is selected or max 4 stars are selected
  const [chosenGames, setChosenGames] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [anyPrivateGames, setAnyPrivateGames] = useState(false) 
  const [starClicked, setStarClicked] = useState(false)

  const itemsPerPage = 5;
 
  useEffect(() => {
    const decodedToken = decodeJWT();
    if (decodedToken && decodedToken.leagueId) {
      dispatch(setLeagueId(decodedToken.leagueId));
    }
    setLoading(false);
  }, [dispatch]);

  const handleFetchPredictionData = async () => {
    if (!leagueId) {
      console.warn('League ID is not available.');
      return;
    }
    const token = sessionStorage.getItem('authToken');
    try {
      const response = await axios.post('http://localhost:3000/api/privateleaguepoints', { leagueId }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const sortedData = response.data.sort((a, b) => b.points - a.points);
      setPredictionData(sortedData);
    } catch (error) {
      console.error('Error fetching prediction data:', error);
    }
  };

  const checkIfOwner = async () => {
    if (!leagueId) {
      console.warn('League ID is not available.');
      return;
    }
    const token = sessionStorage.getItem('authToken');
    try {
      const response = await axios.get(`http://localhost:3000/api/checkIfOwner/${leagueId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setIsOwner(response.data.isOwner);
    } catch (error) {
      console.error('Error checking if owner:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      handleFetchPredictionData();
      checkIfOwner();
    }
  }, [leagueId, loading]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = predictionData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(predictionData.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const Pagination = () => (
    <div className="pagination">
      <button className="pagination-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <span className="pagination-of">{`${currentPage} of ${totalPages}`}</span>
      <button className="pagination-button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );

  const handleOptionChange = async (event) => {
    const newPredictionOption = event.target.value;
    setSelectedPredictionOption(newPredictionOption);

    if (!leagueId) {
      console.warn('League ID is not available.');
      return;
    }

    const token = sessionStorage.getItem('authToken');
    try {
      await axios.post('http://localhost:3000/api/storePrivatePredictionOption', {
        leagueId,
        roundNum: 2,  // Adjust this if you have dynamic round numbers
        predictionType: newPredictionOption
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Prediction option stored successfully');
    } catch (error) {
      console.error('Error storing prediction option:', error);
    }
  };

  const fetchPredictionOptionType = async () => {
    if (!leagueId) {
      console.warn('League ID is not available.');
      return;
    }
  
    const token = sessionStorage.getItem('authToken');
    const roundNum = 2; // Adjust as needed
  
    try {
      const response = await axios.get(`http://localhost:3000/api/fetchOptionType/${leagueId}/${roundNum}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      setSelectedPredictionOption(response.data.prediction_type);
      console.log("type: ", response.data.prediction_type);
    } catch (error) {
      console.error('Error fetching prediction option type:', error);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
        if (!leagueId) {
            console.warn('League ID is not available.');
            return;
        }

        const token = sessionStorage.getItem('authToken');

        try {
            // Fetch prediction data
            await handleFetchPredictionData();

            // Check if owner
            await checkIfOwner();

            // Fetch prediction option type
            await fetchPredictionOptionType();

            // Fetch submit status
            const roundNum = 2

            const response = await axios.get(
                `http://localhost:3000/api/fetchSubmitStatus/${roundNum}/${leagueId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setIsSubmitted(response.data.isSubmitted);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    if (!loading) {
        fetchData();
    }
}, [leagueId, loading]);


  const saveSubmitStatus = async (leagueId, roundNum, isSubmitted) => {
    const token = sessionStorage.getItem('authToken');
  
    try {
      const response = await axios.post(
        `http://localhost:3000/api/saveSubmitStatus`,
        {
          leagueId,
          roundNum,
          isSubmitted,
          selectedPredictionOption,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Submission status saved:', response.data);
    } catch (error) {
      console.error('Error saving submission status:', error);
    }
  };
  
  const handleOptionTypeSubmit = () => {
    
    if (chosenGames.length >= 1 && chosenGames.length < 5) {
      setNotAllowStarClick(true);
      setIsSubmitted(true);
      // Call saveSubmitStatus function
      const roundNum = 2; // Adjust as needed
      saveSubmitStatus(leagueId, roundNum, true);
    }
  };

useEffect(()=>{
  if(anyPrivateGames === true && isSubmitted === false && selectedPredictionOption === "allow_any"){
    setIsSubmitted(true)
    const roundNum = 2; // Adjust as needed
    saveSubmitStatus(leagueId, roundNum, isSubmitted)
  }
})
  
  useEffect(()=>{
    if(isSubmitted === true ){
      setNotAllowStarClick(true);
    }
  }, [isSubmitted])

  if(isSubmitted === false && starClicked === true){
    setStarClicked
  }

  return (
    <div>
      <Navbar />
      <h2>Private Prediction League</h2>
      <div className="prediction-table-wrapper">
        <Pagination />
        <table className="prediction-table">
          <thead>
            <tr>
              <th className="username-column">Username</th>
              <th className="points-column">Points</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td className="username-column">{item.teamName}</td>
                <td className="points-column">{item.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isOwner && (
        <div className="prediction-options-container">
          <div className="prediction-options">
            <h3 className="prediction-options-header">Choose a prediction option for Round {2}:</h3>
            <div className="prediction-option">
              <label>
                <input
                  type="radio"
                  value="allow_any"
                  checked={selectedPredictionOption === "allow_any"}
                  onChange={handleOptionChange}
                  className="prediction-option-input"
                  disabled={isSubmitted || starClicked} 
                />
                Allow members to predict any 4 games
              </label>
            </div>
            <div className="prediction-option">
              <label>
                <input
                  type="radio"
                  value="choose_games"
                  checked={selectedPredictionOption === "choose_games"}
                  onChange={handleOptionChange}
                  className="prediction-option-input"
                  disabled={isSubmitted || starClicked} 
                />
                Choose the 4 games for members to make predictions on
              </label>
            </div>
            {selectedPredictionOption !== "allow_any" && (
              <button 
                className="option-type-submit" 
                onClick={handleOptionTypeSubmit} 
                disabled={isSubmitted} // Disable when isSubmitted is true
              >
                Submit
              </button>
            )}
          </div>
        </div>
      )}
      <PrivateRounds
        number={2}
        defaultExpanded={true}
        roundbarText="Make 4 predictions per round"
        predictionOption={selectedPredictionOption}
        isOwner={isOwner}
        notAllowStarClick={notAllowStarClick} 
        setChosenGames={setChosenGames} // Pass setter function
        setAnyPrivateGames={setAnyPrivateGames}
        setStarClicked={setStarClicked}
        isSubmitted={isSubmitted}

      />
    </div>
  ); 
};

export default PrivatePredictionLeague;
