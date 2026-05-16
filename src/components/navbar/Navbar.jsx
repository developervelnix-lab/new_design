"use client"

import React, { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons"
import Login from "../auth/Login"
import Register from "../auth/Register"
import { useNavigate } from "react-router-dom"
import AccountInfo from "./AccountInfo"
import { allsport } from "../jsondata/sport"
import { liveSport } from "../jsondata/live"
import { FaSignInAlt, FaUserPlus, FaMoneyCheckAlt, FaWallet, FaHeadset, FaDownload, FaExchangeAlt, FaHistory, FaGavel, FaShieldAlt, FaLock, FaUserShield, FaGift, FaStar, FaShareAlt, FaKey, FaSignOutAlt, FaWhatsapp, FaTelegramPlane, FaInstagram, FaFacebookF, FaTwitter, FaBars, FaTimes, FaUserCircle, FaSun, FaMoon, FaEnvelope, FaTabletAlt, FaMobileAlt, FaArrowRight, FaClock, FaTrophy, FaGem, FaBell, FaTicketAlt, FaSearch } from "react-icons/fa"
import { useSite } from "../../context/SiteContext"
import { useGames } from "../../context/GameContext"
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { useTheme } from "../../context/ThemeContext"
import { URL as BASE_URL, API_URL } from "../../utils/constants"
import { usePWAInstall } from "../../hooks/usePWAInstall"
import AppInstallModal from "./AppInstallModal"

function Navbar() {
  const { accountInfo, showLogin, setShowLogin, showRegister, setShowRegister, refreshSiteData } = useSite();
  const { slots, casino, fishing, poker, turbo, live, casino_lobby, topslot } = useGames() || {};
  const isLoggedIn = !!(accountInfo?.account_id && localStorage.getItem("auth_secret_key"));
  const authSecretKey = localStorage.getItem("auth_secret_key");
  const userId = localStorage.getItem("account_id");
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState(null)
  const [showAppInstallModal, setShowAppInstallModal] = useState(false)
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [trendingMatches, setTrendingMatches] = useState([])
  const { theme, toggleTheme } = useTheme()
  const remainingWager = parseFloat(accountInfo?.tbl_requiredplay_balance || 0);
  const activeBonus = parseFloat(accountInfo?.tbl_bonus_balance || 0) + parseFloat(accountInfo?.tbl_sports_bonus || 0);
  const isWagering = remainingWager > 0.1 || activeBonus > 0;

  const wagerRequired = parseFloat(accountInfo?.wagering_required || 0);
  const wagerCompleted = parseFloat(accountInfo?.wagering_completed || 0);
  const wagerPct = isWagering && wagerRequired > 0
    ? Math.min(100, Math.round((wagerCompleted / wagerRequired) * 100))
    : 0;

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(`${API_URL}?Route=route-trending-matches&AuthToken=${encodeURIComponent(authSecretKey || 'guest')}&_t=${Date.now()}`, {
          method: "GET",
          mode: "cors",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "Route": "route-trending-matches",
            "AuthToken": authSecretKey || "guest"
          }
        });
        const res = await response.json();
        if (res.status_code === "success") {
          // Prefer rich `matches` array (has viewer counts)
          if (res.matches?.length > 0) {
            // Filter out old/dummy data like "2024" as requested
            const filtered = res.matches
              .filter(m => !m.name.includes("2024"))
              .map(m => ({ name: m.name, viewers: m.viewers || 0, type: m.type }));
            setTrendingMatches(filtered);
          } else if (res.data?.length > 0) {
            const filtered = res.data
              .filter(name => !name.includes("2024"))
              .map(name => ({ name, viewers: 0 }));
            setTrendingMatches(filtered);
          }
        }
      } catch (err) {
        console.error("Failed to fetch trending matches", err);
      }
    };
    fetchTrending();
    // Refresh every 2 minutes to keep ticker live
    const interval = setInterval(fetchTrending, 120000);
    return () => clearInterval(interval);
  }, [authSecretKey]);
  const COLORS = useColors();
  const { isInstallable, isInstalled, installApp, platform: currentDevice } = usePWAInstall();

  // Logo URL Helper
  const getSafeLogoUrl = (logoPath) => {
    if (!logoPath || logoPath === "/favicon.png" || logoPath.includes('favicon.png')) return "/banner/image.png";
    if (logoPath.startsWith('http') || logoPath.startsWith('data:')) return logoPath;

    // If it's a relative path from the backend, prepend BASE_URL
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    return `${base}${path}`;
  };


  // Add effect to prevent body scrolling when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"
      document.body.classList.add("menu-open")
    } else {
      document.body.style.overflow = ""
      document.body.classList.remove("menu-open")
    }

    return () => {
      document.body.style.overflow = ""
      document.body.classList.remove("menu-open")
    }
  }, [menuOpen])

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000) // Automatically dismiss toast after 3 seconds
  }

  // Game Categories with icons matching the neon design
  // Game Categories for the sub-navbar
  const games = [
    { name: "Roulette", icon: "🎡" },
    { name: "Blackjack", icon: "🃏" },
    { name: "Baccarat", icon: "💎" },
    { name: "Dragon Tiger", icon: "🐯" },
    { name: "Teen Patti", icon: "🎴" },
    { name: "Sic Bo", icon: "🎲" },
    { name: "Poker", icon: "♠️" },
    { name: "Game Shows", icon: "📺" },
    { name: "Mega Wheel", icon: "🎡" },
    { name: "Andar Bahar", icon: "🃏" },
  ]
  const [sportsLoading, setSportsLoading] = useState(false);

  const handleGameSelect = (index) => {
    setSelectedGame(index);
    const game = games[index];
    if (game.name === "Roulette") {
      navigate("/roulette");
    } else {
      scrollToSection("casino-lobby");
    }
  };

  const handleLiveSportSelect = async (gameObj) => {
    if (!authSecretKey) {
      setShowLogin(true)
      return
    }

    setSportsLoading(true);
    try {
      const response = await fetch(`${API_URL}?Route=route-play-games&AuthToken=${encodeURIComponent(authSecretKey)}&USER_ID=${encodeURIComponent(userId)}`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Route: "route-play-games",
          AuthToken: authSecretKey,
        },
        body: JSON.stringify({
          USER_ID: userId,
          GAME_NAME: gameObj["Game Name"],
          GAME_UID: gameObj["Game UID"],
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      if (data.status_code === "success" && data.data?.game_url) {
        const encodedUrl = btoa(data.data.game_url);
        navigate(`/game-url/${encodeURIComponent(encodedUrl)}/${encodeURIComponent(gameObj["Game Name"])}`);
      } else if (data.status_code === "balance_error") {
        showToast("error", "Minimum balance of ₹100 required to play sports.");
      } else if (data.status_code === "authorization_error" || data.status_code === "auth_error") {
        showToast("error", "Session expired. Please login again.");
        localStorage.removeItem("auth_secret_key");
        localStorage.removeItem("account_id");
        refreshSiteData();
        setShowLogin(true);
      } else {
        showToast("error", data.status_code || "Failed to load sports.");
      }
    } catch (error) {
      showToast("error", "Network error. Please check your connection.");
    } finally {
      setSportsLoading(false);
    }
  };

  const handleGameLaunch = async (game) => {
    if (!authSecretKey) {
      setSearchOpen(false);
      setShowLogin(true);
      return;
    }
    
    setSearchOpen(false);
    
    try {
      const response = await fetch(`${API_URL}?Route=route-play-games&AuthToken=${encodeURIComponent(authSecretKey)}&USER_ID=${encodeURIComponent(userId)}`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Route: "route-play-games",
          AuthToken: authSecretKey,
        },
        body: JSON.stringify({
          USER_ID: userId,
          GAME_NAME: game["Game Name"],
          GAME_UID: game["Game UID"],
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      if (data.status_code === "success" && data.data?.game_url) {
        const encodedUrl = btoa(unescape(encodeURIComponent(data.data.game_url)));
        navigate(`/game-url/${encodeURIComponent(encodedUrl)}/${encodeURIComponent(game["Game Name"])}`);
      } else if (data.status_code === "balance_error") {
        showToast("error", "Insufficient balance to play this game.");
      } else if (data.status_code === "authorization_error" || data.status_code === "auth_error") {
        showToast("error", "Session expired. Please login again.");
        localStorage.removeItem("auth_secret_key");
        localStorage.removeItem("account_id");
        refreshSiteData();
        setShowLogin(true);
      } else {
        showToast("error", data.status_code || "Failed to load game.");
      }
    } catch (error) {
      showToast("error", "Network error. Please check your connection.");
    }
  };

  const handleLoginClick = () => {
    setShowLogin(true)
    setMenuOpen(false) // Close the sidebar if open
  }

  const handleRegisterClick = () => {
    setShowRegister(true)
    setMenuOpen(false) // Close the sidebar if open
  }

  const closeLoginModal = () => {
    setShowRegister(false)
    setShowLogin(false)
  }

  const closeRegisterModal = () => {
    setShowLogin(false)
    setShowRegister(false)
  }

  function handleTransactionClick() {
    setMenuOpen(false)
    navigate("/transaction")
  }
  function handleBettingTransaction() {
    setMenuOpen(false)
    navigate("/betting-profit-loss")
  }

  function handleChangePassword() {
    setMenuOpen(false)
    navigate("/change-password")
  }

  function handleOpenBetClick() {
    setMenuOpen(false)
    navigate("/openbet")
  }
  function handleRulesRegulation() {
    setMenuOpen(false)
    navigate("/rules-regulation")
  }
  function handleExclusionPolicy() {
    setMenuOpen(false)
    navigate("/exclusion")
  }
  function handleResponsibleGambling() {
    setMenuOpen(false)
    navigate("/responsible-gambling")
  }
  function handlePrivacyPolicy() {
    setMenuOpen(false)
    navigate("/privacy-policy")
  }
  function handleSupport() {
    setMenuOpen(false)
    navigate("/support")
  }
  function handleLogoClick() {
    setMenuOpen(false)
    navigate("/")
  }
  function handlePromotion() {
    setMenuOpen(false)
    navigate("/promotion")
  }
  function handleBonus() {
    setMenuOpen(false)
    navigate("/bonus")
  }

  const scrollToSection = (sectionId) => {
    if (window.location.pathname !== "/") {
      navigate("/#" + sectionId)
      return
    }
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMenuOpen(false)
  }

  function onTelegramClick() {
    window.open("https://t.me/YOUR_TELEGRAM_LINK", "_blank")
  }

  useEffect(() => {
    if (accountInfo?.account_balance) {
      localStorage.setItem("avl_balance", accountInfo.account_balance)
    }
    if (accountInfo?.service_recharge_option) {
      localStorage.setItem("deposit_options", accountInfo.service_recharge_option)
    }
  }, [accountInfo])

  // Refresh data whenever menu or profile is opened
  useEffect(() => {
    if (menuOpen || profileOpen) {
      refreshSiteData();
    }
  }, [menuOpen, profileOpen, refreshSiteData]);

  function handleSignOut() {
    setMenuOpen(false)
    localStorage.removeItem("auth_secret_key")
    localStorage.removeItem("account_id")
    refreshSiteData()
    navigate("/")
  }

  function handleInviteAndEarn() {
    setMenuOpen(false)
    navigate("/inviteandearn")
  }

  function handleChatWithUs() {
    setMenuOpen(false)
    if (accountInfo?.service_support_url) {
      window.open(accountInfo.service_support_url, "_blank", "noopener,noreferrer")
    } else {
      navigate("/")
    }
  }

  // social links
  const handleExternalLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-[100] custom-header-wrapper shadow-lg">
        {/* TOPBAR */}
        <div className="topbar" style={{ backgroundColor: COLORS.bg, borderBottom: `1px solid ${COLORS.bg4}` }}>
          <div className="topbar-left flex-1 min-w-0 h-full overflow-hidden">
            <div className="flex items-center gap-2 md:gap-4 whitespace-nowrap h-full">
              <div className="topbar-item shrink-0"><span style={{ color: COLORS.brand }}>🕐</span> IST {new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' })}</div>
              <div className="live-badge shrink-0" style={{ backgroundColor: COLORS.red }}>LIVE</div>
              
              <div className="overflow-hidden flex-1 relative h-full flex items-center">
                <div className="flex items-center gap-8 animate-marquee whitespace-nowrap hover:pause-marquee cursor-default">
                  {trendingMatches.length > 0 ? (
                    <>
                      {trendingMatches.map((match, idx) => (
                        <React.Fragment key={idx}>
                          <div className="topbar-item cursor-pointer hover:text-brand transition-colors flex items-center gap-1.5" onClick={() => handleLiveSportSelect(liveSport[idx % liveSport.length])}>
                            {match.type && <span className="font-semibold" style={{ color: COLORS.brand }}>{match.type}</span>}
                            <span className="text-black/80 dark:text-white/80">{match.name}</span>
                            {match.viewers > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${COLORS.brand}22`, color: COLORS.brand }}>
                                {idx % 2 === 0 ? '🔴' : '👁'} {match.viewers.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="topbar-item opacity-10">|</div>
                        </React.Fragment>
                      ))}
                      {/* Duplicate for seamless loop */}
                      {trendingMatches.map((match, idx) => (
                        <React.Fragment key={`dup-${idx}`}>
                          <div className="topbar-item cursor-pointer hover:text-brand transition-colors flex items-center gap-1.5" onClick={() => handleLiveSportSelect(liveSport[idx % liveSport.length])}>
                            {match.type && <span className="font-semibold" style={{ color: COLORS.brand }}>{match.type}</span>}
                            <span className="text-black/80 dark:text-white/80">{match.name}</span>
                            {match.viewers > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${COLORS.brand}22`, color: COLORS.brand }}>
                                {idx % 2 === 0 ? '🔴' : '👁'} {match.viewers.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="topbar-item opacity-10">|</div>
                        </React.Fragment>
                      ))}
                    </>
                  ) : (
                    <div className="topbar-item text-black/40 dark:text-white/40 italic">Waiting for live updates...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="topbar-right shrink-0 ml-4 flex items-center gap-4">
            <div className="topbar-item flex items-center text-black/70 dark:text-white/70 hover:text-black dark:text-white cursor-pointer transition-colors" title="India">
              <img src="https://flagcdn.com/w40/in.png" className="w-5 h-auto rounded-[2px] shadow-sm" alt="India" />
            </div>
            <div className="topbar-item text-black/70 dark:text-white/70 hover:text-black dark:text-white cursor-pointer transition-colors">🌐 EN</div>
            {accountInfo?.service_support_url && (
              <div
                className="topbar-item hover:text-black dark:text-white cursor-pointer transition-colors text-black/70 dark:text-white/70"
                onClick={() => handleExternalLink(accountInfo.service_support_url)}
              >
                Support
              </div>
            )}
            <div
              className="topbar-item hover:text-black dark:text-white cursor-pointer transition-colors text-black/70 dark:text-white/70"
              onClick={handleSupport}
            >
              Support
            </div>
          </div>
        </div>

        {/* 3. HEADER (LOGO, NAV, BUTTONS) */}
        <header className="custom-header" style={{ backgroundColor: `${COLORS.bg}F0`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${COLORS.bg4}` }}>
          <div className="header-inner">
            <div className="custom-logo" onClick={handleLogoClick}>
              <img
                src={getSafeLogoUrl(accountInfo?.service_site_logo)}
                className="h-8 md:h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(230,160,0,0.3)] hover:scale-105 transition-transform duration-300"
                alt="Logo"
                onError={(e) => { e.target.src = "/image.png"; }}
              />
              {accountInfo?.service_tagline && (
                <div className="logo-sub hidden md:block" style={{ borderLeft: `2px solid ${COLORS.brand}` }} dangerouslySetInnerHTML={{ __html: accountInfo.service_tagline }}></div>
              )}
            </div>

            <nav className="main-nav">
              <button className="nav-link" onClick={() => scrollToSection("live")} style={{ fontFamily: FONTS.head, background: 'none', border: 'none', cursor: 'pointer' }}>Sports</button>
              <button className="nav-link" onClick={() => scrollToSection("casino-lobby")} style={{ fontFamily: FONTS.head, background: 'none', border: 'none', cursor: 'pointer' }}>Casino</button>
              <button className="nav-link" onClick={() => scrollToSection("slots")} style={{ fontFamily: FONTS.head, background: 'none', border: 'none', cursor: 'pointer' }}>Slots</button>
              <button className="nav-link" onClick={() => scrollToSection("fantasy-games")} style={{ fontFamily: FONTS.head, background: 'none', border: 'none', cursor: 'pointer' }}>Fantasy Games</button>
              <button className="nav-link" onClick={handlePromotion} style={{ fontFamily: FONTS.head, background: 'none', border: 'none', cursor: 'pointer' }}>Promotions</button>
            </nav>

            <div className="header-cta">
              {!isLoggedIn ? (
                <>
                  <button className="btn-outline header-btn" onClick={handleLoginClick} style={{ fontFamily: FONTS.head, borderColor: COLORS.bg4 }}>Log In</button>
                  <button className="btn-primary header-btn" onClick={handleRegisterClick} style={{ background: COLORS.brandGradient, color: '#000', fontFamily: FONTS.head }}>Register</button>
                </>
              ) : (
                <>
                  <button className="btn-outline header-btn" onClick={() => navigate("/deposit")} style={{ fontFamily: FONTS.head, borderColor: COLORS.bg4 }}>Deposit</button>
                  <button className="btn-primary header-btn" onClick={() => navigate("/withdraw")} style={{ background: COLORS.brandGradient, color: '#000', fontFamily: FONTS.head }}>Withdraw</button>
                </>
              )}



              {/* Wagering Progress Pill */}
              {isWagering && (
                <div
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-all group/wager"
                  onClick={() => navigate('/active-bonus')}
                  title="View Wagering Progress"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] font-black uppercase tracking-widest text-amber-500/60 leading-none">Wagering</span>
                    <span className="text-[10px] font-black text-amber-500 leading-tight">{wagerPct}%</span>
                  </div>
                  <div className="w-10 h-1 rounded-full bg-amber-500/20 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-1000"
                      style={{ width: `${wagerPct}%` }}
                    ></div>
                  </div>
                  <FaGift className="text-amber-500 text-[10px] animate-bounce" />
                </div>
              )}
              <button
                className={`flex p-1.5 md:p-2 rounded-xl transition-all duration-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-100 dark:bg-white/10`}
                onClick={toggleTheme}
                title="Toggle Light/Dark Theme"
              >
                {theme === 'dark' ? (
                  <FaSun className="text-lg md:text-xl text-yellow-500" />
                ) : (
                  <FaMoon className="text-lg md:text-xl text-black/90 dark:text-white/90" />
                )}
              </button>

              {/* Native-style App Launcher (mimicking browser search bar button) */}
              {isInstalled && (
                <button
                  onClick={() => {
                    // With launch_handler in manifest, opening the app URL 
                    // will focus/launch the installed standalone PWA window
                    window.open(window.location.origin, '_blank');
                  }}
                  className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1A1A] border border-white/10 text-white hover:bg-white/10 transition-all shadow-lg group relative overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="w-5 h-5 rounded bg-white flex items-center justify-center overflow-hidden transition-colors">
                    <img
                      src={getSafeLogoUrl(accountInfo?.service_site_logo)}
                      className="w-full h-full object-contain p-0.5"
                      alt="Logo"
                      onError={(e) => { e.target.src = "/image.png"; }}
                    />
                  </div>
                  <span className="text-[11px] font-medium tracking-wide">Open in app</span>
                </button>
              )}

              {/* Notification Button */}
              {isLoggedIn && (
                <button
                  className={`p-1.5 md:p-2 rounded-xl transition-all duration-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-100 dark:bg-white/10 relative`}
                  onClick={() => navigate('/notifications')}
                  title="Notifications"
                >
                  <FaBell className="text-lg md:text-xl text-black/90 dark:text-white/90" />
                  {(() => {
                    const history = JSON.parse(localStorage.getItem("notifications_history") || "[]");
                    const acknowledged = JSON.parse(localStorage.getItem("acknowledged_notices") || "[]");
                    const hasUnread = history.some(n => !acknowledged.includes(n.id));
                    return hasUnread ? <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black animate-pulse"></span> : null;
                  })()}
                </button>
              )}

              {/* Profile Toggle */}
              {isLoggedIn && (
                <button
                  className={`p-1.5 md:p-2 rounded-xl transition-all duration-300 ${profileOpen ? 'bg-brand/20' : 'bg-gray-100 dark:bg-white/5'}`}
                  onClick={() => {
                    setProfileOpen(!profileOpen)
                    setMenuOpen(false)
                  }}
                >
                  <FaUserCircle className="text-lg md:text-xl" style={{ color: profileOpen ? COLORS.brand : COLORS.text }} />
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className={`mobile-menu-btn p-1.5 md:p-2 rounded-xl transition-all duration-300 ${menuOpen ? 'bg-gray-100 dark:bg-white/10 rotate-90' : 'bg-gray-100 dark:bg-white/5'}`}
                onClick={() => {
                  setMenuOpen(!menuOpen)
                  setProfileOpen(false)
                }}
              >
                {menuOpen ? (
                  <FaTimes className="text-lg md:text-xl" style={{ color: COLORS.brand }} />
                ) : (
                  <FaBars className="text-lg md:text-xl text-black/70 dark:text-white/70" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* 4. SPORT TABS (TAGS) - MOVED TO BOTTOM OF STICKY */}
        <div className="sport-tabs-bar" style={{ backgroundColor: COLORS.bg2, borderBottom: `1px solid ${COLORS.bg4}` }}>
          <div className="sport-tabs-inner">
            {games.map((game, index) => (
              <button
                key={index}
                onClick={() => handleGameSelect(index)}
                disabled={sportsLoading}
                className={`sport-tab ${selectedGame === index ? "active" : ""} ${sportsLoading ? "opacity-60 cursor-wait" : ""}`}
                style={{
                  fontFamily: FONTS.head,
                  color: selectedGame === index ? COLORS.brand : '',
                  borderRight: `1px solid ${COLORS.bg4}`
                }}
              >
                <style>{`
                  .sport-tab.active::after { background: ${COLORS.brand}; transform: scaleX(1); }
                  .sport-tab:hover::after { background: ${COLORS.brand}; }
                `}</style>
                {sportsLoading && selectedGame === index ? (
                  <span className="tab-icon animate-spin">⏳</span>
                ) : (
                  <span className="tab-icon">{game.icon}</span>
                )}
                {" "}{game.name}
              </button>
            ))}
          </div>
        </div>

      </div>
      {/* Navbar Layout Spacer (Ensures content starts below the fixed navbar with a slight gap on ALL pages) */}
      <div className="h-[95px] md:h-[135px] relative w-full"></div>


      {/* Background Overlay with Blur Effect */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/10 dark:bg-black/50 backdrop-blur-sm transition-all duration-300 z-[190]"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* Profile Sidebar Backdrop */}
      {profileOpen && (
        <div
          className="fixed inset-0 bg-black/10 dark:bg-black/50 backdrop-blur-sm transition-all duration-300 z-[190]"
          onClick={() => setProfileOpen(false)}
        ></div>
      )}

      {/* Profile Sidebar (Side Pop-up) */}
      {isLoggedIn && profileOpen && (
        <div
          className={`fixed top-0 right-0 h-full w-[85%] md:w-[350px] backdrop-blur-3xl transform ${profileOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-[200] border-l border-black/5 dark:border-white/5 flex flex-col shadow-2xl`}
          style={{ backgroundColor: `${COLORS.bg2}FB` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 rounded-full" style={{ background: COLORS.brandGradient }}></div>
              <h2 className="text-black dark:text-white font-black uppercase tracking-widest text-sm" style={{ fontFamily: FONTS.head }}>Account Details</h2>
            </div>
            <button
              onClick={() => setProfileOpen(false)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-100 dark:bg-white/10 text-black/50 dark:text-white/50 transition-all"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1 p-6 space-y-6">
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-3 border-2 border-brand/20 p-1 relative">
                <div className="w-full h-full rounded-xl overflow-hidden bg-brand/10 flex items-center justify-center">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${accountInfo?.account_username || 'User'}&backgroundColor=ffad33&bold=true`}
                    className="w-full h-full object-cover"
                    alt="Avatar"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111111]"></div>
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight" style={{ fontFamily: FONTS.head, color: COLORS.text }}>
                {accountInfo?.account_username || "Guest User"}
              </h3>
            </div>

            <div className="space-y-2">
              {[
                { label: "User ID", value: accountInfo?.account_id || "—" },
                { label: "Username", value: accountInfo?.account_username || "—" },
                { label: "Email", value: accountInfo?.account_email || "—" },
                { label: "Mobile", value: accountInfo?.account_mobile || "—" },
              ].map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl transition-all" style={{ backgroundColor: COLORS.bg4, border: `1px solid ${COLORS.bg3}` }}>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: COLORS.text }}>{detail.label}</p>
                  <p className="text-[10px] font-bold truncate max-w-[150px]" style={{ color: COLORS.text }}>{detail.value}</p>
                </div>
              ))}

              {/* Inlined Actions */}
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => { setProfileOpen(false); navigate("/support"); }}
                  className="w-full py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:text-white hover:bg-gray-100 dark:bg-white/5 transition-all text-center"
                >
                  My Tickets
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate("/change-password"); }}
                  className="w-full py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:text-white hover:bg-gray-100 dark:bg-white/5 transition-all text-center"
                >
                  Change Password
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.2em] border border-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-4/5 md:w-3/5 lg:w-[22%] backdrop-blur-3xl transform ${menuOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-[200] border-l border-black/5 dark:border-white/5 flex flex-col shadow-2xl`}
        style={{ backgroundColor: `${COLORS.bg2}E6` }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 rounded-full" style={{ background: COLORS.brandGradient }}></div>
            <h2 className="text-black dark:text-white font-black uppercase tracking-widest text-sm" style={{ fontFamily: FONTS.head }}>{accountInfo?.service_site_name || 'Menu'}</h2>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-500/20 hover:text-red-500 text-black/50 dark:text-white/50 transition-all duration-300"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 pb-32 lg:pb-6 space-y-6">
          {/* Account Info Card */}
          {isLoggedIn && (
            <div className="group transition-all duration-500">
              <AccountInfo accountInfo={accountInfo} />
            </div>
          )}

          <div className="space-y-6">


            {/* Service Center Section */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/30 pl-2 mb-3" style={{ fontFamily: FONTS.head }}>Service Center</h3>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  ...(accountInfo?.service_support_url ? [{ icon: <FaHeadset />, label: "Chat With Us", action: handleChatWithUs }] : []),
                  {
                    icon: <FaDownload />,
                    label: isInstalled ? "Go to App" : "Get App",
                    action: () => {
                      setMenuOpen(false);
                      if (isInstalled) {
                        window.open(window.location.origin, '_blank');
                      } else if (isInstallable) {
                        installApp();
                      } else if (currentDevice === 'android') {
                        window.open(accountInfo?.service_apk_url || "/velplay.apk", "_blank");
                      } else {
                        // Fallback: trigger whatever browser-native thing might happen
                        window.open(window.location.origin, '_blank');
                      }
                    },
                    premium: true,
                    highlight: true
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`group relative flex items-center p-3 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden border ${item.premium ? 'bg-gradient-to-r from-brand/20 to-brand/5 border-brand/30 shadow-lg' : 'bg-gray-100/50 dark:bg-white/2 hover:bg-black/5 dark:hover:bg-white/5 border-black/5 dark:border-white/5'}`}
                    onClick={item.action}
                  >
                    {item.premium && (
                      <div className="absolute inset-0 bg-gradient-to-r from-brand/10 to-transparent animate-shimmer scale-x-150 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    )}
                    <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-transform duration-300 group-hover:scale-110 ${item.premium ? 'bg-brand text-black' : 'bg-brand/10 text-brand'}`}>
                      {React.cloneElement(item.icon, { size: 12 })}
                    </div>
                    <div className="flex flex-col">
                      <span className={`relative text-[11px] font-black uppercase tracking-widest ${item.premium ? 'text-brand' : 'text-black/70 dark:text-white/70 group-hover:text-black dark:text-white'}`} style={{ fontFamily: FONTS.ui }}>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Activity Section */}
            {isLoggedIn && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/30 pl-2 mb-3" style={{ fontFamily: FONTS.head }}>Financial Activity</h3>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { icon: <FaExchangeAlt />, label: "Transactions", action: handleTransactionClick },
                    { icon: <FaHistory />, label: "Betting Profit & Loss", action: handleBettingTransaction },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="group flex items-center p-2 rounded-xl bg-gray-100/50 dark:bg-white/5 border border-black/5 dark:border-white/5 transition-all duration-300 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
                      onClick={item.action}
                    >
                      <div className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center text-brand mr-2 transition-transform duration-300 group-hover:scale-110">
                        {React.cloneElement(item.icon, { size: 10 })}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-black/70 dark:text-white/70 group-hover:text-black dark:text-white" style={{ fontFamily: FONTS.ui }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal & Compliance Section */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/30 pl-2 mb-3" style={{ fontFamily: FONTS.head }}>Legal & Compliance</h3>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { icon: <FaGavel />, label: "Rules", action: handleRulesRegulation },
                  { icon: <FaShieldAlt />, label: "Exclusion", action: handleExclusionPolicy },
                  { icon: <FaLock />, label: "Privacy", action: handlePrivacyPolicy },
                  { icon: <FaUserShield />, label: "Responsible", action: handleResponsibleGambling },
                  { icon: <FaEnvelope />, label: "Support", action: handleSupport },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group flex items-center p-2 rounded-xl bg-gray-100/50 dark:bg-white/5 border border-black/5 dark:border-white/5 transition-all duration-300 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={item.action}
                  >
                    <div className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center text-brand mr-2 transition-transform duration-300 group-hover:scale-110">
                      {React.cloneElement(item.icon, { size: 10 })}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-black/70 dark:text-white/70 group-hover:text-black dark:text-white" style={{ fontFamily: FONTS.ui }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards & Social Section */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/30 pl-2 mb-3" style={{ fontFamily: FONTS.head }}>Connect & Win</h3>
              <div className="space-y-1.5">
                {[
                  { icon: <FaGift />, label: "Gift Card", action: () => navigate("/gifrcardreedom"), highlight: true },
                  ...(isWagering ? [{ icon: <FaClock />, label: "Wagering Progress", action: () => navigate("/active-bonus"), highlight: true, shimmer: true }] : []),
                  { icon: <FaStar />, label: "Promotions", action: handlePromotion },
                  { icon: <FaGift />, label: "Bonuses", action: handleBonus },
                  { icon: <FaShareAlt />, label: "Refer And Earn", action: handleInviteAndEarn },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={item.highlight
                      ? `group relative flex items-center p-2.5 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden border bg-gradient-to-r from-brand/20 to-brand/5 border-brand/30 shadow-lg`
                      : `group flex items-center p-2 rounded-xl bg-gray-100/50 dark:bg-white/5 border border-black/5 dark:border-white/5 transition-all duration-300 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10`}
                    onClick={item.action}
                  >
                    <div className={`relative w-6 h-6 rounded-md flex items-center justify-center mr-2 transition-transform duration-300 group-hover:scale-110 ${item.highlight ? 'bg-brand text-black' : 'bg-brand/10 text-brand'}`}>
                      {React.cloneElement(item.icon, { size: 10 })}
                    </div>
                    <div className="flex flex-col">
                      <span className={`relative text-[9px] font-black uppercase tracking-widest ${item.highlight ? 'text-brand' : 'text-black/70 dark:text-white/70 group-hover:text-black dark:text-white'}`} style={{ fontFamily: FONTS.ui }}>{item.label}</span>
                    </div>
                    {item.highlight && (
                      <div className="ml-auto flex items-center gap-1">
                        {item.shimmer && <span className="text-[7px] font-black opacity-40 mr-1" style={{ color: COLORS.text }}>{wagerPct}%</span>}
                        <div className={`w-1 h-1 rounded-full bg-brand ${item.shimmer ? 'animate-ping' : ''}`}></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Account Management Section */}
            {isLoggedIn && (
              <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                <div
                  className="group flex items-center p-2 rounded-xl bg-gray-100/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 transition-all duration-300 cursor-pointer"
                  onClick={handleSupport}
                >
                  <div className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center text-brand mr-2.5 group-hover:scale-110 transition-transform">
                    <FaTicketAlt size={10} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-black dark:text-white uppercase tracking-widest leading-none mb-0.5" style={{ fontFamily: FONTS.ui }}>My Tickets</span>
                    <span className="text-[7px] text-black/30 dark:text-white/30 uppercase tracking-tighter font-bold">View Support History</span>
                  </div>
                </div>

                <div
                  className="group flex items-center p-2 rounded-xl bg-gray-100/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 transition-all duration-300 cursor-pointer"
                  onClick={handleChangePassword}
                >
                  <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400 mr-2.5 group-hover:scale-110 transition-transform">
                    <FaKey size={10} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-black dark:text-white uppercase tracking-widest leading-none mb-0.5" style={{ fontFamily: FONTS.ui }}>Change Password</span>
                    <span className="text-[7px] text-black/30 dark:text-white/30 uppercase tracking-tighter font-bold">Update Account Security</span>
                  </div>
                </div>

                <button
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-500 border border-red-500/20 group overflow-hidden relative"
                  onClick={handleSignOut}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100"></div>
                  <FaSignOutAlt size={12} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="font-black uppercase tracking-[0.2em] text-[10px]" style={{ fontFamily: FONTS.head }}>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer - Socials */}
        <div className="py-2.5 px-4 bg-black/10 dark:bg-black/40 border-t border-black/5 dark:border-white/5">
          <div className="flex justify-around items-center">
            {(() => {
              if (accountInfo?.service_social_links && accountInfo.service_social_links.length > 0) {
                const iconMap = {
                  'whatsapp': { icon: <FaWhatsapp />, color: "#25D366", prefix: "https://wa.me/" },
                  'telegram': { icon: <FaTelegramPlane />, color: "#0088cc", prefix: "" },
                  'instagram': { icon: <FaInstagram />, color: "#E1306C", prefix: "" },
                  'facebook': { icon: <FaFacebookF />, color: "#1877F2", prefix: "" },
                  'twitter': { icon: <FaTwitter />, color: "#1DA1F2", prefix: "" }
                };
                return accountInfo.service_social_links.map((link, i) => {
                  const platform = link.platform.toLowerCase();
                  let url = link.value;
                  const meta = iconMap[platform] || iconMap['telegram'];
                  if (platform === 'whatsapp' && !url.includes('wa.me')) {
                    url = meta.prefix + url.replace(/\s+/g, '');
                  } else if (!url.startsWith('http')) {
                    url = 'https://' + url;
                  }
                  return (
                    <button
                      key={'dyn_soc' + i}
                      onClick={() => handleExternalLink(url)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125 group relative"
                      style={{ backgroundColor: `${meta.color}15` }}
                    >
                      <div className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity" style={{ backgroundColor: meta.color }}></div>
                      <span className="relative text-base" style={{ color: meta.color }}>{meta.icon}</span>
                    </button>
                  );
                });
              }
              return null;
            })()}
          </div>
          <p className="text-center text-[7px] text-black/10 dark:text-white/10 uppercase tracking-[0.4em] mt-1 font-bold">{accountInfo?.service_site_name || 'Site'} © 2025</p>
        </div>
      </div>
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 flex justify-center items-center z-[100000] bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Login
            onClose={closeLoginModal}
            onSwitchToRegister={() => {
              setShowLogin(false)
              setShowRegister(true)
            }}
          />
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 flex justify-center items-center z-[100000] bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Register
            onClose={closeRegisterModal}
            onSwitchToLogin={() => {
              setShowRegister(false)
              setShowLogin(true)
            }}
          />
        </div>
      )}

      {/* App Install Modal */}
      <AppInstallModal
        isOpen={showAppInstallModal}
        onClose={() => setShowAppInstallModal(false)}
        isInstallable={isInstallable}
        installApp={installApp}
        isInstalled={isInstalled}
        currentPlatform={currentDevice}
        apkUrl={accountInfo?.service_apk_url}
        accountInfo={accountInfo}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100001] animate-fadeIn">
          <div
            className={`px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 max-w-sm ${toast.type === "success"
              ? "bg-green-500/90 border-green-400/30 text-white"
              : "bg-red-500/90 border-red-400/30 text-white"
              }`}
            style={{ fontFamily: FONTS.ui }}
          >
            <span className="text-sm font-bold">{toast.type === "success" ? "✓" : "⚠"}</span>
            <span className="text-xs font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white text-sm font-bold">✕</button>
          </div>
        </div>
      )}

    </>
  )
}

export default Navbar
