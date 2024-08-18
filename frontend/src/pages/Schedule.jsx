import { useEffect, useState } from 'react';
import axios from 'axios';
import Rounds from '../components/ScheduleRounds.jsx';
import Title from '../components/Title.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';


function Schedule() {
    const [groupedRounds, setGroupedRounds] = useState([]);
    const [onSchedulePage, setOnSchedulePage] = useState(false);
    const [currentRoundNum, setCurrentRoundNum] = useState(null);

    const fetchRoundStatus = async () => {
        if (onSchedulePage) {
            return;
        }
        const token = sessionStorage.getItem('authToken');
        const response = await fetch('http://localhost:3000/api/getRoundStatus', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        // const currentDate = new Date();

        const finishedRounds = data
            .filter(round => round.finished)
            .map(round => round.round_num);

        const maxRoundNum = finishedRounds.length > 0 ? Math.max(...finishedRounds) : 0;
        const currentRound = maxRoundNum + 1;
     
     
        setCurrentRoundNum(currentRound);
    };

    const groupGamesByRound = (games) => {
        return games.reduce((acc, game) => {
            let roundGroup = acc.find(round => round.round_num === game.round_num);

            if (!roundGroup) {
                roundGroup = { round_num: game.round_num, games: [] };
                acc.push(roundGroup);
            }

            roundGroup.games.push(game);
            return acc;
        }, []);
    };

    const fetchAllRoundGames = async () => {
        try {
            const token = sessionStorage.getItem('authToken');
            const response = await axios.get('http://localhost:3000/api/getAllRoundGames', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const games = response.data;
            const groupedGames = groupGamesByRound(games);
        
        groupedGames.sort((a, b) => a.round_num - b.round_num);

        setGroupedRounds(groupedGames);

        } catch (error) {
            console.error('Error fetching round games:', error.message);
        }
    };

    useEffect(() => {
        fetchAllRoundGames();
        setOnSchedulePage(true);
        fetchRoundStatus();
    }, []);



    return (
        <>
            <Navbar />
            <Title />
            {groupedRounds.map((round) => (
                <Rounds
                    key={round.round_num}
                    roundnum={round.round_num}
                    games={round.games}
                    onSchedulePage={onSchedulePage}
                    currentRoundNum={currentRoundNum} // Pass currentRoundNum as a prop
                   
                />

        ))} 
            <Footer />
            
        </>
    )
}

export default Schedule;


