import React from 'react';
import Rounds from '../components/leagues/PredictionLeague/GlobalRounds.jsx';
import Title from '../components/Title.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';



function Schedule() {
    return (
        <>
            <Navbar />
            <Title />
            {Array.from({ length: 38 }, (_, i) => (
                <Rounds key={i + 1} number={i + 1} />
            ))}
            <Footer />
     </>

    );
}
export default Schedule