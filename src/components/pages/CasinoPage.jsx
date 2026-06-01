import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useGames } from "../../context/GameContext";
import { useSite } from "../../context/SiteContext";
import { useColors } from "../../hooks/useColors";
import { FONTS } from "../../constants/theme";
import { useNavigate } from "react-router-dom";
import { apiPost } from "@/utils/apiFetch";
import { FaPlay, FaSearch, FaGamepad, FaRocket, FaDiceD20, FaTv, FaTimes } from "react-icons/fa";
import { GiCardAceSpades, GiCardJoker, GiPokerHand, GiTigerHead } from "react-icons/gi";
import Navbar from "../navbar/Navbar";

const GAME_TYPES = [
  { id: 'all', label: 'All Games', icon: <FaGamepad /> },
  { id: 'crash', label: 'Crash Games', icon: <FaRocket /> },
  { id: 'roulette', label: 'Roulette', icon: <FaDiceD20 /> },
  { id: 'blackjack', label: 'Blackjack', icon: <GiCardAceSpades /> },
  { id: 'baccarat', label: 'Baccarat', icon: <GiCardJoker /> },
  { id: 'dragon', label: 'Dragon Tiger', icon: <GiTigerHead /> },
  { id: 'teenpatti', label: 'Teen Patti', icon: <GiPokerHand /> },
  { id: 'sicbo', label: 'Sic Bo', icon: <FaDiceD20 /> },
  { id: 'poker', label: 'Poker', icon: <GiPokerHand /> },
  { id: 'shows', label: 'Game Shows', icon: <FaTv /> },
  { id: 'wheel', label: 'Mega Wheel', icon: <FaDiceD20 /> },
  { id: 'andar', label: 'Andar Bahar', icon: <GiCardJoker /> }
];

const getGameType = (game) => {
  const name = (game["Game Name"] || "").toLowerCase();
  const type = (game.type || "").toLowerCase();
  const combined = name + " " + type;

  if (combined.includes('crash') || combined.includes('aviator') || combined.includes('jetx')) return 'crash';
  if (combined.includes('roulette')) return 'roulette';
  if (combined.includes('blackjack')) return 'blackjack';
  if (combined.includes('baccarat')) return 'baccarat';
  if (combined.includes('dragon') && combined.includes('tiger')) return 'dragon';
  if (combined.includes('teen patti') || combined.includes('teenpatti')) return 'teenpatti';
  if (combined.includes('sic bo') || combined.includes('sicbo')) return 'sicbo';
  if (combined.includes('poker') || combined.includes('holdem') || combined.includes('hold em')) return 'poker';
  if (combined.includes('mega wheel')) return 'wheel';
  if (combined.includes('andar') && combined.includes('bahar')) return 'andar';
  if (combined.includes('crazy time') || combined.includes('monopoly') || combined.includes('show')) return 'shows';
  return 'other';
};

