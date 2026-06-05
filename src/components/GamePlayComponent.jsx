/*
  Author: DevKilla
  Buy Code From: jinkteam.com
  Contact: @devkilla (Telegram)
*/


"use client"

import { useState, useEffect } from "react"
import { FaArrowLeft, FaWallet, FaExpand, FaCompress, FaTrophy, FaTimesCircle, FaPlus, FaLock } from "react-icons/fa"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { API_URL } from "@/utils/constants"
import { useColors } from '../hooks/useColors'
import { FONTS } from '../constants/theme'
import { useSite } from "../context/SiteContext"

const GameplayComponent = () => {
  const { gameUrl: encodedUrl, gameName } = useParams()
  const navigate = useNavigate()
  const COLORS = useColors()
  const { accountInfo, refreshSiteData, notice, setNotice, deactivateDemoMode } = useSite()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [mouseIdle, setMouseIdle] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const authSecretKey = localStorage.getItem("auth_secret_key");
  const userId = localStorage.getItem("account_id");

  // Deactivate Demo Mode when leaving the game screen or closing the tab
  useEffect(() => {
    const handleUnload = () => {
      if (userId === "guest" && deactivateDemoMode) deactivateDemoMode();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (userId === "guest" && deactivateDemoMode) deactivateDemoMode();
    };
  }, [userId, deactivateDemoMode]);

  // Real-time Win/Loss Notifications
  const [lastProcessedId, setLastProcessedId] = useState(null)
  const [showResultPop, setShowResultPop] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const isWin = lastResult?.r_match_status === "profit" || lastResult?.r_match_status === "cashout";
  const isRejected = lastResult?.r_match_status === "rejected";

  // Poller: asks the backend for any new settled results to notify about.
  // The backend controls timing (60s for live casino, 8s for slots).
  // Each notification is marked as sent server-side so it never repeats.
  useEffect(() => {
    if (!userId || !authSecretKey) return;

    const pollNotifications = async () => {
      console.log("Polling notifications for User:", userId);
      try {
        const fetchUrl = `${API_URL}?USER_ID=${userId}&Route=route-game-notifications&AuthToken=${authSecretKey}`;
        console.log("Fetch URL:", fetchUrl);

        const response = await fetch(fetchUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Route: "route-game-notifications",
            AuthToken: authSecretKey,
          },
        });
        const result = await response.json();
        console.log("Poll Result:", result);

        // Backend returns "success" only when there are pending notifications whose delay has passed
        if (result.status_code === "success" && result.data && result.data.length > 0) {
          // Show the most recent notification (last item = newest)
          const latestNotification = result.data[0];
          refreshSiteData(); // Refresh balance display
          setLastResult(latestNotification);
          setShowResultPop(false);
          setTimeout(() => setShowResultPop(true), 50);
        }
      } catch (err) {
        console.error("Notification poller error:", err);
      }
    };

    const interval = setInterval(() => {
      pollNotifications();
    }, 4000);
    pollNotifications(); // Check immediately on mount
    return () => clearInterval(interval);
  }, [userId, authSecretKey, refreshSiteData]);

  // Unified Auto-Hide for Result/Rejection Popups
  useEffect(() => {
    if (showResultPop && lastResult) {
      const duration = lastResult.r_match_status === "rejected" ? 8000 : 5000;
      const timer = setTimeout(() => {
        setShowResultPop(false);
        setNotice(null);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [showResultPop, lastResult, setNotice]);

  // Handle System Notices (like Bet Rejection) inside Gameplay
  useEffect(() => {
    if (notice && (notice.title === "Bet Rejected" || notice.title.includes("Bet Rejected"))) {
      setLastResult({
        r_match_name: "System",
        r_match_status: "rejected",
        message: notice.message,
        is_rejection: true
      });
      setShowResultPop(false);
      setTimeout(() => setShowResultPop(true), 50);
    }
  }, [notice]);

  // Decode URL from Base64 if it's encoded, otherwise use as is
  const getDecodedUrl = (str) => {
    try {
      if (!str) return "";
      const decodedStr = decodeURIComponent(str);
      if (decodedStr.includes("://")) return decodedStr;
      return decodeURIComponent(escape(atob(decodedStr)));
    } catch (e) {
      return decodeURIComponent(str);
    }
  };

  const gameUrl = getDecodedUrl(encodedUrl);

  const handleBack = () => setShowExitConfirm(true)
  const confirmExit = () => navigate('/')
  const cancelExit = () => setShowExitConfirm(false)



  // Handle deposit button click
  const handleDeposit = () => {
    if (userId === "guest") {
      setNotice({
        id: "deposit_guest_reject_" + Date.now(),
        title: "Bet Rejected",
        message: "Demo Mode. Logged-in users can only deposit and play for real money. Please register or log in!"
      });
      return;
    }
    navigate("/deposit")
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true)
        })
        .catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => {
            setIsFullscreen(false)
          })
          .catch((err) => {
            console.error(`Error attempting to exit fullscreen: ${err.message}`)
          })
      }
    }
  }

  // Auto-hide header when mouse is idle + Aggressive Hide EasySocial Widget
  useEffect(() => {
    let timeout

    // Inject global CSS to hide EasySocial widget aggressively
    const style = document.createElement('style');
    style.id = 'hide-easysocial-style';
    style.innerHTML = `
      .es-chat-widget, 
      #es-chat-widget,
      [class*="easysocial"], 
      [id*="easysocial"],
      .es-widget-bubble,
      #es-widget-bubble { 
        display: none !important; 
        visibility: hidden !important; 
        opacity: 0 !important; 
        pointer-events: none !important; 
      }
    `;
    document.head.appendChild(style);

    // Refresh balance every 2 seconds while playing (in addition to result-based refreshes)
    const balanceInterval = setInterval(() => {
      refreshSiteData();
    }, 2000);

    const resetTimer = () => {
      clearTimeout(timeout)
      setMouseIdle(false)
      setIsHeaderVisible(true)

      timeout = setTimeout(() => {
        setMouseIdle(true)
        setIsHeaderVisible(false)
      }, 3000) // Hide after 3 seconds of inactivity
    }

    window.addEventListener("mousemove", resetTimer)
    resetTimer()

    return () => {
      window.removeEventListener("mousemove", resetTimer)
      clearTimeout(timeout)
      clearInterval(balanceInterval);
      // Remove the style tag to restore widget on other pages
      const addedStyle = document.getElementById('hide-easysocial-style');
      if (addedStyle) addedStyle.remove();
    }
  }, [refreshSiteData])

  return (
    <div className="gameplay-shell fixed inset-0 flex flex-col overflow-hidden">
      {/* Header - Premium Glassmorphism Design */}
      <div
        className={`gameplay-topbar ${isHeaderVisible ? "" : "hidden"
          }`}
      >
        {/* Left Side: Back & Branding */}
        <div className="gameplay-left">
          <button
            onClick={handleBack}
            className="gameplay-back"
            title="Back to games"
          >
            <FaArrowLeft />
          </button>

          <div className="gameplay-game-meta">
            <i className="gameplay-live-dot"></i>
            <div>
            <h1
              style={{ fontFamily: FONTS.head }}
            >
              {decodeURIComponent(gameName)}
            </h1>
            <span>Live session active</span>
            </div>
          </div>
        </div>

        {/* Right Side: Balance and Controls */}
        <div className="gameplay-right">
          {/* Total exposure across all open bets (sports + casino + live) */}
          {userId !== "guest" && (
            <div className="gameplay-stat-card exposure" title="Total exposure from all open bets">
              <div>
                <small>Total Exp</small>
                <strong style={{ fontFamily: FONTS.ui }}>
                  ₹{parseFloat(accountInfo?.account_exposure || 0).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="gameplay-stat-icon">
                <FaLock />
              </div>
            </div>
          )}

          {/* Balance Display (Optimized for all screens) */}
          <div className="gameplay-stat-card">
            <div>
              <small>
                {userId === "guest" ? "Demo Balance" : "Balance"}
              </small>
              <strong style={{ fontFamily: FONTS.ui }}>
                ₹{parseFloat(accountInfo?.account_balance || 0).toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="gameplay-stat-icon">
              <FaWallet />
            </div>
          </div>

          <div className="gameplay-right">
            <button
              onClick={handleDeposit}
              className="gameplay-deposit-btn"
            >
              <FaPlus />
              <span>Deposit</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="gameplay-icon-btn"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>
      </div>

      <div className="gameplay-frame-wrap flex-1 w-full relative">
        {/* Show a hint to move mouse when header is hidden */}
        {mouseIdle && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] md:text-xs py-1.5 px-4 rounded-full z-10 animate-pulse border border-white/10 font-black uppercase tracking-widest">
            Move mouse to show controls
          </div>
        )}

        <iframe
          src={gameUrl}
          title={decodeURIComponent(gameName)}
          className="w-full h-full border-0"
          allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* Result Notification (Toast for Win/Loss, Modal for Rejection) */}
      {/*
        Win/Loss toast is commented out to temporarily disable popups for match outcomes.
        To re-enable, remove the commented block below and restore the original conditional.
      */}
      {/*
      {!isRejected ? (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[150] transition-all duration-700 pointer-events-none ${showResultPop ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
            }`}
        >
          <div className={`
            flex items-center gap-4 px-6 py-4 rounded-3xl border shadow-2xl backdrop-blur-md
            ${isWin
                ? "bg-emerald-500/90 border-emerald-400/50 text-white"
                : "bg-rose-500/90 border-rose-400/50 text-white"}
          `}>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
              {isWin ? <FaTrophy className="text-2xl animate-bounce" /> : <FaTimesCircle className="text-2xl" />}
            </div>
            <div className="max-w-[200px] md:max-w-[300px]">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">
                {lastResult?.r_match_name} Result
              </p>
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none mb-1">
                {isWin ? "You Won!" : "You Lost"}
              </h3>
              <p className="text-xs md:text-sm font-bold leading-snug">
                {`${isWin ? "+" : "-"}₹${parseFloat(isWin ? lastResult?.r_match_profit : lastResult?.r_match_amount || 0).toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        showResultPop && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowResultPop(false)} />
            <div className="relative bg-[#1a1a1a] border-2 border-rose-500/50 p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-[0_0_100px_rgba(244,63,94,0.3)] animate-in zoom-in-95 duration-300 overflow-hidden">
               
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-rose-500 shadow-[0_0_20px_#f43f5e]" />
               
               <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <FaTimesCircle className="text-4xl text-rose-500 animate-pulse" />
               </div>
               
               <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter" style={{ fontFamily: FONTS.head }}>
                  Bet Rejected
               </h2>
               <p className="text-white/70 font-semibold mb-8 leading-relaxed">
                  {lastResult?.message}
               </p>
               
               <button 
                onClick={() => {
                  setShowResultPop(false);
                  setNotice(null);
                }}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(244,63,94,0.4)] active:scale-95"
               >
                Understood
               </button>
            </div>
          </div>
        )
      )
      */}
      {/* Rejection modal still rendered when a bet is rejected */}
      {isRejected && showResultPop && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowResultPop(false)} />
          <div className="relative bg-[#1a1a1a] border-2 border-rose-500/50 p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-[0_0_100px_rgba(244,63,94,0.3)] animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-rose-500 shadow-[0_0_20px_#f43f5e]" />
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FaTimesCircle className="text-4xl text-rose-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter" style={{ fontFamily: FONTS.head }}>
              Bet Rejected
            </h2>
            <p className="text-white/70 font-semibold mb-8 leading-relaxed">
              {lastResult?.message}
            </p>
            <button
              onClick={() => {
                setShowResultPop(false);
                setNotice(null);
              }}
              className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(244,63,94,0.4)] active:scale-95"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500"
            onClick={cancelExit}
          />

          {/* Modal Content */}
          <div
            className="relative border border-[var(--bg4)] rounded-[2.5rem] p-10 max-w-sm w-full shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 text-center overflow-hidden"
            style={{
              backgroundColor: 'var(--bg2)',
              backgroundImage: 'radial-gradient(circle at top right, rgba(230, 160, 0, 0.05), transparent 40%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-[2.5rem]"></div>

            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl group"
              style={{ background: 'var(--brand-gradient)' }}
            >
              <FaArrowLeft className="text-white text-xl group-hover:-translate-x-1 transition-transform" />
            </div>

            <h2
              className="text-2xl font-black mb-3 uppercase tracking-tighter"
              style={{ fontFamily: FONTS.head, color: 'var(--text)' }}
            >
              End Session?
            </h2>
            <p className="mb-10 px-2 leading-relaxed font-medium text-sm" style={{ color: 'var(--muted)' }}>
              Are you sure you want to exit <span className="font-bold" style={{ color: 'var(--text)' }}>{decodeURIComponent(gameName)}</span>? Your balance is safe.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmExit}
                className="py-4 px-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-500 shadow-xl active:scale-95 group relative overflow-hidden"
                style={{ background: 'var(--brand-gradient)', color: '#FFFFFF' }}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span>Exit Now</span>
              </button>
              <button
                onClick={cancelExit}
                className="py-4 px-6 rounded-2xl font-black uppercase text-xs tracking-widest transition-all duration-300 border border-[var(--bg4)] hover:opacity-80"
                style={{
                  backgroundColor: 'var(--bg3)',
                  color: 'var(--text)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameplayComponent
