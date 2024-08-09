
import React from "react";
import '../styles/footer.css'

function Footer() {
    return (
        <footer>
            <div className="footer-container">
                
                <div className="social-media">
                    <div className="face-b"><img src="/social-fb-grey.png" alt="fb" /></div>
                    <div className="instagram"><img src="/social-instagram-grey.png" alt="insta" /></div>
                    <div className="linkedin"><img src="/social-linkedin-grey.png" alt="linked" /></div>
                    <div className="twitter"><img src="/social-twitter-grey.png" alt="twitter" /></div>
                </div>
                <div className="privacy">
                    <div className="all-right">Fantasyte LLC 2024. All rights reserved</div>
                    <div className="line">|</div>
                    <div className="policy">Privacy Policy</div>
                </div>
            </div>
      </footer>
    );
}

export default Footer