const CasinoPage = () => {
  const COLORS = useColors();
  const navigate = useNavigate();
  const { accountInfo, setShowLogin, refreshSiteData } = useSite();
  const { casino_lobby, casino, turbo, live, slots, fishing, poker } = useGames() || {};

  const [activeType, setActiveType] = useState('all');
  const [activeProvider, setActiveProvider] = useState('all');
  const [providerSearch, setProviderSearch] = useState("");
  const [gameSearch, setGameSearch] = useState("");

  const [loadingForGames, setLoadingForGames] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState({ show: false, game: null, error: null });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Performance: Infinite Scroll
  const [displayLimit, setDisplayLimit] = useState(48);
  const observerTarget = useRef(null);

  // Drag to scroll functionality for the Game Types Bar
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // PERFORMANCE CRITICAL: Pre-compute unique games, types, and provider counts in ONE pass.
  // This prevents running millions of iterations on every render.
  const { allGames, providerCounts } = useMemo(() => {
    const combined = [
      ...(casino_lobby || []),
      ...(casino || []),
      ...(turbo || []),
      ...(live || []),
      ...(slots || []),
      ...(fishing || []),
      ...(poker || [])
    ];

    const uniqueGamesMap = new Map();
    const counts = {};

    for (let i = 0; i < combined.length; i++) {
      const g = combined[i];
      if (g && g["Game UID"] && !uniqueGamesMap.has(g["Game UID"])) {
        const computedType = getGameType(g);
        const providerName = g["Game Provider"] || g.provider || "Unknown";

        uniqueGamesMap.set(g["Game UID"], { ...g, computedType, providerName });
        counts[providerName] = (counts[providerName] || 0) + 1;
      }
    }

    return {
      allGames: Array.from(uniqueGamesMap.values()),
      providerCounts: counts
    };
  }, [casino_lobby, casino, turbo, live, slots, fishing, poker]);

  const providers = useMemo(() => {
    return Object.keys(providerCounts).sort();
  }, [providerCounts]);

  const filteredGames = useMemo(() => {
    let filtered = allGames;
    if (activeType !== 'all') {
      filtered = filtered.filter(g => g.computedType === activeType);
    }
    if (activeProvider !== 'all') {
      filtered = filtered.filter(g => g.providerName === activeProvider);
    }
    if (gameSearch.trim() !== '') {
      const query = gameSearch.toLowerCase();
      filtered = filtered.filter(g => (g["Game Name"] || "").toLowerCase().includes(query));
    }
    return filtered;
  }, [allGames, activeType, activeProvider, gameSearch]);

  // Performance: Reset display limit when filters change
  useEffect(() => {
    setDisplayLimit(48);
  }, [activeType, activeProvider, gameSearch]);

  // Performance: Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setDisplayLimit(prev => prev + 48);
        }
      },
      { threshold: 0.1, rootMargin: "600px" } // Load 600px before reaching the bottom
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredGames.length]);

  // Loading simulation effect
  useEffect(() => {
    if (confirmLoading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      return () => clearInterval(interval);
    } else if (loadingProgress > 0) {
      setLoadingProgress(100);
      const timeout = setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [confirmLoading]);

  const handleGameClick = (game) => {
    const authSecretKey = localStorage.getItem("auth_secret_key");
    if (!authSecretKey) {
      setShowLogin(true);
      return;
    }
    setConfirmPopup({ show: true, game, error: null });
  };

  const confirmGameOpen = async () => {
    const game = confirmPopup.game;
    setLoadingForGames(game["Game UID"]);
    setConfirmLoading(true);

    try {
      const response = await apiPost("route-play-games", {
        GAME_NAME: game["Game Name"],
        GAME_UID: game["Game UID"],
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      if (data.status_code === "balance_error") {
        setConfirmPopup({ show: true, game: game, error: "balance_error" });
      } else if (data.status_code === "authorization_error" || data.status_code === "auth_error") {
        setConfirmPopup({ show: true, game: game, error: "authorization_error" });
      } else if (data.error || !data.data?.game_url) {
        setConfirmPopup({ show: true, game: game, error: data.status_code || "unknown_error" });
      } else if (data.data?.game_url) {
        setTimeout(() => {
          const encodedUrl = btoa(unescape(encodeURIComponent(data.data.game_url)));
          navigate(`/game-url/${encodeURIComponent(encodedUrl)}/${encodeURIComponent(game["Game Name"])}`);
        }, 500);
      }
    } catch (error) {
      console.error("Error launching game:", error);
      setConfirmPopup({ show: true, game: game, error: "network_error" });
    } finally {
      setTimeout(() => {
        setLoadingForGames(null);
        setConfirmLoading(false);
      }, 500);
    }
  };

  function handleAuthError() {
    setConfirmPopup({ show: false, game: null, error: null });
    localStorage.removeItem("auth_secret_key");
    localStorage.removeItem("account_id");
    refreshSiteData();
    navigate("/");
    setShowLogin(true);
  }

  return (
    <div className="w-full flex flex-col bg-gray-50 dark:bg-transparent min-h-screen md:h-[100dvh] overflow-y-auto md:overflow-hidden">
      <Navbar />
      <div className="flex-1 max-w-[1920px] mx-auto w-full px-4 pt-1 pb-24 md:pb-6 flex flex-col md:flex-row gap-3 md:gap-4 min-h-0">

        {/* Sidebar for Providers */}
        <div className="hidden md:flex flex-col w-[260px] shrink-0 rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-lg h-full" style={{ backgroundColor: `${COLORS.bg2}` }}>
          <style>{`
            .sidebar-scroll::-webkit-scrollbar { width: 4px; }
            .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
            .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.3); border-radius: 10px; }
            .sidebar-scroll:hover::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.5); }
          `}</style>
          <div className="p-5 border-b border-black/10 dark:border-white/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-black/50 dark:text-white/50 mb-4" style={{ fontFamily: FONTS.head }}>Providers</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Providers..."
                value={providerSearch}
                onChange={e => setProviderSearch(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 pl-10 text-xs font-medium outline-none focus:border-brand transition-colors text-black dark:text-white"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" size={14} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto sidebar-scroll p-3 space-y-1">
            <button
              onClick={() => setActiveProvider('all')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeProvider === 'all' ? 'bg-brand/10 text-brand shadow-[inset_2px_0_0_0_var(--tw-shadow-color)] shadow-brand' : 'text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${activeProvider === 'all' ? 'bg-brand shadow-[0_0_8px_var(--tw-shadow-color)] shadow-brand' : 'bg-current opacity-50'}`}></div>
                <span className="tracking-wide">All Providers</span>
              </div>
              <span className="text-[10px] bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full font-bold">{allGames.length}</span>
            </button>
            {providers.filter(p => p.toLowerCase().includes(providerSearch.toLowerCase())).map(p => {
              const count = providerCounts[p];
              return (
                <button
                  key={p}
                  onClick={() => setActiveProvider(p)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeProvider === p ? 'bg-brand/10 text-brand shadow-[inset_2px_0_0_0_var(--tw-shadow-color)] shadow-brand' : 'text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeProvider === p ? 'bg-brand shadow-[0_0_8px_var(--tw-shadow-color)] shadow-brand' : 'bg-current opacity-50'}`}></div>
                    <span className="truncate tracking-wide">{p}</span>
                  </div>
                  <span className="text-[10px] bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full font-bold shrink-0">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-auto md:h-full overflow-visible md:overflow-hidden">

          {/* Premium Segmented Game Types Bar */}
          <div className="shrink-0 relative mb-3 md:mb-4 w-full max-w-full">
            <style>{`
              .game-tabs-scroll::-webkit-scrollbar { height: 3px; }
              .game-tabs-scroll::-webkit-scrollbar-track { background: transparent; margin: 0 16px; }
              .game-tabs-scroll::-webkit-scrollbar-thumb { background: rgba(230, 160, 0, 0.4); border-radius: 10px; cursor: pointer; }
              .game-tabs-scroll:hover::-webkit-scrollbar-thumb { background: rgba(230, 160, 0, 0.8); }
              .game-tabs-scroll { scrollbar-width: none; } /* Hide native firefox to use only webkit/custom */
            `}</style>
            <div
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex items-center p-0.5 md:p-1 overflow-x-auto overflow-y-hidden w-full rounded-[12px] md:rounded-[16px] bg-[#1a1a1a] dark:bg-white/[0.02] border border-black/10 dark:border-white/5 shadow-inner game-tabs-scroll ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{
                WebkitOverflowScrolling: "touch",
                userSelect: "none"
              }}
            >
              {GAME_TYPES.map(type => {
                const isActive = activeType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => !isDragging && setActiveType(type.id)}
                    className={`shrink-0 relative flex items-center gap-1.5 md:gap-2 whitespace-nowrap px-3 py-1.5 md:px-4 md:py-2.5 rounded-[9px] md:rounded-[12px] font-bold transition-all duration-300 z-10 select-none ${isActive
                        ? 'text-black shadow-[0_6px_15px_rgba(230,160,0,0.25)] scale-[1.01] mx-0.5 md:mx-1'
                        : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    style={{ fontFamily: FONTS.ui }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-brand rounded-[9px] md:rounded-[12px] -z-10 border border-white/20"></div>
                    )}
                    <span className={`text-[13px] md:text-[16px] transition-transform duration-300 ${isActive ? 'text-black scale-105' : 'text-brand grayscale-[20%]'}`}>{type.icon}</span>
                    <span className="tracking-widest uppercase text-[9px] md:text-[11px] sm:text-[12px]">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Providers Selector (hidden on desktop) */}
          <div className="shrink-0 md:hidden mb-2 relative">
            <select
              value={activeProvider}
              onChange={(e) => setActiveProvider(e.target.value)}
              className="w-full bg-white dark:bg-[#14141E] border border-black/10 dark:border-white/10 rounded-[10px] py-2.5 pl-4 pr-10 text-xs font-bold appearance-none bg-none outline-none text-black dark:text-white shadow-sm"
              style={{ fontFamily: FONTS.ui, backgroundImage: 'none' }}
            >
              <option value="all">All Providers ({allGames.length})</option>
              {providers.map(p => (
                <option key={p} value={p}>{p} ({providerCounts[p]})</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand text-[10px]">▼</div>
          </div>

          {/* Result Bar */}
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 px-2">
            <span className="text-[13px] text-black/60 dark:text-white/60 font-medium hidden sm:block" style={{ fontFamily: FONTS.ui }}>
              Showing <strong className="text-black dark:text-white font-black">{filteredGames.length}</strong> games for <strong className="text-brand font-bold">{activeProvider === 'all' ? 'All Providers' : activeProvider}</strong>
            </span>
            <div className="relative w-full sm:w-auto sm:min-w-[250px] lg:min-w-[300px]">
              <input
                type="text"
                placeholder="Search Games..."
                value={gameSearch}
                onChange={e => setGameSearch(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2 px-4 pl-10 text-xs font-medium outline-none focus:border-brand transition-colors text-black dark:text-white"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" size={14} />
              {gameSearch && (
                <button onClick={() => setGameSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">
                  <FaTimes size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-visible md:overflow-y-auto custom-scrollbar pr-1 md:pr-2 pb-28 md:pb-10 relative">
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {filteredGames.length === 0 ? (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
                  <FaGamepad className="text-6xl text-black/10 dark:text-white/10 mb-6" />
                  <h3 className="text-xl font-black text-black/80 dark:text-white/80 uppercase tracking-widest mb-2" style={{ fontFamily: FONTS.head }}>No Games Found</h3>
                  <p className="text-sm text-black/50 dark:text-white/50 max-w-md">Try selecting a different provider or game category to see available games.</p>
                  <button
                    onClick={() => { setActiveType('all'); setActiveProvider('all'); }}
                    className="mt-6 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all bg-brand/10 text-brand hover:bg-brand hover:text-black"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredGames.slice(0, displayLimit).map((game, idx) => (
                  <div key={`${game["Game UID"]}-${idx}`} className="flex flex-col group cursor-pointer" onClick={() => handleGameClick(game)}>
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden p-[1px] bg-gradient-to-br from-black/10 via-transparent to-black/5 dark:from-white/10 dark:via-transparent dark:to-white/5 transition-all duration-300 group-hover:from-brand/50 group-hover:to-brand/20 group-hover:-translate-y-1">
                      <div className="relative w-full h-full rounded-[11px] overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
                        <img
                          loading="lazy"
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${loadingForGames === game["Game UID"] ? "opacity-30 blur-sm" : ""}`}
                          src={game.icon || "/placeholder.svg"}
                          alt={game["Game Name"]}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div
                            className="p-3.5 rounded-full shadow-2xl transform scale-50 group-hover:scale-100 transition-all duration-300 hover:scale-110"
                            style={{ background: COLORS.brandGradient }}
                          >
                            <FaPlay className="text-black dark:text-white ml-0.5" size={14} />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <div className="bg-white/95 dark:bg-black/80 rounded-lg p-2 border border-black/10 dark:border-white/10 text-center shadow-xl">
                            <p className="text-[10px] sm:text-xs font-black text-black dark:text-white truncate uppercase tracking-tighter" style={{ fontFamily: FONTS.head }}>
                              {game["Game Name"]}
                            </p>
                            <p className="text-[8px] sm:text-[9px] text-brand uppercase font-bold mt-0.5 opacity-80 truncate">{game["Game Provider"] || game.provider || "Casino"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Infinite Scroll Loading Trigger */}
            {filteredGames.length > displayLimit && (
              <div ref={observerTarget} className="w-full flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Popup Modal */}
      {confirmPopup.show && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur-2xl z-[100000] transition-all duration-500 animate-fadeIn">
          <div
            className="relative p-10 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] max-w-sm w-full mx-6 animate-fadeInUp border border-black/10 dark:border-white/10 text-center"
            style={{
              backgroundColor: `${COLORS.bg2}F2`,
              backgroundImage: 'radial-gradient(circle at top right, rgba(230, 160, 0, 0.05), transparent 40%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-[2.5rem]"></div>
            <div
              className="absolute -top-10 left-1/2 transform -translate-x-1/2 p-6 rounded-full shadow-2xl animate-bounce-slow"
              style={{ background: COLORS.brandGradient }}
            >
              <FaPlay className="text-black dark:text-white ml-0.5" size={28} />
            </div>

            <div className="relative z-10 mt-8 mb-8">
              {confirmPopup.error === "balance_error" ? (
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-brand tracking-tight uppercase" style={{ fontFamily: FONTS.head }}>Insufficient Balance</h3>
                  <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed px-2">A minimum deposit of <span className="text-black dark:text-white font-bold">₹100</span> is required to access this premium experience.</p>
                </div>
              ) : confirmPopup.error === "authorization_error" ? (
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-red-500 tracking-tight uppercase" style={{ fontFamily: FONTS.head }}>Session Expired</h3>
                  <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed px-2">Your session has expired or you are not authorized to play this game. Please try logging in again.</p>
                </div>
              ) : confirmPopup.error ? (
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-red-500 tracking-tight uppercase" style={{ fontFamily: FONTS.head }}>Game Unavailable</h3>
                  <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed px-2">This game is currently unavailable ({confirmPopup.error}). Please try another one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-black dark:text-white tracking-tight uppercase" style={{ fontFamily: FONTS.head }}>READY TO WIN?</h3>
                  <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed px-2">You are about to enter <span className="text-black dark:text-white font-bold">{confirmPopup.game?.["Game Name"]}</span>. Good luck!</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-8">
              {confirmPopup.error === "balance_error" ? (
                <button
                  onClick={() => setConfirmPopup({ show: false, game: null, error: null })}
                  className="w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-95 group overflow-hidden relative"
                  style={{ background: COLORS.brandGradient, fontFamily: FONTS.ui }}
                >
                  <div className="absolute inset-0 bg-gray-100 dark:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Add Funds</span>
                </button>
              ) : confirmPopup.error === "authorization_error" ? (
                <button
                  onClick={handleAuthError}
                  className="w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-95 group overflow-hidden relative text-black dark:text-white"
                  style={{ background: COLORS.brandGradient, fontFamily: FONTS.ui }}
                >
                  <div className="absolute inset-0 bg-gray-100 dark:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Log In Again</span>
                </button>
              ) : confirmPopup.error ? (
                <button
                  onClick={() => setConfirmPopup({ show: false, game: null, error: null })}
                  className="w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-95 group overflow-hidden relative text-black dark:text-white"
                  style={{ background: COLORS.brandGradient, fontFamily: FONTS.ui }}
                >
                  <div className="absolute inset-0 bg-gray-100 dark:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Try Other Game</span>
                </button>
              ) : (
                <button
                  onClick={confirmGameOpen}
                  className="w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-95 group overflow-hidden relative text-black dark:text-white"
                  style={{ background: COLORS.brandGradient, fontFamily: FONTS.ui }}
                >
                  <div className="absolute inset-0 bg-gray-100 dark:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Confirm Play</span>
                </button>
              )}

              <button
                onClick={() => setConfirmPopup({ show: false, game: null, error: null })}
                className="w-full px-6 py-3 rounded-2xl font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/5 text-black/60 dark:text-white/60 hover:text-black dark:text-white hover:bg-gray-100 dark:bg-white/10 transition-all duration-300 border border-black/5 dark:border-white/5"
                style={{ fontFamily: FONTS.ui }}
              >
                {confirmPopup.error === "balance_error" ? "Close" : "Cancel"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Loading Modal */}
      {confirmLoading && createPortal(
        <div className="fixed inset-0 bg-black/25 dark:bg-black/60 backdrop-blur-2xl z-[100000] flex flex-col items-center justify-center transition-all duration-700 animate-fadeIn p-4 overflow-y-auto">
          <div
            className="w-[90%] max-w-[340px] md:max-w-md px-5 py-6 md:px-8 md:py-10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-black/10 dark:border-white/10 relative overflow-hidden text-center max-h-[92vh] overflow-y-auto scrollbar-none"
            style={{
              backgroundColor: `${COLORS.bg2}F2`,
              backgroundImage: 'radial-gradient(circle at top right, rgba(230, 160, 0, 0.05), transparent 40%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>

            <div className="relative z-10 mb-6 md:mb-8">
              {confirmPopup.game && (
                <div className="flex flex-col items-center">
                  <div className="relative mb-4 md:mb-6 group">
                    <div className="absolute -inset-4 bg-brand/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-black/10 dark:border-white/10 shadow-2xl transform transition-transform duration-700 hover:scale-105">
                      <img
                        src={confirmPopup.game.icon || "/placeholder.svg"}
                        alt={confirmPopup.game["Game Name"]}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-black dark:text-white mb-1.5 md:mb-2 tracking-wider uppercase" style={{ fontFamily: FONTS.head }}>
                    {confirmPopup.game["Game Name"]}
                  </h3>
                  <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-[0.2em] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-brand shadow-[0_0_10px_rgba(230,160,0,1)]"></span>
                    Initializing Elite Experience
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 px-2 md:px-4 mb-6 md:mb-10">
              <div className="w-full bg-gray-200 dark:bg-white/5 rounded-full h-1 overflow-hidden backdrop-blur-sm border border-black/5 dark:border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out relative"
                  style={{
                    width: `${loadingProgress}%`,
                    background: COLORS.brandGradient,
                    boxShadow: `0 0 20px ${COLORS.brand}80`
                  }}
                >
                  <div className="absolute top-0 right-0 w-8 h-full bg-white/40 blur-sm animate-shimmer"></div>
                </div>
              </div>
              <div className="flex justify-between mt-3 px-1">
                <span className="text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-widest">Connection Status</span>
                <span className="text-[10px] text-brand font-black italic">{Math.round(loadingProgress)}%</span>
              </div>
            </div>

            {/* Checklist steps */}
            <div className="relative z-10 space-y-4 px-2 mb-6 md:mb-10 text-left">
              {[
                { label: "Establishing Connection", threshold: 30 },
                { label: "Syncing Game Assets", threshold: 60 },
                { label: "Optimizing Performance", threshold: 85 }
              ].map((step, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <span className={`text-xs transition-colors duration-500 ${loadingProgress > step.threshold ? "text-black/80 dark:text-white/80" : "text-black/20 dark:text-white/20"}`} style={{ fontFamily: FONTS.ui }}>
                    {step.label}
                  </span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-700 ${loadingProgress > step.threshold
                    ? "border-brand/40 bg-brand/10 text-brand scale-110 shadow-[0_0_15px_rgba(230,160,0,0.2)]"
                    : "border-black/5 dark:border-white/5 bg-gray-100 dark:bg-white/2"
                    }`}>
                    {loadingProgress > step.threshold ? (
                      <span className="text-[10px] font-bold">✓</span>
                    ) : (
                      <div className="w-1 h-1 bg-gray-100 dark:bg-white/10 rounded-full animate-ping"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pro Tip Card */}
            <div className="relative z-10 py-4 px-6 rounded-2xl bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-md group hover:bg-white/[0.08] transition-all duration-500">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-5 h-[1px] bg-brand/50"></div>
                <span className="text-[10px] text-brand/80 font-black uppercase tracking-widest">Pro Tip</span>
              </div>
              <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed font-medium italic">
                "Enable high performance mode in settings for the smoothest gameplay experience."
              </p>
            </div>
          </div>

          {/* Site Elite Signature at bottom of modal page */}
          <div className="mt-8 flex items-center gap-4 opacity-30 relative z-10">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/50"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black dark:text-white">{accountInfo?.service_site_name || 'Site'} Elite</span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/50"></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CasinoPage;
