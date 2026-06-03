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

import RanaHeader from "../home/ranamatch/RanaHeader";
import AuthModalHost from "../common/AuthModalHost";
import '../../assets/css/ranamatch.css';

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

  const [displayLimit, setDisplayLimit] = useState(48);
  const observerTarget = useRef(null);

  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    document.body.style.backgroundColor = '#0f0a1a'; // Official ranamatch background
    document.body.style.color = '#FFFFFF';
    document.body.style.fontFamily = "var(--font-ui)";
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.style.fontFamily = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
    }
  }, []);

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

  useEffect(() => {
    setDisplayLimit(48);
  }, [activeType, activeProvider, gameSearch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setDisplayLimit(prev => prev + 48);
        }
      },
      { threshold: 0.1, rootMargin: "600px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredGames.length]);

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
    <div className="rana-layout" style={{ height: 'auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AuthModalHost />
      <RanaHeader />
      
      <div className="page-wrap casino-main-wrap" style={{ padding: '30px', maxWidth: '1800px', margin: '0 auto', width: '100%', flex: 1 }}>
        <style>{`
          .casino-main-wrap {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 40px;
          }
          @media (max-width: 1024px) {
            .casino-main-wrap {
              display: flex;
              flex-direction: column;
              padding: 15px;
            }
          }

          /* Neo Glass Sidebar */
          .neo-sidebar {
            background: rgba(20, 20, 30, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-right: 2px solid rgba(29, 78, 216, 0.3);
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(29, 78, 216, 0.05);
          }
          .neo-side-title {
            font-family: var(--font-head);
            font-size: 16px;
            font-weight: 800;
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .neo-side-title::before {
            content: '';
            width: 4px;
            height: 20px;
            background: var(--gold);
            border-radius: 4px;
            box-shadow: 0 0 12px var(--gold);
          }
          .neo-search-input {
            width: 100%;
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 12px 16px 12px 40px;
            color: #fff;
            font-size: 13px;
            outline: none;
            transition: all 0.3s;
          }
          .neo-search-input:focus {
            border-color: var(--brand);
            box-shadow: 0 0 15px rgba(29, 78, 216, 0.3);
          }
          .neo-prov-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            border-radius: 12px;
            margin-bottom: 8px;
            background: rgba(255,255,255,0.015);
            border: 1px solid transparent;
            color: #999;
            font-family: var(--font-ui);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .neo-prov-item:hover {
            background: rgba(29, 78, 216, 0.08);
            border-color: rgba(29, 78, 216, 0.2);
            color: #fff;
            transform: translateX(6px);
          }
          .neo-prov-item.active {
            background: var(--brand-gradient);
            color: #fff;
            box-shadow: 0 6px 20px rgba(29, 78, 216, 0.4);
            border-color: rgba(255,255,255,0.1);
          }

          /* Neo Top Nav */
          .neo-type-nav {
            display: flex;
            gap: 8px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            margin-bottom: 24px;
          }
          .neo-type-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 16px;
            color: #777;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            font-family: var(--font-head);
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .neo-type-item:hover {
            color: #fff;
            background: rgba(255,255,255,0.03);
          }
          .neo-type-item.active {
            color: var(--gold);
            background: rgba(34, 211, 238, 0.08);
          }
          .neo-type-item.active::after {
            content: '';
            position: absolute;
            bottom: -21px;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            height: 3px;
            border-radius: 3px;
            background: var(--gold);
            box-shadow: 0 -2px 15px var(--gold);
          }
          .neo-type-icon { font-size: 20px; margin-bottom: 2px; }

          /* Neo Game Cards */
          .neo-card {
            position: relative;
            border-radius: 20px;
            overflow: hidden;
            background: #111;
            border: 1px solid rgba(255,255,255,0.04);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          }
          .neo-card:hover {
            transform: translateY(-8px) scale(1.03);
            border-color: var(--gold);
            box-shadow: 0 15px 40px rgba(34, 211, 238, 0.2), 0 0 20px rgba(34, 211, 238, 0.15) inset;
          }
          .neo-card-img-wrap {
            position: relative;
            padding-top: 100%;
            overflow: hidden;
          }
          .neo-card-img-wrap img {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            object-fit: cover;
            transition: transform 0.7s ease;
          }
          .neo-card:hover .neo-card-img-wrap img {
            transform: scale(1.18) rotate(3deg);
            filter: brightness(1.1);
          }
          .neo-card-info {
            padding: 16px 14px;
            background: linear-gradient(180deg, rgba(18,15,28,0.95) 0%, rgba(10,5,15,1) 100%);
            position: relative;
            z-index: 2;
            border-top: 1px solid rgba(255,255,255,0.05);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .neo-card-title {
            font-family: var(--font-head);
            color: #fff;
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            letter-spacing: 1px;
            width: 100%;
          }
          .neo-card-prov {
            font-family: var(--font-ui);
            color: var(--brand);
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            margin-top: 6px;
            letter-spacing: 1.5px;
            transition: color 0.3s;
          }
          .neo-card:hover .neo-card-prov {
            color: var(--gold);
          }
          .neo-play-btn {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%) scale(0.5);
            width: 56px; height: 56px;
            border-radius: 50%;
            background: rgba(29, 78, 216, 0.9);
            color: #fff;
            display: flex; align-items: center; justify-content: center;
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 0 30px var(--brand);
            z-index: 3;
            border: 2px solid rgba(255,255,255,0.2);
          }
          .neo-card:hover .neo-play-btn {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }

          .side-list-scroll::-webkit-scrollbar { width: 4px; }
          .side-list-scroll::-webkit-scrollbar-track { background: transparent; }
          .side-list-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        `}</style>
        
        {/* LEFT SIDEBAR */}
        <div className="hidden lg:flex flex-col">
          <div className="neo-sidebar flex-1 max-h-[calc(100vh-140px)] flex flex-col sticky top-[100px]">
            <div className="neo-side-title">
              Game Providers
            </div>
            
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search Providers..."
                value={providerSearch}
                onChange={e => setProviderSearch(e.target.value)}
                className="neo-search-input"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={14} />
            </div>

            <div className="side-list-scroll flex-1 overflow-y-auto pr-2">
              <div onClick={() => setActiveProvider('all')} className={`neo-prov-item ${activeProvider === 'all' ? 'active' : ''}`}>
                <span className="tracking-wide">All Providers</span>
                <span className="opacity-80 text-[11px] font-bold bg-black/20 px-2 py-0.5 rounded-full">{allGames.length}</span>
              </div>
              {providers.filter(p => p.toLowerCase().includes(providerSearch.toLowerCase())).map(p => (
                <div key={p} onClick={() => setActiveProvider(p)} className={`neo-prov-item ${activeProvider === p ? 'active' : ''}`}>
                  <span className="truncate max-w-[150px] tracking-wide" title={p}>{p}</span>
                  <span className="opacity-80 text-[11px] font-bold bg-black/20 px-2 py-0.5 rounded-full">{providerCounts[p]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="min-w-0 flex flex-col">
          
          {/* Top Categories */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`neo-type-nav overflow-x-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: "touch", userSelect: "none" }}
          >
            {GAME_TYPES.map(type => {
              const isActive = activeType === type.id;
              return (
                <div
                  key={type.id}
                  onClick={() => !isDragging && setActiveType(type.id)}
                  className={`neo-type-item ${isActive ? 'active' : ''}`}
                >
                  <span className="neo-type-icon">{type.icon}</span>
                  {type.label}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
             <div className="text-[14px] text-gray-400 font-medium" style={{ fontFamily: 'var(--font-ui)' }}>
               Showing <strong className="text-white mx-1">{filteredGames.length}</strong> games for <strong className="text-[var(--brand)] ml-1 tracking-wider uppercase text-xs">{activeProvider === 'all' ? 'All Providers' : activeProvider}</strong>
             </div>
             
             {/* Search */}
             <div className="relative shrink-0 sm:w-72">
               <input
                 type="text"
                 placeholder="Search games..."
                 value={gameSearch}
                 onChange={e => setGameSearch(e.target.value)}
                 className="neo-search-input"
                 style={{ borderRadius: '20px', paddingLeft: '44px' }}
               />
               <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={14} />
               {gameSearch && (
                 <button onClick={() => setGameSearch("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                   <FaTimes size={14} />
                 </button>
               )}
             </div>
          </div>

          {/* GAME GRID */}
          {filteredGames.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center bg-[rgba(20,20,30,0.4)] rounded-3xl border border-[rgba(255,255,255,0.05)] backdrop-blur-sm">
              <FaGamepad className="text-6xl text-white/10 mb-6" />
              <h3 className="text-2xl font-bold text-white/80 uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-head)' }}>No Games Found</h3>
              <p className="text-[15px] text-white/40 max-w-md">We couldn't find any games matching your current filters.</p>
              <button
                onClick={() => { setActiveType('all'); setActiveProvider('all'); setGameSearch(""); }}
                className="mt-8 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[12px] transition-all bg-[var(--brand-gradient)] text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(29,78,216,0.5)]"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 pb-16">
              {filteredGames.slice(0, displayLimit).map((game, idx) => (
                <div key={`${game["Game UID"]}-${idx}`} className="neo-card" onClick={() => handleGameClick(game)}>
                  <div className="neo-card-img-wrap">
                    <img
                      loading="lazy"
                      src={game.icon || "/placeholder.svg"}
                      alt={game["Game Name"]}
                    />
                    <div className="neo-play-btn">
                      <FaPlay className="ml-1" size={20} />
                    </div>
                  </div>
                  <div className="neo-card-info">
                    <div className="neo-card-title">{game["Game Name"]}</div>
                    <div className="neo-card-prov">{game["Game Provider"] || game.provider || "Casino"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          {filteredGames.length > displayLimit && (
            <div ref={observerTarget} className="w-full flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {confirmPopup.show && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl z-[100000] p-4 transition-all duration-300">
          <div className="bg-[rgba(20,20,30,0.9)] border border-[rgba(255,255,255,0.1)] p-10 rounded-[2rem] max-w-md w-full text-center shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-[var(--brand-gradient)]"></div>
             
             <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-6 border-2 border-[var(--brand)] shadow-[0_0_30px_rgba(29,78,216,0.3)]">
                <img src={confirmPopup.game?.icon || "/placeholder.svg"} alt="Game" className="w-full h-full object-cover" />
             </div>

             <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-head)' }}>
               {confirmPopup.error === "balance_error" ? "Insufficient Balance" : 
                confirmPopup.error === "authorization_error" ? "Session Expired" : 
                confirmPopup.error ? "Game Unavailable" : 
                "Ready to Play?"}
             </h3>

             <p className="text-[15px] text-gray-400 mb-8 leading-relaxed">
               {confirmPopup.error === "balance_error" ? "A minimum deposit is required to play this game." :
                confirmPopup.error === "authorization_error" ? "Please log in again to continue." :
                confirmPopup.error ? `Error: ${confirmPopup.error}` :
                `You are about to launch ${confirmPopup.game?.["Game Name"]}.`}
             </p>

             <div className="flex flex-col gap-4">
                {confirmPopup.error === "balance_error" ? (
                   <button onClick={() => setConfirmPopup({ show: false, game: null, error: null })} className="bg-[var(--brand-gradient)] text-white font-bold uppercase tracking-widest rounded-xl w-full justify-center py-4 hover:shadow-[0_0_20px_rgba(29,78,216,0.4)] transition-all">Add Funds</button>
                ) : confirmPopup.error === "authorization_error" ? (
                   <button onClick={handleAuthError} className="bg-[var(--brand-gradient)] text-white font-bold uppercase tracking-widest rounded-xl w-full justify-center py-4 hover:shadow-[0_0_20px_rgba(29,78,216,0.4)] transition-all">Log In Again</button>
                ) : confirmPopup.error ? (
                   <button onClick={() => setConfirmPopup({ show: false, game: null, error: null })} className="bg-transparent border-2 border-[var(--brand)] text-[var(--brand)] font-bold uppercase tracking-widest rounded-xl w-full justify-center py-4 hover:bg-[var(--brand)] hover:text-white transition-all">Try Another</button>
                ) : (
                   <button onClick={confirmGameOpen} className="bg-[var(--brand-gradient)] text-white font-bold uppercase tracking-widest rounded-xl w-full justify-center py-4 hover:shadow-[0_0_20px_rgba(29,78,216,0.4)] transition-all">Confirm Play</button>
                )}
                <button onClick={() => setConfirmPopup({ show: false, game: null, error: null })} className="text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-white mt-2 transition-colors">Cancel</button>
             </div>
          </div>
        </div>, document.body
      )}

      {confirmLoading && createPortal(
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100000] flex flex-col items-center justify-center p-4">
           <div className="bg-[rgba(20,20,30,0.8)] border border-[var(--gold)]/30 p-10 rounded-[2rem] max-w-md w-full text-center relative shadow-[0_0_60px_rgba(34,211,238,0.15)]">
              <div className="mb-8 relative">
                 <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto border-2 border-[var(--gold)] relative z-10 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                    <img src={confirmPopup.game?.icon || "/placeholder.svg"} alt="Game" className="w-full h-full object-cover" />
                 </div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[var(--gold)] rounded-full blur-[40px] opacity-20"></div>
              </div>
              <h3 className="text-2xl font-black text-white mb-8 tracking-widest uppercase" style={{ fontFamily: 'var(--font-head)' }}>Launching...</h3>
              
              <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-2 overflow-hidden mb-3">
                 <div className="h-full bg-[var(--brand-gradient)] transition-all duration-300 relative" style={{ width: `${loadingProgress}%` }}>
                    <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/30 blur-sm"></div>
                 </div>
              </div>
              <div className="text-[11px] text-[var(--gold)] font-bold tracking-widest uppercase">{Math.round(loadingProgress)}% Loaded</div>
           </div>
        </div>, document.body
      )}

    </div>
  );
};

export default CasinoPage;
