import React from 'react';
import { Link } from 'react-router-dom';

const RanaFooter = () => {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <span className="v">R</span><span className="rest">ANA</span><span className="v">MATCH</span>
            </Link>
            <p>The premium destination for online betting, live casino, and sports. Licensed and regulated for your security. Join thousands of winners today.</p>
            <div className="footer-social">
              <a href="#">TW</a>
              <a href="#">FB</a>
              <a href="#">IG</a>
              <a href="#">TG</a>
            </div>
          </div>
          <div className="footer-col">
            <h5>Casino</h5>
            <ul>
              <li><Link to="#">Slots</Link></li>
              <li><Link to="#">Live Casino</Link></li>
              <li><Link to="#">Table Games</Link></li>
              <li><Link to="#">Crash Games</Link></li>
              <li><Link to="#">Lottery</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Sports</h5>
            <ul>
              <li><Link to="#">Cricket</Link></li>
              <li><Link to="#">Football</Link></li>
              <li><Link to="#">Tennis</Link></li>
              <li><Link to="#">Kabaddi</Link></li>
              <li><Link to="#">Virtual Sports</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><Link to="/promotion">Promotions</Link></li>
              <li><Link to="#">VIP Program</Link></li>
              <li><Link to="/inviteandearn">Refer a Friend</Link></li>
              <li><Link to="#">App Download</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Support</h5>
            <ul>
              <li><Link to="/support">Contact Us</Link></li>
              <li><Link to="#">FAQ</Link></li>
              <li><Link to="/rules-regulation">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/responsible-gambling">Responsible Gaming</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Ranamatch. All rights reserved.</p>
          <div className="payment-icons">
            <span className="pay-icon">UPI</span>
            <span className="pay-icon">Paytm</span>
            <span className="pay-icon">PhonePe</span>
            <span className="pay-icon">GPay</span>
            <span className="pay-icon">Crypto</span>
            <span className="age-badge">18+</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default RanaFooter;
