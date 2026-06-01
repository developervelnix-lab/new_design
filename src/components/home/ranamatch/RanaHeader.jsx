import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSite } from "../../../context/SiteContext";

const RanaHeader = () => {
  const { accountInfo, setShowLogin, setShowRegister } = useSite();
  const navigate = useNavigate();
  const isLoggedIn = !!(accountInfo?.account_id && accountInfo.account_id !== "guest" && localStorage.getItem("auth_secret_key") && localStorage.getItem("auth_secret_key") !== "guest");

  return (
    <>
      {/* TOP BAR */}
      <div className="top-bar">
        <span>🔴 LIVE: 342 Active Players</span>
        <div className="marquee-wrap">
          <div className="marquee-inner">
            <span>🏆 <span className="win">Raj***singh</span> won ₹24,500 on Cricket</span>
            <span>🎰 <span className="win">Anon***87</span> won ₹8,200 on Teen Patti</span>
            <span>⚽ <span className="win">Mukesh***K</span> won ₹41,000 on IPL Match</span>
            <span>🃏 <span className="win">Priya***N</span> won ₹5,600 on Roulette</span>
            <span>🏏 <span className="win">Vijay***35</span> won ₹18,000 on T20 Live</span>
            <span>🏆 <span className="win">Raj***singh</span> won ₹24,500 on Cricket</span>
            <span>🎰 <span className="win">Anon***87</span> won ₹8,200 on Teen Patti</span>
            <span>⚽ <span className="win">Mukesh***K</span> won ₹41,000 on IPL Match</span>
            <span>🃏 <span className="win">Priya***N</span> won ₹5,600 on Roulette</span>
            <span>🏏 <span className="win">Vijay***35</span> won ₹18,000 on T20 Live</span>
          </div>
        </div>
        <div className="top-bar-right">
          <a href="#">📱 App</a>
          <a href="#">🇮🇳 EN</a>
          <a href="#">Help</a>
        </div>
      </div>

      {/* HEADER */}
      <header>
        <div className="header-inner">
          <Link to="/" className="logo">
            <span className="v">R</span><span className="rest">ANA</span><span className="v">MATCH</span>
          </Link>
          <nav>
            <Link to="/" className="active">🏠 Home</Link>
            <Link to="#">🏏 Cricket</Link>
            <Link to="#">⚽ Sports</Link>
            <Link to="/casino">🎰 Casino</Link>
            <Link to="#">🃏 Live Casino</Link>
            <Link to="/teen-patti">🎯 Teen Patti</Link>
            <Link to="/lottery">🎲 Lottery</Link>
            <Link to="/promotion">💰 Promotions</Link>
          </nav>
          <div className="header-cta">
            {isLoggedIn ? (
              <>
                <button className="btn btn-outline" onClick={() => navigate("/deposit")}>Deposit</button>
                <button className="btn btn-brand" onClick={() => navigate("/withdraw")}>Withdraw</button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => setShowLogin(true)}>Log In</button>
                <button className="btn btn-brand" onClick={() => setShowRegister(true)}>Join Now</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* CATEGORY NAV */}
      <div className="cat-nav">
        <div className="cat-nav-inner">
          <a href="#" className="cat-item active">
            <span className="cat-icon">🔥</span>
            <span className="cat-label">Popular</span>
          </a>
          <a href="#" className="cat-item">
            <span className="cat-icon">🏏</span>
            <span className="cat-label">Cricket</span>
          </a>
          <a href="#" className="cat-item">
            <span className="cat-icon">⚽</span>
            <span className="cat-label">Football</span>
          </a>
          <a href="#" className="cat-item">
            <span className="cat-icon">🎰</span>
            <span className="cat-label">Slots</span>
          </a>
          <a href="#" className="cat-item">
            <span className="cat-icon">🃏</span>
            <span className="cat-label">Live Casino</span>
          </a>
          <a href="#" className="cat-item">
            <span className="cat-icon">🎯</span>
            <span className="cat-label">Teen Patti</span>
          </a>
          <a href="#" className="cat-item">
            <span className="cat-icon">🎲</span>
            <span className="cat-label">Roulette</span>
          </a>
          <a href="#" className="cat-item">
            <span className="cat-icon">🤑</span>
            <span className="cat-label">Crash</span>
          </a>
          <a href="#" className="cat-item">
            <span className="cat-icon">🏆</span>
            <span className="cat-label">Tournaments</span>
          </a>
          <a href="#" className="cat-item">
            <span className="cat-icon">💎</span>
            <span className="cat-label">VIP</span>
          </a>
          <a href="#" className="cat-item">
            <span className="cat-icon">🎁</span>
            <span className="cat-label">Bonus</span>
          </a>
          <a href="#" className="cat-item">
            <span className="cat-icon">🃏</span>
            <span className="cat-label">Andar Bahar</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default RanaHeader;
