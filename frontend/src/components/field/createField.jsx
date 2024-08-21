import React, { useEffect,useState, useRef } from 'react';
import { DefaultShirt, PlayerShirt } from './playerShirts.jsx';
import '../../styles/Field.css'
import '../../styles/Create-Team.css'

// Have the API lock changing the teams during the round start and the round num still the same lock ability to change
// Limit the changes per time to 3 
// Check for a round change and do a insert right away in the server

const Field = ({ selectedPlayer, userId, viewId, isClearTeamRequested, onClearTeam, isHomePage, roundNum, blockChanges }) => {

    const [formation, setFormation] = useState(["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]) 
    const [playerLineup, setPlayerLineup] = useState(formation)
    const [totalBudget, setTotalBudget] = useState(85);
    const [points, setPoints] = useState(0);
    const [isInitialRender, setIsInitialRender] = useState(true);
    const formationSelectRef = useRef(null);

    useEffect(() => {
      
      if (isClearTeamRequested && blockChanges == false) {
        setPlayerLineup(formation);
        setTotalBudget(85); // Reset totalBudget to the initial value
        setPoints(0); // Reset totalPoints to zero
        onClearTeam(); // Callback to reset isClearTeamRequested in the parent component
      }
    }, [isClearTeamRequested]);



  const fetchUserLineup = async (id, isViewId) => {

  try {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('https://epl-ultimate-league-server.up.railway.app/api/getUserLineup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: !isViewId ? id : undefined, // Include userId if not using viewId
        viewId: isViewId ? id : undefined,  // Include viewId if using viewId
        roundNum
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const { formation, playerLineup, totalBudget, points } = data;
      setFormation(formation);
      setPlayerLineup(JSON.parse(playerLineup));
      setTotalBudget(totalBudget);
      setPoints(points);
    } else {
      console.error('Failed to fetch user lineup:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching user lineup:', error.message);
  }
};



useEffect(() => {
  if (roundNum !== null) {
    if (viewId) {
      fetchUserLineup(viewId, true);  // Fetch using viewId
    } else if (userId) {
      fetchUserLineup(userId, false); // Fetch using userId
    }
  }
}, [ roundNum, userId, viewId]);


    
    const updateLineupInDatabase = async () => {
        
      try {
        const token = sessionStorage.getItem('authToken');
   
        const response = await fetch('https://epl-ultimate-league-server.up.railway.app/api/updateLineup', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            formation: formation,
            playerLineup: JSON.stringify(playerLineup), 
            totalBudget: totalBudget,
            roundNum: roundNum,
          }),
        });
  
        if (response.ok) {
       
        } else {
          console.error('Failed to update lineup and formation in the database:', response.statusText);
        }
      } catch (error) {
        console.error('Error updating lineup and formation in the database:', error.message);
      }
    };





    useEffect(() => {
    
      if (!viewId && !isInitialRender) {
        updateLineupInDatabase();
      } else {
        setIsInitialRender(false); // This ensures setIsInitialRender(false) is still called on initial render
      }
    }, [playerLineup]);
    


    

    

    const handleRemove = (removedPlayer) => {
      // Create a temporary lineup based on the current state
      
      const tempLineup = [...playerLineup];
    
      // Find the index of the removed player in the lineup
      const removedPlayerIndex = tempLineup.findIndex((player) => player === removedPlayer);
    
      // Replace the removed player with the default position based on its type
      const defaultPosition = getDefaultPosition(removedPlayer);
      tempLineup[removedPlayerIndex] = defaultPosition;
      
      let priceAsInteger = Math.floor(removedPlayer.price);

      // Create a temporary budget variable
      let tempBudget = totalBudget + (priceAsInteger || 0);

      // Set the playerLineup state with the temporary lineup
      setPlayerLineup(tempLineup);
    
      // Update the total budget state
      setTotalBudget(tempBudget);

    };
    




    
    // Function to get the default position based on the player's type
    const getDefaultPosition = (player) => {
      if (player && player.position) {
        // Check the player's position and return the corresponding default position
        switch (player.position) {
          case "FWD":
            return "FWD";
          case "MID":
            return "MID";
          case "DEF":
            return "DEF";
          case "GK":
            return "GK";
          default:
            return "FWD"; // Default to "FWD" if the position is not recognized
        }
      }
      return "FWD"; // Default to "FWD" if the player or position is not provided
    };
    


  
    useEffect(() => {
      
        if (selectedPlayer) {
     
            let newLineup;
            let lastNameMatch = false;
    
            setPlayerLineup((prevLineup) => {
                newLineup = [...prevLineup];
            
                for (let i = 0; i < newLineup.length; i++) {
                    if (selectedPlayer.lastName === newLineup[i].lastName) {
                        lastNameMatch = true;
                        break;
                    }
                }
                if (lastNameMatch) {
                    return newLineup;
                }
        
                for (let i = 0; i < newLineup.length; i++) {
                    if (newLineup[i] === selectedPlayer.position && totalBudget >= (selectedPlayer.price || 0)) {
                        newLineup[i] = selectedPlayer;
                        setTotalBudget((prevBudget) => prevBudget - (selectedPlayer.price || 0));
                        break;
                    }
                }
                return newLineup;
            });
          }
        
        }, [selectedPlayer]);
      




    
      const handleFormationChange = (e) => {
        if(!blockChanges){
        const formation = e.target.value;

        setFormation(formation);

        // Set the formation to formation
        let newFormation;
        switch (formation) {
            case "fourThreeThree":
                newFormation = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"];
                break;
            case "threeFivetwo":
                newFormation = ["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "MID", "FWD", "FWD"];
                break;
            case "threeFourThree":
                newFormation = ["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD", "FWD", "FWD"];
                break;
            case "fourFourTwo":
                newFormation = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD", "FWD"];
                break;
            default:
                newFormation = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]; // Default to 4-3-3
        }
        let tempBudget = 85;

        setTotalBudget(tempBudget);

        setFormation(newFormation);

        setPlayerLineup(newFormation);
      }
    };  





if (playerLineup.length === 0) {
  setPlayerLineup(formation)
}

    let Lineup = playerLineup.map((position, index) => {
    
        const player = playerLineup[index];
        
        if (position === "FWD") {
          return (
            <DefaultShirt player={player} key={index}/>
          );
        } else if (position === "MID") {
          return (
              <DefaultShirt player={player} key={index}/>
          );
        } else if (position === "DEF") {
          return (
              <DefaultShirt player={player} key={index}/>
          );
        } else if (position === "GK") {
          return (
              <DefaultShirt player={player} key={index}/>
          );
        } else {
            return(
             <PlayerShirt player={player} key={index} onRemove={handleRemove} isHomePage={isHomePage} blockChanges = {blockChanges} />
            )
        }
      });
      let Forward = Lineup.filter((shirt) => shirt.props.player && (shirt.props.player === "FWD" || shirt.props.player.position === "FWD"));
      let Midfield = Lineup.filter((shirt) => shirt.props.player && (shirt.props.player === "MID" || shirt.props.player.position === "MID"));
      let Defense = Lineup.filter((shirt) => shirt.props.player && (shirt.props.player === "DEF" || shirt.props.player.position === "DEF"));
      let Goalkeepr = Lineup.filter((shirt) => shirt.props.player && (shirt.props.player === "GK" || shirt.props.player.position === "GK"));
    




      useEffect(() => {

        // Check if formationSelectRef.current is not null
        if (formationSelectRef.current) {
          // Switch case based on formation to set value of select element
          switch (JSON.stringify(formation)) {
            case JSON.stringify(['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD']):
              formationSelectRef.current.value = 'fourThreeThree';
              break;
            case JSON.stringify(['GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD']):
              formationSelectRef.current.value = 'threeFivetwo';
              break;
            case JSON.stringify(['GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD']):
              formationSelectRef.current.value = 'threeFourThree';
              break;
            case JSON.stringify(['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD']):
              formationSelectRef.current.value = 'fourFourTwo';
              break;
            default:
              // Handle any other cases if needed
              break;
          }
        }
      }, [formation]);




      return (
        <>
        <div className="create-field-component">
         {isHomePage && (
          <div className="team-stats">
            <div>
              <strong>Team Budget:</strong> ${totalBudget}
            </div>
            <div>
              <strong>Team Round Points:</strong> {points}
            </div>
          </div>
         )}
       {isHomePage && (
          <div className="formation-dropdown">
            <label htmlFor="formationSelect"></label>
            <select id="formationSelect" ref={formationSelectRef} onChange={handleFormationChange}>
              <option value="fourThreeThree">4-3-3</option>
              <option value="fourFourTwo">4-4-2</option>
              <option value="threeFivetwo">3-5-2</option>
              <option value="threeFourThree">3-4-3</option>
            </select>
          </div>
       )}
          <div className="field-container">
            <div className="field-lines">
                <div className="field-FWD-line">
                    {Forward}
                </div>
                <div className="field-MID-line">
                    {Midfield}
                </div>
                <div className="field-DEF-line">
                        {Defense}
                </div>
                <div className="field-GK-line">
                    {Goalkeepr}
                </div>
            </div>    
        </div>
        </div>
     </>
      );
    };
    
    export default Field;
