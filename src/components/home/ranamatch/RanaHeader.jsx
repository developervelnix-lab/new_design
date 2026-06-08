import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSite } from "../../../context/SiteContext";
import { URL as BASE_URL } from "../../../utils/constants";
import { FaBars, FaBell, FaGem, FaGift, FaMoon, FaSun, FaTimes, FaUserCircle } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";
import { usePWAInstall } from "../../../hooks/usePWAInstall";

const RanaHeader = ({ onOpenMobileMenu, onOpenMobileAccount }) => {
  const { accountInfo, activateDemoMode, setShowLogin, setShowRegister } = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isInstalled, isInstallable, installApp, platform } = usePWAInstall();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(null);
  const isLoggedIn = !!(accountInfo?.account_id && accountInfo.account_id !== "guest" && localStorage.getItem("auth_secret_key") && localStorage.getItem("auth_secret_key") !== "guest");
  const toNumber = (value) => Number.parseFloat(value || 0) || 0;
  const remainingWager = toNumber(accountInfo?.tbl_requiredplay_balance);
  const casinoBonus = Math.max(toNumber(accountInfo?.tbl_bonus_balance), toNumber(accountInfo?.account_casino_bonus));
  const sportsBonus = Math.max(toNumber(accountInfo?.tbl_sports_bonus), toNumber(accountInfo?.account_sports_bonus));
  const activeBonus = casinoBonus + sportsBonus;
  const isWagering = isLoggedIn && (remainingWager > 0.1 || activeBonus > 0.1);
  const wagerRequired = toNumber(accountInfo?.wagering_required);
  const wagerCompleted = toNumber(accountInfo?.wagering_completed);
  const wagerPct = isWagering && wagerRequired > 0
    ? Math.min(100, Math.round((wagerCompleted / wagerRequired) * 100))
    : 0;
  const wagerStatusText = wagerRequired > 0
    ? `₹${wagerCompleted.toLocaleString("en-IN")} / ₹${wagerRequired.toLocaleString("en-IN")}`
    : `₹${remainingWager.toLocaleString("en-IN")} left`;
  const getAccountValue = (...keys) => {
    for (const key of keys) {
      const value = accountInfo?.[key];
      if (value !== undefined && value !== null && String(value).trim() !== "") return value;
    }
    return "Not added";
  };
  const openProfileLink = (path) => {
    setProfileOpen(false);
    navigate(path);
  };
  const handleGetApp = (event) => {
    event?.preventDefault();

    if (isInstalled) {
      window.open(window.location.origin, '_blank', 'noopener,noreferrer');
      return;
    }

    if (isInstallable) {
      installApp();
      return;
    }

    if (platform === 'android') {
      window.open(accountInfo?.service_app_download_url || '/ranamatch.apk', '_blank', 'noopener,noreferrer');
      return;
    }

    window.open(window.location.origin, '_blank', 'noopener,noreferrer');
  };
  const profileDetails = [
    { label: "User ID", value: accountInfo?.account_id || localStorage.getItem("account_id") || "Not added" },
    { label: "Username", value: getAccountValue("account_username", "username", "user_name") },
    { label: "Email", value: getAccountValue("account_email", "email", "user_email", "account_mail") },
    { label: "Mobile", value: getAccountValue("account_mobile", "mobile", "user_mobile", "account_phone", "phone") },
  ];
  const mobileProfileDetails = [
    { label: "Username", value: getAccountValue("account_username", "username", "user_name") },
    { label: "User ID", value: accountInfo?.account_id || localStorage.getItem("account_id") || "Not added" },
    { label: "Mobile", value: getAccountValue("account_mobile", "mobile", "user_mobile", "account_phone", "phone") },
    { label: "Email", value: getAccountValue("account_email", "email", "user_email", "account_mail") },
  ];
  const profileLinks = [
    { label: "My Tickets", path: "/support?view=history" },
    { label: "Change Password", path: "/change-password" },
    { label: "Refer & Earn", path: "/inviteandearn" },
    { label: "Transaction", path: "/transaction" },
    { label: "Bet History", path: "/betting-profit-loss" },
  ];
  const mobileQuickLinks = [
    { label: "My Account", action: () => setMobilePanel("account") },
    { label: "Deposit", path: "/deposit" },
    { label: "Withdrawal", path: "/withdraw" },
    { label: "Bet History", path: "/betting-profit-loss" },
    { label: "Promotions", path: "/promotion" },
    { label: "Bonus", path: "/bonus" },
    { label: "VIP Club", path: "#" },
    { label: "Refer a Friend", path: "/inviteandearn" },
    { label: "Rules", path: "/rules-regulation" },
    { label: "Exclusion", path: "/exclusion" },
    { label: "Privacy", path: "/privacy-policy" },
    { label: "Responsible", path: "/responsible-gambling" },
    { label: "Support", path: "/support" },
  ];
  const latestNewsItems = [
    "New Live Casino Games launching in 7 days",
    "Mega Slots Tournament starts in 10 days",
    "Weekly Cashback update version 2.0 releasing soon",
    "New Bonus System upgrade in 15 days",
  ];
  const isHomeActive = location.pathname === "/" && !location.hash;
  const isHashActive = (hash) => location.pathname === "/" && location.hash === hash;
  const isPathActive = (path) => location.pathname === path;
  const navClass = (active) => (active ? "active" : undefined);
  const catClass = (path) => `cat-item${isPathActive(path) ? " active" : ""}`;
  const goCategory = (event, path) => {
    event.preventDefault();
    navigate(path);
  };
  const goHomeSection = (event, hash) => {
    event.preventDefault();
    navigate(`/${hash}`);
    window.setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };
  const isMobileViewport = () => window.matchMedia?.("(max-width: 820px)").matches;
  const formatBalance = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const openMobilePanel = (panel) => {
    setMenuOpen(false);
    setProfileOpen(false);
    setMobilePanel(panel);
  };
  const closeMobilePanel = () => setMobilePanel(null);
  const handleProfileClick = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (isMobileViewport()) {
      openMobilePanel("account");
      return;
    }

    setProfileOpen((prev) => !prev);
  };
  const handleMobileMenuClick = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (isMobileViewport()) {
      openMobilePanel("menu");
      return;
    }

    setMenuOpen((prev) => !prev);
  };
  const handleMobileNavigate = (path) => {
    closeMobilePanel();
    if (path && path !== "#") navigate(path);
  };

  useEffect(() => {
    if (mobilePanel) {
      document.body.classList.add("mobile-home-menu-open");
    } else {
      document.body.classList.remove("mobile-home-menu-open");
    }

    return () => document.body.classList.remove("mobile-home-menu-open");
  }, [mobilePanel]);

  // Logo URL Helper - resolve backend relative paths
  const getSafeLogoUrl = (logoPath) => {
    if (!logoPath || logoPath === "/favicon.png" || logoPath.includes('favicon.png')) return "/banner/image.png";
    if (logoPath.startsWith('http') || logoPath.startsWith('data:')) return logoPath;
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    return `${base}${path}`;
  };

  return (
    <div className="rana-header-shell">
      {/* TOP BAR */}
      <div className="top-bar">
        <span
          style={{
            background: 'linear-gradient(90deg, #050812 0%, #081224 100%)',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Latest News
        </span>
        <div className="marquee-wrap">
          <div className="marquee-inner">
            {latestNewsItems.map((item, index) => (
              <React.Fragment key={index}>
                <span><span className="win">{item}</span></span>
                <span>|</span>
              </React.Fragment>
            ))}
            {latestNewsItems.map((item, index) => (
              <React.Fragment key={`dup-${index}`}>
                <span><span className="win">{item}</span></span>
                <span>|</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="top-bar-right">
          <a href="#" onClick={handleGetApp}>📱 App</a>
          <a href="#">🇮🇳 EN</a>
          <Link to="/support">Help</Link>
        </div>
      </div>

      {/* HEADER */}
      <header>
        <div className="header-inner">
          <Link to="/" className="logo">
            <img
              src={getSafeLogoUrl(accountInfo?.service_site_logo)}
              className="logo-img"
              alt={accountInfo?.service_site_name || "Logo"}
              onError={(e) => { e.target.src = "/banner/image.png"; }}
            />
          </Link>
          <nav>
            <Link to="/" className={navClass(isHomeActive)}>🏠 Home</Link>
            <Link to="/#live" className={navClass(isHashActive("#live"))} onClick={(e) => goHomeSection(e, "#live")}>⚽ Sports</Link>
            <Link to="/casino" className={navClass(isPathActive("/casino"))}>🎰 Casino</Link>
            <Link to="/#slots" className={navClass(isHashActive("#slots"))}>🎰 Slots</Link>
            <Link to="/#fantasy-games" className={navClass(isHashActive("#fantasy-games"))}>🎮 Fantasy Games</Link>
            <Link to="/promotion" className={navClass(isPathActive("/promotion"))}>💰 Promotions</Link>
          </nav>
          <div className="mobile-header-actions">
            {!isLoggedIn ? (
              <div className="mobile-auth-actions">
                <button type="button" onClick={() => setShowLogin(true)}>Login</button>
                <button type="button" onClick={() => setShowRegister(true)}>Sign Up</button>
              </div>
            ) : (
              <div className="mobile-wallet-actions">
                <button type="button" onClick={() => navigate("/deposit")}>Deposit</button>
                <button type="button" onClick={() => navigate("/withdraw")}>Withdraw</button>
                <button
                  type="button"
                  className="mobile-profile-open"
                  onTouchEnd={handleProfileClick}
                  onPointerUp={handleProfileClick}
                  onClick={handleProfileClick}
                  aria-label="Open profile"
                >
                  <FaUserCircle />
                </button>
                {profileOpen && !onOpenMobileAccount && (
                  <div className="mobile-header-popover mobile-profile-popover">
                    <div className="mobile-profile-popover-head">
                      <strong>{accountInfo?.account_username || "User"}</strong>
                      <span>My Profile</span>
                    </div>
                    {profileLinks.map((item) => (
                      <button type="button" key={item.path} onClick={() => openProfileLink(item.path)}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              className="mobile-header-menu-btn"
              onTouchEnd={handleMobileMenuClick}
              onPointerUp={handleMobileMenuClick}
              onClick={handleMobileMenuClick}
              aria-label="Open quick links"
            >
              <FaBars />
              <span>Menu</span>
            </button>
            {menuOpen && (
              <div className="mobile-header-popover">
                <button type="button" onClick={() => { setMenuOpen(false); navigate("/"); }}>Home</button>
                <button type="button" onClick={() => { setMenuOpen(false); navigate("/casino"); }}>Casino</button>
                <button type="button" onClick={() => { setMenuOpen(false); navigate("/promotion"); }}>Promotions</button>
                <button type="button" onClick={() => { setMenuOpen(false); navigate("/support"); }}>Support</button>
              </div>
            )}
          </div>
          <div className="header-cta">
            {isLoggedIn ? (
              <div className="header-cta-group">
                <div className="header-primary-actions">
                  <button className="btn btn-outline" onClick={() => navigate("/deposit")}>Deposit</button>
                  <button className="btn btn-brand" onClick={() => navigate("/withdraw")}>Withdraw</button>
                  {isWagering && (
                    <button
                      type="button"
                      className="header-wager-meter"
                      onClick={() => navigate("/active-bonus")}
                      title="View wagering progress"
                    >
                      <span className="header-wager-copy">
                        <span>Wagering</span>
                        <strong>{wagerPct}%</strong>
                      </span>
                      <span className="header-wager-bar">
                        <i style={{ width: `${wagerPct}%` }} />
                      </span>
                      <span className="header-wager-meta">
                        <FaGift />
                        {wagerStatusText}
                      </span>
                    </button>
                  )}
                </div>
                <div className="header-utility-actions">
                  {/*
                  <button
                    type="button"
                    className="header-icon-btn"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    title="Toggle theme"
                  >
                    {theme === "dark" ? <FaSun /> : <FaMoon />}
                  </button>
                  */}
                  <button
                    type="button"
                    className="header-icon-btn"
                    aria-label="Notifications"
                    title="Notifications"
                  >
                    <FaBell />
                  </button>
                  <div className="header-profile-wrap">
                    <button
                      type="button"
                      className="header-icon-btn"
                      onClick={handleProfileClick}
                      aria-label="Profile"
                      title="Profile"
                    >
                      <FaUserCircle />
                    </button>
                    {profileOpen && (
                      <div className="header-mini-popover header-profile-popover">
                        <button type="button" className="header-mini-close" onClick={() => setProfileOpen(false)} aria-label="Close profile menu">
                          <FaTimes />
                        </button>
                        <div className="header-profile-card-head">
                          <div className="header-profile-avatar">
                            {(accountInfo?.account_username || "U").slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="header-mini-name">{accountInfo?.account_username || "User"}</div>
                            <div className="header-mini-sub">My Profile</div>
                          </div>
                        </div>
                        <div className="header-profile-details">
                          {profileDetails.map((item) => (
                            <div className="header-profile-row" key={item.label}>
                              <span>{item.label}</span>
                              <strong>{item.value}</strong>
                            </div>
                          ))}
                        </div>
                        <div className="header-profile-links">
                          {profileLinks.map((item) => (
                            <button type="button" key={item.path} onClick={() => openProfileLink(item.path)}>
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/*
                  <div className="header-profile-wrap">
                    <button
                      type="button"
                      className="header-icon-btn"
                      onClick={() => setMenuOpen((prev) => !prev)}
                      aria-label="Menu"
                      title="Menu"
                    >
                      <FaBars />
                    </button>
                    {menuOpen && (
                      <div className="header-mini-popover header-menu-popover">
                        <button type="button" className="header-mini-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                          <FaTimes />
                        </button>
                        <div className="header-mini-actions header-menu-actions">
                          <button type="button" onClick={() => { setMenuOpen(false); navigate("/"); }}>Home</button>
                          <button type="button" onClick={() => { setMenuOpen(false); navigate("/casino"); }}>Casino</button>
                          <button type="button" onClick={() => { setMenuOpen(false); navigate("/promotion"); }}>Promotions</button>
                        </div>
                      </div>
                    )}
                  </div>
                  */}
                </div>
              </div>
            ) : (
              <button
                className="btn-demo-play"
                onClick={activateDemoMode}
              >
                <FaGem className="demo-icon" />
                <span>Demo Play</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CATEGORY NAV */}
      <div className="cat-nav">
        <div className="cat-nav-inner">
          <a href="#" className={catClass("/lottery")} onClick={(e) => goCategory(e, "/lottery")}>
            <span className="cat-icon">🎟️</span>
            <span className="cat-label">Lottery</span>
          </a>
          <a href="#" className={catClass("/crash-games")} onClick={(e) => goCategory(e, "/crash-games")}>
            <span className="cat-icon">🚀</span>
            <span className="cat-label">Crash Games</span>
          </a>
          <a href="#" className={catClass("/roulette")} onClick={(e) => goCategory(e, "/roulette")}>
            <span className="cat-icon">🎡</span>
            <span className="cat-label">Roulette</span>
          </a>
          <a href="#" className={catClass("/blackjack")} onClick={(e) => goCategory(e, "/blackjack")}>
            <span className="cat-icon">🃏</span>
            <span className="cat-label">Blackjack</span>
          </a>
          <a href="#" className={catClass("/baccarat")} onClick={(e) => goCategory(e, "/baccarat")}>
            <span className="cat-icon">💎</span>
            <span className="cat-label">Baccarat</span>
          </a>
          <a href="#" className={catClass("/dragon-tiger")} onClick={(e) => goCategory(e, "/dragon-tiger")}>
            <span className="cat-icon">🐯</span>
            <span className="cat-label">Dragon Tiger</span>
          </a>
          <a href="#" className={catClass("/teen-patti")} onClick={(e) => goCategory(e, "/teen-patti")}>
            <span className="cat-icon">🎴</span>
            <span className="cat-label">Teen Patti</span>
          </a>
          <a href="#" className={catClass("/poker")} onClick={(e) => goCategory(e, "/poker")}>
            <span className="cat-icon">♠️</span>
            <span className="cat-label">Poker</span>
          </a>
          <a href="#" className={catClass("/game-shows")} onClick={(e) => goCategory(e, "/game-shows")}>
            <span className="cat-icon">📺</span>
            <span className="cat-label">Game Shows</span>
          </a>
          <a href="#" className={catClass("/andar-bahar")} onClick={(e) => goCategory(e, "/andar-bahar")}>
            <span className="cat-icon">🃏</span>
            <span className="cat-label">Andar Bahar</span>
          </a>
        </div>
      </div>
      {mobilePanel && (
        <div className={`mobile-home-drawer is-${mobilePanel}`} role="dialog" aria-modal="true">
          <button type="button" className="mobile-drawer-backdrop" onClick={closeMobilePanel} aria-label="Close mobile menu" />
          <section className="mobile-drawer-panel">
            <div className="mobile-drawer-head">
              <div>
                <span>{mobilePanel === "menu" ? "Quick Navigation" : "Account Desk"}</span>
                <strong>{mobilePanel === "menu" ? "Browse Menu" : accountInfo?.account_username || "My Account"}</strong>
              </div>
              <button type="button" onClick={closeMobilePanel} aria-label="Close">
                <FaTimes />
              </button>
            </div>
            <div className="mobile-drawer-body">
              {mobilePanel === "menu" ? (
                <div className="mobile-quick-panel">
                  <div className="mobile-quick-grid">
                    {mobileQuickLinks.map((item) => (
                      item.action ? (
                        <button type="button" key={item.label} onClick={item.action} data-keep-drawer="true">
                          {item.label}
                        </button>
                      ) : (
                        <button type="button" key={item.label} onClick={() => handleMobileNavigate(item.path)}>
                          {item.label}
                        </button>
                      )
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mobile-account-panel">
                  {isLoggedIn ? (
                    <>
                      <div className="mobile-account-hero">
                        <FaUserCircle />
                        <span>My Profile</span>
                        <strong>{accountInfo?.account_username || "User"}</strong>
                      </div>
                      <div className="mobile-account-details">
                        {mobileProfileDetails.map((item) => (
                          <div key={item.label}>
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="mobile-wallet-grid">
                        {[
                          ["Real Balance", accountInfo?.account_balance],
                          ["Casino Bonus", accountInfo?.account_casino_bonus],
                          ["Sports Bonus", accountInfo?.account_sports_bonus],
                          ["Total Balance", accountInfo?.account_total_balance ?? accountInfo?.account_balance],
                        ].map(([label, value]) => (
                          <div key={label} className="mobile-wallet-tile">
                            <span>{label}</span>
                            <strong><small>₹</small>{formatBalance(value)}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="mobile-profile-links">
                        {profileLinks.map((item) => (
                          <button type="button" key={item.path} onClick={() => handleMobileNavigate(item.path)}>
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="mobile-logout-btn"
                        onClick={() => {
                          localStorage.removeItem("auth_secret_key");
                          localStorage.removeItem("account_id");
                          window.location.reload();
                        }}
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <div className="mobile-login-card">
                      <FaUserCircle />
                      <strong>Account Access</strong>
                      <span>Login or create your account to view wallet details.</span>
                      <div>
                        <button type="button" onClick={() => { closeMobilePanel(); setShowLogin(true); }}>Log In</button>
                        <button type="button" onClick={() => { closeMobilePanel(); setShowRegister(true); }}>Sign Up</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default RanaHeader;
