import React, { useEffect, useState } from 'react';
import { useSite } from "../../../context/SiteContext";
import { apiGet } from "../../../utils/apiFetch";

const RanaSidebarRight = () => {
  const { accountInfo, setShowLogin, setShowRegister } = useSite();
  const [recentWins, setRecentWins] = useState([]);
  const [winsLoading, setWinsLoading] = useState(true);
  const isLoggedIn = !!(
    accountInfo?.account_id &&
    accountInfo.account_id !== "guest" &&
    localStorage.getItem("auth_secret_key") &&
    localStorage.getItem("auth_secret_key") !== "guest"
  );

  const formatBalance = (value) =>
    Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const realBalance = formatBalance(accountInfo?.account_balance);
  const casinoBonus = formatBalance(accountInfo?.account_casino_bonus);
  const sportsBonus = formatBalance(accountInfo?.account_sports_bonus);
  const totalBalance = formatBalance(accountInfo?.account_total_balance ?? accountInfo?.account_balance);

  useEffect(() => {
    let isMounted = true;

    const loadRecentWins = async () => {
      try {
        const response = await apiGet("route-big-wins", { LIMIT: "10" });
        const result = await response.json();

        if (isMounted) {
          setRecentWins(result?.status_code === "success" && Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error("Failed to load recent wins", error);
        if (isMounted) setRecentWins([]);
      } finally {
        if (isMounted) setWinsLoading(false);
      }
    };

    loadRecentWins();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <aside className="sidebar-right">
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
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Log in to access your account or register to get started.
                </p>
              </div>
              <button className="btn btn-brand btn-full" onClick={() => setShowLogin(true)}>
                Login Securely
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="auth-tabs">
              <div className="auth-tab active" style={{ width: '200%' }}>My Profile</div>
            </div>
            <div className="auth-body">
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: '18px', color: '#111827', margin: 0, lineHeight: 1.15 }}>
                  {accountInfo?.account_username}
                </h3>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '10px',
                    margin: '4px 0 0',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em'
                  }}
                >
                  Account Overview
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                {[
                  { label: 'Real Balance', value: realBalance, strong: true },
                  { label: 'Casino Bonus', value: casinoBonus },
                  { label: 'Sports Bonus', value: sportsBonus },
                  { label: 'Total Balance', value: totalBalance, strong: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: '10px 10px 9px',
                      borderRadius: '14px',
                      background: 'rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      minHeight: '68px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '8px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
                        color: 'var(--text-muted)',
                        marginBottom: '6px'
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', lineHeight: 1 }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand)' }}>₹</span>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: item.strong ? '14px' : '13px', fontWeight: 900, color: '#111827' }}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-outline btn-full"
                onClick={() => {
                  localStorage.removeItem("auth_secret_key");
                  localStorage.removeItem("account_id");
                  window.location.reload();
                }}
              >
                Log Out
              </button>
            </div>
          </>
        )}
      </div>

      <div className="side-section">
        <div className="side-title">🏆 Recent Big Wins</div>
        <div className="wins-list">
          {winsLoading ? (
            <div className="win-item">
              <div className="win-info">
                <div className="win-user">Loading live wins...</div>
                <div className="win-game">Fetching real backend data</div>
              </div>
            </div>
          ) : recentWins.length > 0 ? (
            recentWins.map((win, index) => (
              <div className="win-item" key={`${win.user}-${win.game}-${index}`}>
                <div className={`win-avatar gt-${(index % 4) + 1}`}>{win.avatar}</div>
                <div className="win-info">
                  <div className="win-user">{win.user}</div>
                  <div className="win-game">{win.game}</div>
                </div>
                <div className="win-amount">₹{win.amount}</div>
              </div>
            ))
          ) : (
            <div className="win-item">
              <div className="win-info">
                <div className="win-user">No live wins found</div>
                <div className="win-game">Real wins will appear after profitable bets</div>
              </div>
            </div>
          )}
        </div>
      </div>

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
