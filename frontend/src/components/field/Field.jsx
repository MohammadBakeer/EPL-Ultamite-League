import React, { useEffect,useState, useRef } from 'react';
import { DefaultShirt, PlayerShirt } from './playerShirts.jsx';
import { toast } from 'react-toastify';

import '../../styles/Field.css'

// Have the API lock changing the teams during the round start and the round num still the same lock ability to change
// Limit the changes per time to 3 
// Check for a round change and do a insert right away in the server

const Field = ({ selectedPlayer, userId, viewId, isClearTeamRequested, onClearTeam, isHomePage, roundNum, blockChanges, deleteCount, changeCount, setDeleteCount, setChangeCount}) => {

    const [formation, setFormation] = useState(["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]) 
    const [playerLineup, setPlayerLineup] = useState(formation)
    const [selectedFormation, setSelectedFormation] = useState(""); 
    const [totalBudget, setTotalBudget] = useState(100);
    const [points, setPoints] = useState(0);
    const [isInitialRender, setIsInitialRender] = useState(true);
    const formationSelectRef = useRef(null);

    useEffect(() => {
      
      if (isClearTeamRequested && blockChanges == false) {
        setPlayerLineup(formation);
        setTotalBudget(100); // Reset totalBudget to the initial value
        setPoints(0); // Reset totalPoints to zero
        onClearTeam(); // Callback to reset isClearTeamRequested in the parent component
      }
    }, [isClearTeamRequested]);



  const fetchUserLineup = async (id, isViewId) => {

  try {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/getUserLineup', {
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

      switch (JSON.stringify(formation)) {
        case JSON.stringify(['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD']):
          setSelectedFormation('fourThreeThree'); // Set selectedFormation
          break;
        case JSON.stringify(['GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD']):
          setSelectedFormation('threeFivetwo'); // Set selectedFormation
          break;
        case JSON.stringify(['GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD']):
          setSelectedFormation('threeFourThree'); // Set selectedFormation
          break;
        case JSON.stringify(['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD']):
          setSelectedFormation('fourFourTwo'); // Set selectedFormation
          break;
        default:
          // Handle any other cases if needed
          break;
      }

      console.log("formation: ", formation);

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
   
        const response = await fetch('http://localhost:3000/api/updateLineup', {
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
          console.log('Lineup and formation updated successfully in the database.');
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
      
      // Create a temporary budget variable
      let tempBudget = totalBudget + (removedPlayer.price || 0);

      // Set the playerLineup state with the temporary lineup
      setPlayerLineup(tempLineup);
    
      // Update the total budget state
      setTotalBudget(tempBudget);

      const newDeleteCount = deleteCount + 1

      setDeleteCount(newDeleteCount)
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

                if (deleteCount > 0) {
                  const newDeleteCount = deleteCount - 1;
                  const newChangeCount = changeCount + 1;
                  setDeleteCount(newDeleteCount);
                  setChangeCount(newChangeCount);
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
          
          if (!blockChanges) {
            if (changeCount < 2) {
              const changedFormation = e.target.value;
              const currentFormation = formation;
        

              // Determine the new formation array
              let newFormation;
              switch (changedFormation) {
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
           
              console.log("currentFormaiton: ", currentFormation);

              let oldFormation;

             
              if (JSON.stringify(currentFormation) === JSON.stringify(["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"])) {
                oldFormation = "fourThreeThree";
              } else if (JSON.stringify(currentFormation) === JSON.stringify(["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "MID", "FWD", "FWD"])) {
                oldFormation = "threeFivetwo";
              } else if (JSON.stringify(currentFormation) === JSON.stringify(["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD", "FWD", "FWD"])) {
                oldFormation = "threeFourThree";
              } else if (JSON.stringify(currentFormation) === JSON.stringify(["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD", "FWD"])) {
                oldFormation = "fourFourTwo";
              } 
            

              // Function to count positions
              const countPositions = (formationArray) => {
                return formationArray.reduce((count, pos) => {
                  count[pos] = (count[pos] || 0) + 1;
                  return count;
                }, {});
              };
        
              const currentCounts = countPositions(currentFormation);
              const newCounts = countPositions(newFormation);
        
              // Variables to store the differences
              let gkDifference = 0;
              let defDifference = 0;
              let midDifference = 0;
              let fwdDifference = 0;
        
              // Loop over currentCounts to determine the difference for each position
              for (let pos in currentCounts) {
                if (currentCounts[pos] > (newCounts[pos] || 0)) {
                  const difference = currentCounts[pos] - (newCounts[pos] || 0);
                  switch (pos) {
                    case 'GK':
                      gkDifference = difference;
                      break;
                    case 'DEF':
                      defDifference = difference;
                      break;
                    case 'MID':
                      midDifference = difference;
                      break;
                    case 'FWD':
                      fwdDifference = difference;
                      break;
                    default:
                      break;
                  }
                }
              }
        
              let positionsToCheck = [];
              
        
              if (gkDifference > 0) {
                positionsToCheck.push({ position: 'GK', count: gkDifference });
              }
              if (defDifference > 0) {
                positionsToCheck.push({ position: 'DEF', count: defDifference });
              }
              if (midDifference > 0) {
                positionsToCheck.push({ position: 'MID', count: midDifference });
              }
              if (fwdDifference > 0) {
                positionsToCheck.push({ position: 'FWD', count: fwdDifference });
              }
              let positionsToCheckCopy = positionsToCheck.map(pos => ({ ...pos }));
        
              // Loop over playerLineup to update positionsToCheck counts
              playerLineup.forEach(player => {
                positionsToCheck.forEach(pos => {
                  if (player === pos.position && pos.count > 0) {
                    pos.count--;
                  }
                });
              });
        
              // Check if all counts in positionsToCheck are 0
              let canChangeFormation = positionsToCheck.every(pos => pos.count === 0);
        
              if (!canChangeFormation) {
                // Notify the user about the positions that need to be deleted
                const positionsToNotify = positionsToCheck
                  .filter(pos => pos.count > 0) // Filter for positions with count > 0
                  .map(pos => pos.position); // Get the position names
              
                if (positionsToNotify.length > 0) {
                  const positionsMessage = positionsToNotify.join(' and '); // Concatenate positions
                  toast.error(`Delete a ${positionsMessage}`); // Show the notification
                
                 setSelectedFormation(oldFormation)
                }
                return;
              }

               gkDifference = 0;
               defDifference = 0;
               midDifference = 0;
               fwdDifference = 0;

              for (let pos in newCounts) {
                if (newCounts[pos] > (currentCounts[pos] || 0)) {
                
                  const difference = newCounts[pos] - (currentCounts[pos] || 0);
              
                  switch (pos) {
                    case 'GK':
                      gkDifference = difference;
                      break;
                    case 'DEF':
                      defDifference = difference;
                    
                      break;
                    case 'MID':
                      midDifference = difference;
               
                      break;
                    case 'FWD':
                      fwdDifference = difference;
                   
                      break;
                    default:
                      break;
                  }
                }
              }
            
          
              let newPositionsToCheck = [];
        
              if (gkDifference > 0) {
                newPositionsToCheck.push({ position: 'GK', count: gkDifference });
              }
              if (defDifference > 0) {
                newPositionsToCheck.push({ position: 'DEF', count: defDifference });
              }
              if (midDifference > 0) {
                newPositionsToCheck.push({ position: 'MID', count: midDifference });
              }
              if (fwdDifference > 0) {
                newPositionsToCheck.push({ position: 'FWD', count: fwdDifference });
              }
              
              console.log('new Positions to check:', newPositionsToCheck);
              console.log("copy: ", positionsToCheckCopy);
              console.log(playerLineup);

              const newPlayerLineup = playerLineup.filter(player => {
                let found = false;
                positionsToCheckCopy.forEach(pos => {
                  if (player === pos.position && pos.count > 0) {
                    pos.count--;
                    found = true;
                  }
                });
                return !found;
              });

        

              newPositionsToCheck.forEach(pos => {
                for (let i = 0; i < newPlayerLineup.length; i++) {
                  const player = newPlayerLineup[i];
                  if (pos.count > 0 && pos.position === player.position) {
                    newPlayerLineup.splice(i + 1, 0, pos.position );
                    pos.count--;
                  }
                }
              });
        
              console.log("newPlayerLineupo: ", newPlayerLineup);
  
              setPlayerLineup(newPlayerLineup)
              // If all positions are checked, allow formation change
              setFormation(newFormation);
   
              setTotalBudget(100); // or any logic you need for budget
            }
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
             <PlayerShirt player={player} key={index} onRemove={handleRemove} isHomePage={isHomePage} blockChanges = {blockChanges} deleteCount = {deleteCount} changeCount = {changeCount} />
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
              setSelectedFormation('fourThreeThree'); // Set selectedFormation
              break;
            case JSON.stringify(['GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD']):
              formationSelectRef.current.value = 'threeFivetwo';
              setSelectedFormation('threeFivetwo'); // Set selectedFormation
              break;
            case JSON.stringify(['GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD']):
              formationSelectRef.current.value = 'threeFourThree';
              setSelectedFormation('threeFourThree'); // Set selectedFormation
              break;
            case JSON.stringify(['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD']):
              formationSelectRef.current.value = 'fourFourTwo';
              setSelectedFormation('fourFourTwo'); // Set selectedFormation
              break;
            default:
              // Handle any other cases if needed
              break;
          }
        }
      }, [formation]);
      

      return (
        <>
         {isHomePage && (
          <div className="team-stats">
            <div>
              <strong>Team Budget:</strong> {totalBudget}
            </div>
            <div>
              <strong>Team Round Points:</strong> {points}
            </div>
          </div>
         )}
       {isHomePage && (
            <div className="formation-dropdown">
                <label htmlFor="formationSelect"></label>
                <select
                    id="formationSelect"
                    value={selectedFormation} // This binds the dropdown to selectedFormation
                    onChange={(e) => {
                        const changedFormation = e.target.value;
                        console.log("Changed formation to:", changedFormation);
                        setSelectedFormation(changedFormation); // Update selectedFormation state
                        handleFormationChange(e); // Call your formation change handler
                    }}
                >
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
     </>
      );
    };
    
    export default Field;
