import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSite } from '../../../context/SiteContext';
import { apiPost } from '../../../utils/apiFetch';
import { liveSport } from '../../jsondata/live';

const RanaSidebarLeft = () => {
  const navigate = useNavigate();
  const { setShowLogin, refreshSiteData } = useSite();
  const [sportsLoading, setSportsLoading] = useState(false);

  const openSportsProvider = async (providerName) => {
    const authSecretKey = localStorage.getItem("auth_secret_key");
    const userId = localStorage.getItem("account_id");

    if (!authSecretKey || authSecretKey === "guest" || !userId || userId === "guest") {
      setShowLogin(true);
      return;
    }

    const gameObj = liveSport?.find((game) => game["Game Name"] === providerName);
    if (!gameObj || sportsLoading) return;

    setSportsLoading(true);
    try {
      const response = await apiPost("route-play-games", {
        USER_ID: userId,
        GAME_NAME: gameObj["Game Name"],
        GAME_UID: gameObj["Game UID"],
      });
      const data = await response.json();

      if (data.status_code === "success" && data.data?.game_url) {
        const encodedUrl = btoa(data.data.game_url);
        navigate(`/game-url/${encodeURIComponent(encodedUrl)}/${encodeURIComponent(gameObj["Game Name"])}`);
      } else if (data.status_code === "authorization_error" || data.status_code === "auth_error") {
        localStorage.removeItem("auth_secret_key");
        localStorage.removeItem("account_id");
        refreshSiteData();
        setShowLogin(true);
      }
    } finally {
      setSportsLoading(false);
    }
  };

  const handleSportClick = (event, providerName) => {
    event.preventDefault();
    openSportsProvider(providerName);
  };

  return (
    <aside className="sidebar-left">
      <div className="side-section">
        <div className="side-title">⚽ Sports</div>
        <div className="side-list">
          <Link to="#" onClick={(event) => handleSportClick(event, "Luck Sports")}><span className="dot"></span>Cricket <span className="live-badge">LIVE</span></Link>
          <Link to="#" onClick={(event) => handleSportClick(event, "Luck Sports")}><span className="dot"></span>Football <span className="live-badge">LIVE</span></Link>
          <Link to="#" onClick={(event) => handleSportClick(event, "SABA Sports")}><span className="dot"></span>Tennis</Link>
          <Link to="#" onClick={(event) => handleSportClick(event, "SABA Sports")}><span className="dot"></span>Basketball</Link>
          <Link to="#" onClick={(event) => handleSportClick(event, "SABA Sports")}><span className="dot"></span>Kabaddi <span className="live-badge">LIVE</span></Link>
          <Link to="#" onClick={(event) => handleSportClick(event, "SABA Sports")}><span className="dot"></span>Volleyball</Link>
          <Link to="#" onClick={(event) => handleSportClick(event, "SABA Sports")}><span className="dot"></span>Horse Racing</Link>
          <Link to="#" onClick={(event) => handleSportClick(event, "SABA Sports")}><span className="dot"></span>Esports</Link>
        </div>
      </div>
      <div className="side-section">
        <div className="side-title">🎰 Casino Games</div>
        <div className="side-list">
          <Link to="/roulette"><span className="dot"></span>Live Roulette <span className="live-badge">LIVE</span></Link>
          <Link to="/blackjack"><span className="dot"></span>Blackjack</Link>
          <Link to="/baccarat"><span className="dot"></span>Baccarat <span className="live-badge">LIVE</span></Link>
          <Link to="/teen-patti"><span className="dot"></span>Teen Patti</Link>
          <Link to="/dragon-tiger"><span className="dot"></span>Dragon Tiger</Link>
          <Link to="/andar-bahar"><span className="dot"></span>Andar Bahar</Link>
          <Link to="/sic-bo"><span className="dot"></span>Sic Bo</Link>
          <Link to="/lucky-7"><span className="dot"></span>Lucky 7</Link>
        </div>
      </div>
      <div className="side-section">
        <div className="side-title">🎯 Quick Links</div>
        <div className="side-list">
          <Link to="#"><span className="dot"></span>My Account</Link>
          <Link to="/deposit"><span className="dot"></span>Deposit</Link>
          <Link to="/withdraw"><span className="dot"></span>Withdrawal</Link>
          <Link to="/betting-profit-loss"><span className="dot"></span>Bet History</Link>
          <Link to="/promotion"><span className="dot"></span>Promotions</Link>
          <Link to="#"><span className="dot"></span>VIP Club</Link>
          <Link to="/inviteandearn"><span className="dot"></span>Refer a Friend</Link>
          <Link to="/rules-regulation"><span className="dot"></span>Rules</Link>
          <Link to="/exclusion"><span className="dot"></span>Exclusion</Link>
          <Link to="/privacy-policy"><span className="dot"></span>Privacy</Link>
          <Link to="/responsible-gambling"><span className="dot"></span>Responsible</Link>
          <Link to="/support"><span className="dot"></span>Support</Link>
        </div>
      </div>
    </aside>
  );
};

export default RanaSidebarLeft;
