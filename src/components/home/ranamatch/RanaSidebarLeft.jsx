import React from 'react';
import { Link } from 'react-router-dom';

const RanaSidebarLeft = () => {
  return (
    <aside className="sidebar-left">
      <div className="side-section">
        <div className="side-title">⚽ Sports</div>
        <div className="side-list">
          <Link to="#"><span className="dot"></span>Cricket <span className="live-badge">LIVE</span></Link>
          <Link to="#"><span className="dot"></span>Football <span className="live-badge">LIVE</span></Link>
          <Link to="#"><span className="dot"></span>Tennis</Link>
          <Link to="#"><span className="dot"></span>Basketball</Link>
          <Link to="#"><span className="dot"></span>Kabaddi <span className="live-badge">LIVE</span></Link>
          <Link to="#"><span className="dot"></span>Volleyball</Link>
          <Link to="#"><span className="dot"></span>Horse Racing</Link>
          <Link to="#"><span className="dot"></span>Esports</Link>
        </div>
      </div>
      <div className="side-section">
        <div className="side-title">🎰 Casino Games</div>
        <div className="side-list">
          <Link to="#"><span className="dot"></span>Live Roulette <span className="live-badge">LIVE</span></Link>
          <Link to="#"><span className="dot"></span>Blackjack</Link>
          <Link to="#"><span className="dot"></span>Baccarat <span className="live-badge">LIVE</span></Link>
          <Link to="#"><span className="dot"></span>Teen Patti</Link>
          <Link to="#"><span className="dot"></span>Dragon Tiger</Link>
          <Link to="#"><span className="dot"></span>Andar Bahar</Link>
          <Link to="#"><span className="dot"></span>Sic Bo</Link>
          <Link to="#"><span className="dot"></span>Lucky 7</Link>
        </div>
      </div>
      <div className="side-section">
        <div className="side-title">🎯 Quick Links</div>
        <div className="side-list">
          <Link to="#"><span className="dot"></span>My Account</Link>
          <Link to="/deposit"><span className="dot"></span>Deposit</Link>
          <Link to="/withdraw"><span className="dot"></span>Withdrawal</Link>
          <Link to="/transaction"><span className="dot"></span>Bet History</Link>
          <Link to="/promotion"><span className="dot"></span>Promotions</Link>
          <Link to="#"><span className="dot"></span>VIP Club</Link>
          <Link to="/inviteandearn"><span className="dot"></span>Refer a Friend</Link>
        </div>
      </div>
    </aside>
  );
};

export default RanaSidebarLeft;
