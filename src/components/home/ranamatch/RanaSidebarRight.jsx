import React from 'react';
import { useSite } from "../../../context/SiteContext";

const RanaSidebarRight = () => {
  const { accountInfo, setShowLogin, setShowRegister } = useSite();
  const isLoggedIn = !!(accountInfo?.account_id && accountInfo.account_id !== "guest" && localStorage.getItem("auth_secret_key") && localStorage.getItem("auth_secret_key") !== "guest");

  return (
    <aside className="sidebar-right">
      {/* Auth Panel */}
      <div className="auth-panel">
        {!isLoggedIn ? (
          <>
            <div className="auth-tabs">
              <div className="auth-tab active" onClick={() => setShowLogin(true)}>Log In</div>
              <div className="auth-tab" onClick={() => setShowRegister(true)}>Sign Up</div>
            </div>
            <div className="auth-body">
              <div className="form-group">
                <label className="form-label">Ready to win?</label>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Log in to access your account or register to get started.</p>
              </div>
              <button className="btn btn-brand btn-full" onClick={() => setShowLogin(true)}>Login Securely</button>
              
              <div className="auth-divider">OR</div>
              
              <div className="social-login">
                <button className="social-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/>
                  </svg>
                  Google
                </button>
                <button className="social-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="auth-tabs">
              <div className="auth-tab active" style={{width: '200%'}}>My Profile</div>
            </div>
            <div className="auth-body">
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
                <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '18px', color: '#fff', margin: 0 }}>{accountInfo?.account_username}</h3>
                <p style={{ color: 'var(--brand)', fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontWeight: 'bold' }}>₹{accountInfo?.account_balance || '0.00'}</p>
              </div>
              <button className="btn btn-outline btn-full" onClick={() => {
                localStorage.removeItem("auth_secret_key");
                window.location.reload();
              }}>Log Out</button>
            </div>
          </>
        )}
      </div>

      {/* Recent Wins Panel */}
      <div className="side-section">
        <div className="side-title">🏆 Recent Big Wins</div>
        <div className="wins-list">
          <div className="win-item">
            <div className="win-avatar gt-1">👨</div>
            <div className="win-info">
              <div className="win-user">Vikram_99</div>
              <div className="win-game">Crazy Time</div>
            </div>
            <div className="win-amount">₹45,200</div>
          </div>
          <div className="win-item">
            <div className="win-avatar gt-2">👩</div>
            <div className="win-info">
              <div className="win-user">Neha_S</div>
              <div className="win-game">Lightning Roulette</div>
            </div>
            <div className="win-amount">₹18,500</div>
          </div>
          <div className="win-item">
            <div className="win-avatar gt-3">🧑</div>
            <div className="win-info">
              <div className="win-user">Amit_K</div>
              <div className="win-game">Aviator</div>
            </div>
            <div className="win-amount">₹1.2L</div>
          </div>
          <div className="win-item">
            <div className="win-avatar gt-4">👨</div>
            <div className="win-info">
              <div className="win-user">Rahul_B</div>
              <div className="win-game">Teen Patti Live</div>
            </div>
            <div className="win-amount">₹32,000</div>
          </div>
        </div>
      </div>

      {/* App Download */}
      <div className="app-banner">
        <div className="app-icon">📱</div>
        <h4>Download App</h4>
        <p>Get the ultimate betting experience on your mobile</p>
        <div className="app-btns">
          <button className="app-btn">
            <span>🤖</span>
            <div className="app-btn-text">
              <span className="sub">Download for</span>
              <span className="name">Android</span>
            </div>
          </button>
          <button className="app-btn">
            <span>🍏</span>
            <div className="app-btn-text">
              <span className="sub">Download for</span>
              <span className="name">iOS</span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default RanaSidebarRight;
