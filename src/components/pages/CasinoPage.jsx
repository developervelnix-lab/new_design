import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useGames } from "../../context/GameContext";
import { useSite } from "../../context/SiteContext";
import { useColors } from "../../hooks/useColors";
import { FONTS } from "../../constants/theme";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "@/utils/apiFetch";
import { FaPlay, FaSearch, FaTimes } from "react-icons/fa";

import RanaHeader from "../home/boldvelocity/RanaHeader";
import AuthModalHost from "../common/AuthModalHost";
import '../../assets/css/ranamatch.css';

const GAME_TYPES = [
  { id: 'all', label: 'All Games', icon: '🎲' },
  { id: 'roulette', label: 'Roulette', icon: '🎡' },
  { id: 'teenpatti', label: 'Teen Patti', icon: '🃏' },
  { id: 'poker', label: 'Poker', icon: '🂡' },
  { id: 'baccarat', label: 'Baccarat', icon: '🀄' },
  { id: 'dragon', label: 'Dragon Tiger', icon: '🐯' },
  { id: 'sicbo', label: 'Sic Bo', icon: '🎲' },
  { id: 'andar', label: 'Andar Bahar', icon: '⚔️' },
  { id: 'shows', label: 'Game Shows', icon: '🎪' },
  { id: 'blackjack', label: 'Blackjack', icon: '♠️' },
  { id: 'crash', label: 'Crash Games', icon: '🚀' },
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
  if (combined.includes('andar') && combined.includes('bahar')) return 'andar';
  if (combined.includes('crazy time') || combined.includes('monopoly') || combined.includes('show')) return 'shows';
  return 'other';
};

const getProviderIconInfo = (providerName) => {
  const p = providerName.toLowerCase();
  if (p.includes('evolution')) return { ico: '🎯', cls: 'c-ev' };
  if (p.includes('pragmatic')) return { ico: '🌀', cls: 'c-pg' };
  if (p.includes('ezugi')) return { ico: '🃏', cls: 'c-cr' };
  if (p.includes('creedroomz')) return { ico: '♠️', cls: 'c-ez' };
  if (p.includes('red') || p.includes('carat')) return { ico: '🌟', cls: 'c-rc' };
  if (p.includes('holi')) return { ico: '🎭', cls: 'c-sa' };
  if (p.includes('jacktop')) return { ico: '⚡', cls: 'c-pg' };
  if (p.includes('cockfight')) return { ico: '🐓', cls: 'c-ev' };
  if (p.includes('virtual')) return { ico: '🎪', cls: 'c-cr' };
  if (p.includes('bollywood')) return { ico: '🎬', cls: 'c-rc' };
  return { ico: '🎮', cls: 'c-sa' };
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
  const [casinoWins, setCasinoWins] = useState([]);
  const [casinoWinsLoading, setCasinoWinsLoading] = useState(true);

  const [displayLimit, setDisplayLimit] = useState(48);
  const observerTarget = useRef(null);

  const [jpAmount, setJpAmount] = useState(482367041);

  useEffect(() => {
    const jpInterval = setInterval(() => {
      setJpAmount(prev => prev + Math.floor(Math.random() * 900 + 200));
    }, 900);
    return () => clearInterval(jpInterval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCasinoWins = async () => {
      try {
        const response = await apiGet("route-big-wins", { SCOPE: "casino", LIMIT: "12" });
        const result = await response.json();

        if (isMounted) {
          setCasinoWins(result?.status_code === "success" && Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error("Failed to load casino big wins", error);
        if (isMounted) setCasinoWins([]);
      } finally {
        if (isMounted) setCasinoWinsLoading(false);
      }
    };

    loadCasinoWins();

    return () => {
      isMounted = false;
    };
  }, []);

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
    document.body.style.backgroundColor = '#06090f';
    document.body.style.color = '#eef2ff';
    document.body.style.fontFamily = "'Rajdhani', sans-serif";
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    const link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href = 'https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800&family=Rajdhani:wght@400;500;600;700&family=Exo+2:ital,wght@0,300;0,700;0,900;1,900&display=swap';
    document.head.appendChild(link1);

    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.style.fontFamily = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
      if (document.head.contains(link1)) document.head.removeChild(link1);
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
    <div className="rana-layout" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AuthModalHost />
      <RanaHeader />

      <style>{`
        /* Scoped styles based on casino_sample.html */
        .casino-shell {
          --bg0:#ffffff;
          --bg1:#f5f6fa;
          --bg2:#eef0f7;
          --bg3:#e8eaf2;
          --gold:#d49b12;
          --gold2:#a87608;
          --gold-a:rgba(212,155,18,.15);
          --blue:#1a6fff;
          --blue2:#0e4db5;
          --blue-a:rgba(26,111,255,.15);
          --cyan:#007acc;
          --green:#00a651;
          --red:#e0143c;
          --hi:#111827;
          --mid:#4b5563;
          --lo:#9ca3af;
          --border:rgba(0,0,0,.1);
          
          flex: 1; display: flex; overflow: hidden; font-family: var(--font-ui);
          background: var(--bg0); color: var(--hi);
        }
        
 

        /* SIDEBAR */
        .sidebar{width:220px;flex-shrink:0;background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--lo) transparent}
        .sidebar::-webkit-scrollbar{width:3px}
        .sidebar::-webkit-scrollbar-thumb{background:var(--lo);border-radius:3px}
        .s-head{font-family:var(--font-head);font-size:10px;font-weight:700;letter-spacing:.18em;color:var(--lo);padding:18px 16px 8px;text-transform:uppercase}
        .s-search{padding: 8px 16px 12px; border-bottom: 1px solid var(--border); margin-bottom: 8px;}
        .s-search input{width:100%; background:var(--bg0); border:1px solid var(--border); color:var(--hi); padding:8px 12px; border-radius:6px; font-family:var(--font-ui); font-size:12px; outline:none;}
        .s-search input:focus{border-color:var(--gold);}
        
        .s-item{display:flex;align-items:center;gap:9px;padding:8px 16px;cursor:pointer;border-left:2px solid transparent;transition:.15s;position:relative}
        .s-item:hover{background:var(--bg3)}
        .s-item.on{background:rgba(240,180,41,.05);border-left-color:var(--gold)}
        .s-ico{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;background:var(--bg0)}
        .s-name{font-family:var(--font-head);font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--mid);transition:.15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .s-item:hover .s-name,.s-item.on .s-name{color:var(--hi)}
        .s-item.on .s-name{color:var(--gold)}
        .s-ct{margin-left:auto;font-family:var(--font-mono);font-size:9px;font-weight:700;color:var(--lo);background:var(--bg0);border:1px solid var(--border);padding:2px 6px;border-radius:20px;flex-shrink:0}
        .s-item.on .s-ct{background:rgba(240,180,41,.12);color:var(--gold);border-color:rgba(240,180,41,.25)}

        /* CONTENT */
        .content{flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:var(--lo) transparent;padding:24px 28px}
        .content::-webkit-scrollbar{width:4px}
        .content::-webkit-scrollbar-thumb{background:var(--lo);border-radius:3px}
        .mobile-provider-toolbar{display:none}
        .mobile-provider-toolbar select,
        .mobile-provider-toolbar input{
          width:100%;
          min-width:0;
          background:var(--bg0);
          border:1px solid var(--border);
          color:var(--hi);
          padding:10px 12px;
          border-radius:10px;
          font-family:var(--font-ui);
          font-size:13px;
          outline:none;
        }
        .mobile-provider-toolbar select:focus,
        .mobile-provider-toolbar input:focus{border-color:var(--gold)}

        /* JACKPOT BAR */
        .jp-bar{background:linear-gradient(135deg,#0b1f0e,#142918);border:1px solid rgba(0,230,118,.15);border-radius:10px;padding:8px 18px;margin-bottom:16px;display:flex;align-items:center;gap:14px;position:relative;overflow:hidden}
        .jp-bar::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(0,230,118,.04) 1px,transparent 1px);background-size:20px 20px;pointer-events:none}
        .jp-label{font-family:var(--font-head);font-size:10px;font-weight:800;letter-spacing:.18em;color:var(--green) !important;text-transform:uppercase;flex-shrink:0;display:flex;align-items:center;gap:6px}
        .jp-sep{width:1px;background:rgba(0,230,118,.15);align-self:stretch;flex-shrink:0}
        .jp-val{font-family:var(--font-display);font-size:22px;font-weight:900;color:var(--green) !important;letter-spacing:-.02em;flex:1;text-align:center}
        .jp-btn{padding:7px 18px;background:linear-gradient(135deg,var(--green),#00b860);border:none;color:#000 !important;font-family:var(--font-head);font-size:10px;font-weight:800;letter-spacing:.12em;border-radius:6px;cursor:pointer;flex-shrink:0;transition:.2s}
        .jp-btn:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,230,118,.3)}

        /* CATEGORY PILLS */
        .cat-row{display:flex;gap:8px;margin-bottom:24px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
        .cat-row::-webkit-scrollbar{display:none}
        .cat-pill{flex-shrink:0;padding:8px 16px;border-radius:30px;border:1px solid var(--lo);background:none;color:var(--mid) !important;font-family:var(--font-ui);font-size:11px;font-weight:700;letter-spacing:.07em;cursor:pointer;transition:.15s;display:flex;align-items:center;gap:8px}
        .cat-pill:hover{border-color:var(--mid);color:var(--hi) !important;}
        .cat-pill.on{background:rgba(240,180,41,.1);border-color:rgba(240,180,41,.4);color:var(--gold) !important;}

        /* SECTION ROW */
        .sec-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .sec-title{font-family:var(--font-head);font-size:14px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--hi) !important;display:flex;align-items:center;gap:8px}
        .sec-title::before{content:'';display:block;width:3px;height:16px;background:linear-gradient(180deg,var(--gold),var(--gold2));border-radius:2px}
        
        .search-box{position:relative;}
        .search-box input{background:var(--bg1); border:1px solid var(--border); color:var(--hi); padding:8px 14px 8px 32px; border-radius:6px; font-family:var(--font-ui); font-size:12px; outline:none; width:200px;}
        .search-box input:focus{border-color:var(--gold);}
        .search-box svg{position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--mid);}

        /* WINS STRIP */
        .wins-bar{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 18px;margin-bottom:24px;display:flex;align-items:center;gap:16px;overflow:hidden;position:relative;z-index:0;isolation:isolate;}
        .wins-bar-inner{flex:1;overflow:hidden;min-width:0;}
        .wins-label{font-family:var(--font-head);font-size:10px;font-weight:800;letter-spacing:.18em;color:var(--gold) !important;text-transform:uppercase;flex-shrink:0;white-space:nowrap;display:flex;align-items:center;gap:8px}
        .wins-label::after{content:'';width:1px;height:20px;background:var(--border)}
        .wins-scroll{display:flex;gap:24px;animation:wsroll 22s linear infinite;width:max-content;}
        @keyframes wsroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .witem{display:flex;align-items:center;gap:8px;flex-shrink:0}
        .wavatar{width:24px;height:24px;border-radius:50%;background:var(--bg0);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px}
        .wuser{font-family:var(--font-ui);font-size:11px;font-weight:600;color:var(--mid) !important;}
        .wgame{font-family:var(--font-ui);font-size:11px;color:var(--lo) !important;}
        .wamt{font-family:var(--font-mono);font-size:12px;font-weight:800;color:var(--green) !important;}

        /* GAME GRID */
        .game-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:18px;margin-bottom:32px}
        .gcard{border-radius:18px;overflow:hidden;position:relative;cursor:pointer;background:var(--bg1);border:1px solid rgba(255,255,255,0.05);transition:all .35s cubic-bezier(0.23, 1, 0.32, 1);animation:fadeUp .4s ease both;box-shadow:0 8px 24px rgba(0,0,0,0.15)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .gcard::before{content:'';position:absolute;inset:0;border-radius:18px;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.08);pointer-events:none;z-index:3}
        .gcard:hover{transform:translateY(-8px) scale(1.02);border-color:rgba(240,180,41,.4);box-shadow:0 24px 48px rgba(0,0,0,.4), 0 0 0 1px rgba(240,180,41,0.2)}
        .gthumb{position:relative;aspect-ratio:3/4;overflow:hidden;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px; background-size: cover; background-position: center;}
        .gthumb img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity: 1; transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);}
        .gcard:hover .gthumb img{transform: scale(1.1);}
        .gthumb-shade{position:absolute;inset:0;background:rgba(0,0,0,0.4);opacity:0;transition:.4s}
        .gcard:hover .gthumb-shade{opacity:1}
        .gplay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:.35s}
        .gcard:hover .gplay{opacity:1}
        .gplay-btn{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--gold),#ffb703);display:flex;align-items:center;justify-content:center;font-size:18px;transform:scale(.6) translateY(20px);transition:all .35s cubic-bezier(0.34, 1.56, 0.64, 1);color:#000;box-shadow:0 8px 24px rgba(240,180,41,0.5);}
        .gcard:hover .gplay-btn{transform:scale(1) translateY(0)}
        .gicon{font-size:52px;transition:.4s cubic-bezier(0.23, 1, 0.32, 1);pointer-events:none; z-index:2; filter:drop-shadow(0 8px 16px rgba(0,0,0,0.4))}
        .gcard:hover .gicon{transform:scale(1.2) translateY(-6px)}
        .gshortname{font-family:var(--font-head);font-size:10px;font-weight:700;color:rgba(255,255,255,.6);letter-spacing:.1em;pointer-events:none; z-index:2; transition:.4s}
        .gcard:hover .gshortname{transform:translateY(4px); opacity:0}
        .ginfo{padding:12px 14px 14px; background:var(--bg1); position:relative; z-index:2; border-top:1px solid rgba(255,255,255,0.03)}
        .gname{font-family:var(--font-head);font-size:15px;font-weight:800;color:var(--hi);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.2px}
        .gmeta{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
        .gprov{font-family:var(--font-ui);font-size:10px;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:0.8px}
        .gtag-live{font-family:var(--font-mono);font-size:9px;font-weight:800;letter-spacing:.08em;color:var(--red);background:rgba(255,23,68,.1);border:1px solid rgba(255,23,68,.25);padding:3px 8px;border-radius:6px; display:flex; align-items:center; gap:4px}
        .gtag-live::before{content:'';display:inline-block;width:5px;height:5px;background:var(--red);border-radius:50%;animation:blink 1.2s infinite;box-shadow:0 0 8px var(--red)}
        .gtag-hot{font-family:var(--font-mono);font-size:9px;font-weight:800;letter-spacing:.08em;color:var(--gold);background:rgba(240,180,41,.1);border:1px solid rgba(240,180,41,.25);padding:3px 8px;border-radius:6px}
        .gtag-pop{font-family:var(--font-mono);font-size:9px;font-weight:800;letter-spacing:.08em;color:var(--green);background:rgba(0,230,118,.08);border:1px solid rgba(0,230,118,.25);padding:3px 8px;border-radius:6px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}

        /* BG COLORS */
        .c-ev{background:linear-gradient(150deg,#0c0818 0%,#1e0f4a 100%)}
        .c-pg{background:linear-gradient(150deg,#08122a 0%,#0e2a5c 100%)}
        .c-cr{background:linear-gradient(150deg,#140818 0%,#38083a 100%)}
        .c-ez{background:linear-gradient(150deg,#081410 0%,#0c3022 100%)}
        .c-sa{background:linear-gradient(150deg,#0a1020 0%,#0e2040 100%)}
        .c-rc{background:linear-gradient(150deg,#1a1000 0%,#3a2000 100%)}

        /* FULL CASINO REDESIGN */
        .casino-shell{
          --bg0:#070713;
          --bg1:rgba(255,255,255,.075);
          --bg2:rgba(255,255,255,.10);
          --bg3:rgba(255,255,255,.14);
          --gold:#c59124;
          --gold2:#ffd97d;
          --gold-a:rgba(197,145,36,.18);
          --hi:#fffaf0;
          --mid:rgba(255,255,255,.72);
          --lo:rgba(255,255,255,.45);
          --border:rgba(255,255,255,.12);
          min-height:100vh;
          padding-top:0;
          background:
            radial-gradient(circle at 12% 2%, rgba(255,217,125,.18), transparent 30%),
            radial-gradient(circle at 86% 8%, rgba(109,40,217,.20), transparent 34%),
            linear-gradient(145deg,#080714 0%,#15112b 48%,#080714 100%);
          color:var(--hi);
        }

        .casino-shell::before{
          content:'';
          position:fixed;
          inset:0;
          pointer-events:none;
          opacity:.24;
          background-image:
            linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
          background-size:52px 52px;
          mask-image:radial-gradient(circle at 50% 15%, #000 0%, transparent 72%);
          z-index:0;
        }

        .sidebar,
        .content{
          position:relative;
          z-index:1;
        }

        .sidebar{
          width:292px;
          margin:18px 0 22px 24px;
          border:1px solid rgba(255,255,255,.14);
          border-radius:24px;
          background:
            radial-gradient(circle at 12% 0%, rgba(255,217,125,.14), transparent 34%),
            linear-gradient(180deg, rgba(255,255,255,.105), rgba(255,255,255,.045));
          box-shadow:0 24px 60px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.12);
          backdrop-filter:blur(22px);
          overflow:hidden auto;
        }

        .s-head{
          padding:22px 20px 10px;
          color:var(--gold2);
          font-size:11px;
          letter-spacing:.24em;
        }

        .s-search{
          padding:10px 18px 16px;
          border-bottom-color:rgba(255,255,255,.10);
        }

        .s-search input,
        .mobile-provider-toolbar input,
        .mobile-provider-toolbar select,
        .search-box input{
          min-height:42px;
          border-radius:14px;
          border:1px solid rgba(255,255,255,.13);
          background:rgba(255,255,255,.08);
          color:#fff;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
        }

        .s-search input::placeholder,
        .search-box input::placeholder{
          color:rgba(255,255,255,.48);
        }

        .s-search input:focus,
        .search-box input:focus{
          border-color:rgba(255,217,125,.46);
          box-shadow:0 0 0 4px rgba(197,145,36,.12);
        }

        .s-item{
          margin:5px 12px;
          padding:11px 12px;
          border-left:0;
          border-radius:16px;
          border:1px solid transparent;
        }

        .s-item:hover{
          background:rgba(255,255,255,.08);
          border-color:rgba(255,255,255,.10);
        }

        .s-item.on{
          background:linear-gradient(135deg, rgba(197,145,36,.22), rgba(255,217,125,.08));
          border-color:rgba(255,217,125,.28);
          box-shadow:0 12px 28px rgba(197,145,36,.12), inset 0 1px 0 rgba(255,255,255,.12);
        }

        .s-ico{
          width:36px;
          height:36px;
          border-radius:13px;
          background:linear-gradient(145deg, rgba(255,255,255,.14), rgba(255,255,255,.06));
          color:#fff;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.12);
        }

        .s-name{
          color:rgba(255,255,255,.72);
          font-size:12px;
          font-weight:800;
        }

        .s-item:hover .s-name,
        .s-item.on .s-name{
          color:#fff;
        }

        .s-item.on .s-name{
          color:var(--gold2);
        }

        .s-ct{
          background:rgba(255,255,255,.08);
          border-color:rgba(255,255,255,.10);
          color:rgba(255,255,255,.66);
          font-size:10px;
        }

        .content{
          padding:18px 28px 42px;
        }

        .content::before{
          content:'Live Casino Lobby';
          display:block;
          margin:0 0 12px;
          color:#fff;
          font-family:var(--font-head);
          font-size:34px;
          font-weight:900;
          letter-spacing:-.02em;
          text-shadow:0 16px 34px rgba(0,0,0,.32);
        }

        .content::after{
          content:'Explore providers, live tables, slots, crash games and premium casino titles from one redesigned lobby.';
          display:block;
          max-width:720px;
          margin:-6px 0 18px;
          color:rgba(255,255,255,.62);
          font-size:14px;
          line-height:1.55;
        }

        .jp-bar{
          min-height:92px;
          padding:18px 22px;
          margin-bottom:16px;
          border-radius:26px;
          border:1px solid rgba(255,217,125,.24);
          background:
            radial-gradient(circle at 82% 0%, rgba(255,217,125,.30), transparent 32%),
            linear-gradient(135deg, rgba(28,22,48,.96), rgba(87,57,8,.74));
          box-shadow:0 28px 60px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.14);
        }

        .jp-bar::before{
          background-image:linear-gradient(90deg, rgba(255,217,125,.08) 1px, transparent 1px);
          background-size:28px 28px;
        }

        .jp-label{
          color:#fff2bd !important;
          font-size:12px;
          letter-spacing:.22em;
        }

        .jp-sep{
          background:rgba(255,217,125,.20);
        }

        .jp-val{
          color:#fff !important;
          font-size:32px;
          text-shadow:0 0 28px rgba(255,217,125,.28);
        }

        .jp-btn{
          min-height:42px;
          padding:0 22px;
          border-radius:999px;
          background:linear-gradient(135deg,var(--gold) 0%, var(--gold2) 100%);
          color:#201506 !important;
          box-shadow:0 18px 34px rgba(197,145,36,.28);
        }

        .wins-bar{
          padding:13px 18px;
          border-radius:20px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.075);
          backdrop-filter:blur(16px);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.10);
        }

        .wins-label{
          color:var(--gold2) !important;
        }

        .wavatar{
          background:rgba(255,255,255,.12);
          border-color:rgba(255,255,255,.16);
        }

        .wuser{color:#fff !important}
        .wgame{color:rgba(255,255,255,.56) !important}
        .wamt{color:#5cff9d !important}

        .cat-row{
          gap:10px;
          margin-bottom:22px;
          padding:4px 2px 8px;
        }

        .cat-pill{
          min-height:42px;
          padding:0 17px;
          border-radius:999px;
          border-color:rgba(255,255,255,.13);
          background:rgba(255,255,255,.07);
          color:rgba(255,255,255,.72) !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
        }

        .cat-pill:hover{
          color:#fff !important;
          border-color:rgba(255,217,125,.28);
          background:rgba(255,255,255,.10);
          transform:translateY(-1px);
        }

        .cat-pill.on{
          color:#201506 !important;
          border-color:transparent;
          background:linear-gradient(135deg,var(--gold),var(--gold2));
          box-shadow:0 14px 28px rgba(197,145,36,.22);
        }

        .sec-row{
          padding:14px 16px;
          margin-bottom:16px;
          border-radius:20px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.07);
        }

        .sec-title{
          color:#fff !important;
          font-size:15px;
        }

        .sec-title::before{
          height:20px;
          background:linear-gradient(180deg,var(--gold2),var(--gold));
          box-shadow:0 0 16px rgba(255,217,125,.34);
        }

        .search-box svg{
          color:rgba(255,217,125,.8);
        }

        .game-grid{
          grid-template-columns:repeat(auto-fill,minmax(178px,1fr));
          gap:20px;
        }

        .gcard{
          border-radius:22px;
          border:1px solid rgba(255,255,255,.10);
          background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.045));
          box-shadow:0 18px 42px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.09);
        }

        .gcard::before{
          border-radius:22px;
          box-shadow:inset 0 0 0 1px rgba(255,255,255,.10);
        }

        .gcard:hover{
          border-color:rgba(255,217,125,.42);
          box-shadow:0 28px 62px rgba(0,0,0,.38), 0 0 0 1px rgba(255,217,125,.18);
        }

        .gthumb{
          border-radius:20px 20px 0 0;
        }

        .gthumb-shade{
          background:linear-gradient(180deg, rgba(0,0,0,.06), rgba(0,0,0,.72));
        }

        .gplay-btn{
          background:linear-gradient(135deg,var(--gold),var(--gold2));
          color:#201506;
        }

        .ginfo{
          background:linear-gradient(180deg, rgba(12,10,24,.96), rgba(18,14,36,.98));
          border-top:1px solid rgba(255,255,255,.08);
        }

        .gname{
          color:#fff;
          font-size:15px;
        }

        .gprov{
          color:rgba(255,255,255,.54);
        }

        .gtag-hot,
        .gtag-pop{
          color:#fff1ba;
          background:rgba(197,145,36,.16);
          border-color:rgba(255,217,125,.25);
        }

        .gtag-live{
          color:#ff8f9e;
          background:rgba(224,20,60,.14);
          border-color:rgba(224,20,60,.28);
        }

        /* LIGHT HOME-THEME CASINO VARIANT */
        .casino-shell{
          --bg0:#ffffff;
          --bg1:rgba(255,255,255,.84);
          --bg2:rgba(255,255,255,.72);
          --bg3:#f1eff9;
          --gold:#a77717;
          --gold2:#c59124;
          --gold-a:rgba(167,119,23,.12);
          --hi:#0e0b25;
          --mid:#4f4965;
          --lo:#8b86a3;
          --border:rgba(14,11,37,.08);
          background:
            radial-gradient(ellipse 90% 50% at 15% 0%, rgba(109,40,217,.055) 0%, transparent 60%),
            radial-gradient(ellipse 80% 45% at 85% 5%, rgba(167,119,23,.06) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(6,214,245,.04) 0%, transparent 55%),
            linear-gradient(180deg,#fdfdff 0%,#f6f5fc 50%,#eeedf8 100%);
          color:var(--hi);
        }

        .casino-shell::before{
          opacity:.42;
          background-image:
            linear-gradient(rgba(109,40,217,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(109,40,217,.04) 1px, transparent 1px);
        }

        .sidebar{
          border-color:rgba(255,255,255,.82);
          background:
            radial-gradient(circle at 12% 0%, rgba(255,217,125,.18), transparent 34%),
            linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.68));
          box-shadow:0 22px 46px rgba(14,11,37,.10), inset 0 1px 0 rgba(255,255,255,.95);
        }

        .s-head{
          color:#8b6a21;
        }

        .s-search{
          border-bottom-color:rgba(14,11,37,.08);
        }

        .s-search input,
        .mobile-provider-toolbar input,
        .mobile-provider-toolbar select,
        .search-box input{
          border-color:rgba(14,11,37,.10);
          background:rgba(255,255,255,.86);
          color:#17142d;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.95);
        }

        .s-search input::placeholder,
        .search-box input::placeholder{
          color:#8b86a3;
        }

        .s-item:hover{
          background:rgba(167,119,23,.07);
          border-color:rgba(167,119,23,.12);
        }

        .s-item.on{
          background:linear-gradient(135deg, rgba(167,119,23,.14), rgba(255,217,125,.12));
          border-color:rgba(167,119,23,.24);
          box-shadow:0 12px 28px rgba(167,119,23,.10), inset 0 1px 0 rgba(255,255,255,.96);
        }

        .s-ico{
          background:linear-gradient(145deg, #fff, #fff6df);
          color:#a77717;
          box-shadow:inset 0 1px 0 #fff, 0 10px 18px rgba(167,119,23,.10);
        }

        .s-name,
        .s-item:hover .s-name{
          color:#302a43;
        }

        .s-item.on .s-name{
          color:#a77717;
        }

        .s-ct{
          background:rgba(255,255,255,.76);
          border-color:rgba(167,119,23,.16);
          color:#a77717;
        }

        .content::before{
          color:#17142d;
          text-shadow:0 14px 30px rgba(14,11,37,.08);
        }

        .content::after{
          color:#645f85;
        }

        .jp-bar{
          border-color:rgba(167,119,23,.18);
          background:
            radial-gradient(circle at 82% 0%, rgba(255,217,125,.24), transparent 32%),
            linear-gradient(135deg, rgba(255,255,255,.96), rgba(255,247,226,.82));
          box-shadow:0 20px 42px rgba(14,11,37,.08), inset 0 1px 0 rgba(255,255,255,.96);
        }

        .jp-label{
          color:#a77717 !important;
        }

        .jp-sep{
          background:rgba(167,119,23,.18);
        }

        .jp-val{
          color:#17142d !important;
          text-shadow:0 10px 22px rgba(167,119,23,.12);
        }

        .wins-bar,
        .sec-row{
          border-color:rgba(14,11,37,.08);
          background:rgba(255,255,255,.68);
          box-shadow:0 14px 30px rgba(14,11,37,.06), inset 0 1px 0 rgba(255,255,255,.92);
        }

        .wins-label{
          color:#a77717 !important;
        }

        .wavatar{
          background:#fff;
          border-color:rgba(167,119,23,.16);
        }

        .wuser{color:#17142d !important}
        .wgame{color:#645f85 !important}
        .wamt{color:#059669 !important}

        .cat-pill{
          border-color:rgba(14,11,37,.09);
          background:rgba(255,255,255,.72);
          color:#4f4965 !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.94);
        }

        .cat-pill:hover{
          color:#a77717 !important;
          border-color:rgba(167,119,23,.22);
          background:rgba(255,255,255,.94);
        }

        .cat-pill.on{
          color:#fff !important;
          background:linear-gradient(135deg,#a77717,#c59124);
          box-shadow:0 14px 28px rgba(167,119,23,.18);
        }

        .sec-title{
          color:#17142d !important;
        }

        .search-box svg{
          color:#a77717;
        }

        .gcard{
          border-color:rgba(14,11,37,.07);
          background:linear-gradient(180deg, rgba(255,255,255,.98), rgba(250,248,255,.88));
          box-shadow:0 18px 38px rgba(14,11,37,.09), inset 0 1px 0 rgba(255,255,255,.96);
        }

        .gcard::before{
          box-shadow:inset 0 0 0 1px rgba(255,255,255,.55);
        }

        .gcard:hover{
          border-color:rgba(167,119,23,.28);
          box-shadow:0 26px 54px rgba(14,11,37,.14), 0 0 0 1px rgba(167,119,23,.12);
        }

        .ginfo{
          background:linear-gradient(180deg, #ffffff, #faf8ff);
          border-top:1px solid rgba(14,11,37,.06);
        }

        .gname{
          color:#17142d;
        }

        .gprov{
          color:#756f8f;
        }

        .gtag-hot,
        .gtag-pop{
          color:#a77717;
          background:rgba(167,119,23,.10);
          border-color:rgba(167,119,23,.18);
        }

        /* STRUCTURE REFRESH: top provider deck + command cards */
        .casino-shell{
          display:block;
          overflow:auto;
        }

        .casino-shell .sidebar{
          display:none;
        }

        .content{
          max-width:1720px;
          margin:0 auto;
          padding:22px clamp(24px, 4vw, 72px) 48px;
        }

        .content::before,
        .content::after{
          display:none;
        }

        .casino-top-layout{
          display:grid;
          grid-template-columns:minmax(0,1fr) minmax(292px,360px);
          gap:14px;
          align-items:start;
          margin-bottom:16px;
        }

        .casino-command{
          display:grid;
          grid-template-columns:minmax(0,1.08fr) minmax(210px,.52fr);
          gap:12px;
          margin-bottom:0;
        }

        .casino-left-stack{
          min-width:0;
          display:grid;
          gap:12px;
        }

        .casino-hero-card{
          min-height:134px;
          padding:17px 19px;
          border-radius:20px;
          border:1px solid rgba(255,255,255,.76);
          background:
            radial-gradient(circle at 82% 16%, rgba(255,217,125,.30), transparent 34%),
            radial-gradient(circle at 12% 92%, rgba(109,40,217,.12), transparent 42%),
            linear-gradient(135deg, rgba(255,255,255,.98), rgba(246,242,255,.82));
          box-shadow:0 24px 54px rgba(14,11,37,.10), inset 0 1px 0 rgba(255,255,255,.96);
          position:relative;
          overflow:hidden;
        }

        .casino-hero-card::after{
          content:'CASINO';
          position:absolute;
          right:16px;
          bottom:-9px;
          color:rgba(167,119,23,.065);
          font-family:var(--font-head);
          font-size:52px;
          font-weight:900;
          line-height:1;
          pointer-events:none;
        }

        .casino-kicker-line{
          color:#a77717;
          font-family:var(--font-mono);
          font-size:8px;
          font-weight:900;
          letter-spacing:.22em;
          text-transform:uppercase;
          margin-bottom:7px;
        }

        .casino-hero-title{
          max-width:460px;
          color:#17142d;
          font-family:var(--font-head);
          font-size:clamp(24px, 2.35vw, 36px);
          font-weight:900;
          line-height:.95;
          letter-spacing:0;
          margin:0;
        }

        .casino-hero-copy{
          max-width:460px;
          margin-top:8px;
          color:#645f85;
          font-size:12px;
          font-weight:600;
          line-height:1.4;
        }

        .casino-hero-stats-new{
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:7px;
          max-width:420px;
          margin-top:12px;
        }

        .casino-hero-stats-new div{
          padding:8px 10px;
          border-radius:12px;
          border:1px solid rgba(167,119,23,.14);
          background:rgba(255,255,255,.68);
        }

        .casino-hero-stats-new strong{
          display:block;
          color:#a77717;
          font-family:var(--font-head);
          font-size:16px;
          font-weight:900;
          line-height:1;
        }

        .casino-hero-stats-new span{
          display:block;
          margin-top:4px;
          color:#756f8f;
          font-family:var(--font-mono);
          font-size:7.5px;
          font-weight:800;
          letter-spacing:.12em;
          text-transform:uppercase;
        }

        .casino-control-card{
          display:grid;
          gap:9px;
          align-content:start;
          padding:13px;
          border-radius:20px;
          border:1px solid rgba(255,255,255,.76);
          background:linear-gradient(145deg, rgba(255,255,255,.96), rgba(255,249,235,.82));
          box-shadow:0 24px 54px rgba(14,11,37,.09), inset 0 1px 0 rgba(255,255,255,.96);
        }

        .casino-control-title{
          color:#17142d;
          font-family:var(--font-head);
          font-size:13px;
          font-weight:900;
        }

        .casino-control-card .search-box input{
          width:100%;
          min-height:36px;
          border-radius:12px;
          font-size:11px;
        }

        .provider-deck{
          margin-bottom:0;
          padding:13px;
          border-radius:20px;
          border:1px solid rgba(255,255,255,.78);
          background:rgba(255,255,255,.54);
          box-shadow:0 18px 42px rgba(14,11,37,.07), inset 0 1px 0 rgba(255,255,255,.92);
        }

        .provider-deck-head{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom:9px;
        }

        .provider-deck-head strong{
          color:#17142d;
          font-family:var(--font-head);
          font-size:14px;
          font-weight:900;
        }

        .provider-deck-head span{
          color:#a77717;
          font-family:var(--font-mono);
          font-size:8px;
          font-weight:900;
          letter-spacing:.14em;
          text-transform:uppercase;
        }

        .provider-grid-top{
          display:grid;
          grid-template-columns:1fr;
          gap:8px;
          max-height:250px;
          overflow:auto;
          padding-right:4px;
        }

        .provider-chip-top{
          min-height:52px;
          display:flex;
          align-items:center;
          gap:8px;
          padding:8px;
          border:1px solid rgba(14,11,37,.08);
          border-radius:14px;
          background:rgba(255,255,255,.70);
          cursor:pointer;
          transition:.2s;
        }

        .provider-chip-top:hover,
        .provider-chip-top.on{
          border-color:rgba(167,119,23,.25);
          background:linear-gradient(135deg, rgba(255,255,255,.96), rgba(255,246,223,.88));
          transform:translateY(-2px);
          box-shadow:0 12px 24px rgba(167,119,23,.10);
        }

        .provider-chip-top .s-ico{
          flex:0 0 auto;
          width:30px;
          height:30px;
          border-radius:10px;
          font-size:13px;
        }

        .provider-chip-copy{
          min-width:0;
          display:grid;
          gap:4px;
        }

        .provider-chip-copy strong{
          color:#17142d;
          font-size:11px;
          font-weight:900;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .provider-chip-copy span{
          color:#756f8f;
          font-family:var(--font-mono);
          font-size:8px;
          font-weight:800;
        }

        .jp-bar{
          min-height:74px;
          display:grid;
          grid-template-columns:auto 1px minmax(0,1fr) auto;
          align-items:center;
        }

        .wins-bar{
          margin-bottom:16px;
        }

        .cat-row{
          padding:12px;
          border-radius:24px;
          border:1px solid rgba(255,255,255,.72);
          background:rgba(255,255,255,.45);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.88);
        }

        .sec-row{
          display:grid;
          grid-template-columns:minmax(0,1fr);
        }

        .sec-row .search-box{
          display:none;
        }

        .jp-bar,
        .wins-bar{
          display:none !important;
        }

        .cat-row{
          display:grid;
          grid-auto-flow:column;
          grid-auto-columns:minmax(132px,1fr);
          gap:0;
          min-height:82px;
          margin:0 0 18px;
          padding:0;
          border-radius:22px;
          border:1px solid rgba(255,255,255,.82);
          background:
            radial-gradient(circle at 9% 0%, rgba(255,217,125,.22), transparent 30%),
            radial-gradient(circle at 83% 100%, rgba(109,40,217,.10), transparent 34%),
            linear-gradient(135deg, rgba(255,255,255,.98), rgba(255,249,235,.92) 52%, rgba(246,242,255,.92));
          box-shadow:0 20px 42px rgba(14,11,37,.08), inset 0 1px 0 rgba(255,255,255,.98);
          overflow-x:auto;
          scrollbar-width:none;
        }

        .cat-row::-webkit-scrollbar{
          display:none;
        }

        .cat-pill{
          min-width:132px;
          min-height:82px;
          padding:12px 14px;
          border:0;
          border-right:1px solid rgba(167,119,23,.13);
          border-radius:0;
          background:transparent;
          color:#17142d !important;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:7px;
          font-family:var(--font-head);
          font-size:13px;
          font-weight:900;
          letter-spacing:0;
          text-align:center;
          white-space:nowrap;
          box-shadow:none;
          position:relative;
          overflow:hidden;
        }

        .cat-pill::before{
          content:'';
          position:absolute;
          inset:8px;
          border-radius:16px;
          background:linear-gradient(135deg, rgba(197,145,36,.13), rgba(255,255,255,0));
          opacity:0;
          transition:.2s;
        }

        .cat-pill:hover::before,
        .cat-pill.on::before{
          opacity:1;
        }

        .cat-pill:hover{
          color:#a77717 !important;
          transform:none;
          background:transparent;
          border-color:rgba(167,119,23,.13);
        }

        .cat-pill.on{
          color:#17142d !important;
          border-color:rgba(167,119,23,.18);
          background:linear-gradient(135deg, rgba(255,217,125,.42), rgba(255,255,255,.24));
          box-shadow:inset 0 -3px 0 #c59124;
        }

        .cat-icon,
        .cat-name{
          position:relative;
          z-index:1;
        }

        .cat-icon{
          font-size:24px;
          line-height:1;
          filter:drop-shadow(0 8px 14px rgba(167,119,23,.18));
        }

        .cat-name{
          color:#5f5a75;
          font-family:var(--font-mono);
          font-size:9.5px;
          font-weight:900;
          letter-spacing:.11em;
          text-transform:uppercase;
        }

        .cat-pill.on .cat-name,
        .cat-pill:hover .cat-name{
          color:#a77717;
        }

        @media (max-width: 1180px){
          .casino-top-layout{
            grid-template-columns:1fr;
          }

          .casino-command{
            grid-template-columns:minmax(0,1fr) minmax(220px,.42fr);
          }

          .provider-grid-top{
            grid-template-columns:repeat(auto-fill,minmax(142px,1fr));
            max-height:178px;
          }
        }

        @media (max-width: 820px){
          .casino-shell{display:block;overflow:auto;padding-bottom:92px}
          .sidebar{display:none}
          .content{padding:14px 12px 120px}
          .casino-top-layout{
            grid-template-columns:1fr;
            gap:10px;
            margin-bottom:12px;
          }
          .casino-left-stack{
            gap:10px;
          }
          .casino-command{
            grid-template-columns:1fr;
          }
          .casino-hero-card{
            min-height:0;
            padding:20px;
          }
          .casino-hero-title{
            font-size:32px;
          }
          .casino-hero-stats-new{
            grid-template-columns:1fr;
          }
          .provider-grid-top{
            grid-template-columns:1fr;
            max-height:220px;
          }
          .mobile-provider-toolbar{
            display:grid;
            grid-template-columns:1fr;
            gap:8px;
            margin-bottom:10px;
          }
          .mobile-provider-toolbar select{
            min-height:38px;
            padding:6px 12px;
            border-radius:12px;
            font-size:11px;
          }
          .jp-bar{
            padding:8px 10px;
            gap:6px;
            align-items:flex-start;
            flex-wrap:wrap;
            margin-bottom:10px;
            border-radius:12px;
          }
          .jp-label{
            width:100%;
            font-size:8px;
            letter-spacing:.14em;
          }
          .jp-sep{display:none}
          .jp-val{
            width:100%;
            text-align:left;
            font-size:12px;
          }
          .jp-btn{
            width:100%;
            min-height:34px;
            padding:6px 10px;
            font-size:9px;
            border-radius:8px;
          }
          .wins-bar{
            padding:8px 10px;
            gap:8px;
            margin-bottom:12px;
            border-radius:14px;
          }
          .wins-label{
            font-size:8px;
            letter-spacing:.14em;
          }
          .wavatar{
            width:20px;
            height:20px;
            font-size:10px;
          }
          .wuser{
            font-size:9px;
          }
          .wgame{
            font-size:9px;
          }
          .wamt{
            font-size:10px;
          }
          .cat-row{
            gap:6px;
            margin-bottom:12px;
          }
          .cat-pill{
            padding:6px 11px;
            font-size:9px;
            border-radius:22px;
          }
          .sec-row{
            flex-direction:column;
            align-items:stretch;
            gap:10px;
            margin-bottom:12px;
          }
          .sec-row .search-box{
            display:none;
          }
          .sec-title{
            font-size:11px;
          }
          .search-box input{
            width:100%;
            font-size:13px;
          }
          .game-grid{
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:12px;
            margin-bottom:20px;
          }
          .ginfo{
            padding:10px 12px;
          }
          .gname{
            font-size:13px;
            letter-spacing:0px;
          }
          .gprov{
            font-size:9px;
            letter-spacing:0.5px;
          }
          .gmeta{
            gap:6px;
            align-items:flex-start;
            flex-direction:column;
          }
        }

        @media (max-width: 480px){
          .game-grid{
            grid-template-columns:1fr 1fr;
            gap:10px;
          }
          .gplay-btn{
            width:38px;
            height:38px;
          }
        }
      `}</style>



      <div className="casino-shell">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="s-head">Providers</div>
          <div className="s-search">
            <input type="text" placeholder="Search provider..." value={providerSearch} onChange={e => setProviderSearch(e.target.value)} />
          </div>

          <div className={`s-item ${activeProvider === 'all' ? 'on' : ''}`} onClick={() => setActiveProvider('all')}>
            <div className="s-ico c-sa" style={{ fontSize: '11px' }}>ALL</div>
            <span className="s-name">All Providers</span>
            <span className="s-ct">{allGames.length}</span>
          </div>

          {providers.filter(p => p.toLowerCase().includes(providerSearch.toLowerCase())).map(p => {
            const info = getProviderIconInfo(p);
            return (
              <div key={p} className={`s-item ${activeProvider === p ? 'on' : ''}`} onClick={() => setActiveProvider(p)}>
                <div className={`s-ico ${info.cls}`}>{info.ico}</div>
                <span className="s-name" title={p}>{p}</span>
                <span className="s-ct">{providerCounts[p]}</span>
              </div>
            )
          })}
        </aside>

        {/* CONTENT */}
        <div className="content">
          <div className="mobile-provider-toolbar">
            <select value={activeProvider} onChange={(e) => setActiveProvider(e.target.value)} aria-label="Select provider">
              <option value="all">All Providers ({allGames.length})</option>
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {provider} ({providerCounts[provider]})
                </option>
              ))}
            </select>
          </div>

          <section className="casino-top-layout">
            <div className="casino-left-stack">
              <section className="casino-command">
                <div className="casino-hero-card">
                  <div className="casino-kicker-line">Premium Casino Desk</div>
                  <h1 className="casino-hero-title">Live Casino Lobby</h1>
                  <p className="casino-hero-copy">
                    Browse every provider, table, slot, crash title and live game from one light, fast casino command center.
                  </p>
                  <div className="casino-hero-stats-new">
                    <div>
                      <strong>{allGames.length}</strong>
                      <span>Total Games</span>
                    </div>
                    <div>
                      <strong>{providers.length}</strong>
                      <span>Providers</span>
                    </div>
                    <div>
                      <strong>{filteredGames.length}</strong>
                      <span>Showing</span>
                    </div>
                  </div>
                </div>
                <div className="casino-control-card">
                  <div className="casino-control-title">Find Your Table</div>
                  <div className="search-box">
                    <FaSearch />
                    <input type="text" placeholder="Search games..." value={gameSearch} onChange={e => setGameSearch(e.target.value)} />
                  </div>
                  <div className="search-box">
                    <FaSearch />
                    <input type="text" placeholder="Search providers..." value={providerSearch} onChange={e => setProviderSearch(e.target.value)} />
                  </div>
                </div>
              </section>

              <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={`cat-row ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              >
                {GAME_TYPES.map(type => (
                  <button
                    key={type.id}
                    className={`cat-pill ${activeType === type.id ? 'on' : ''}`}
                    onClick={() => !isDragging && setActiveType(type.id)}
                  >
                    <span className="cat-icon">{type.icon}</span>
                    <span className="cat-name">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <section className="provider-deck">
              <div className="provider-deck-head">
                <strong>Provider Deck</strong>
                <span>{activeProvider === 'all' ? 'All Studios' : activeProvider}</span>
              </div>
              <div className="provider-grid-top">
                <button className={`provider-chip-top ${activeProvider === 'all' ? 'on' : ''}`} onClick={() => setActiveProvider('all')}>
                  <div className="s-ico c-sa" style={{ fontSize: '11px' }}>ALL</div>
                  <span className="provider-chip-copy">
                    <strong>All Providers</strong>
                    <span>{allGames.length} games</span>
                  </span>
                </button>
                {providers.filter(p => p.toLowerCase().includes(providerSearch.toLowerCase())).map(p => {
                  const info = getProviderIconInfo(p);
                  return (
                    <button key={p} className={`provider-chip-top ${activeProvider === p ? 'on' : ''}`} onClick={() => setActiveProvider(p)}>
                      <div className={`s-ico ${info.cls}`}>{info.ico}</div>
                      <span className="provider-chip-copy">
                        <strong title={p}>{p}</strong>
                        <span>{providerCounts[p]} games</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </section>

          {/* JACKPOT BAR */}
          <div className="jp-bar">
            <div className="jp-label">🏆 Daily Jackpot</div>
            <div className="jp-sep"></div>
            <div className="jp-val">₹ {jpAmount.toLocaleString('en-IN')}</div>
            <button className="jp-btn">SPIN NOW →</button>
          </div>

          {/* WINS STRIP */}
          <div className="wins-bar">
            <div className="wins-label">🎉 Big Wins</div>
            <div className="wins-bar-inner">
              <div className="wins-scroll">
                {casinoWinsLoading ? (
                  <div className="witem"><span className="wuser">Loading live wins...</span><span className="wgame">Real backend data</span></div>
                ) : casinoWins.length > 0 ? (
                  [...casinoWins, ...casinoWins].map((win, index) => (
                    <div className="witem" key={`${win.user}-${win.game}-${index}`}>
                      <div className="wavatar">{win.avatar}</div>
                      <span className="wuser">{win.user}</span>
                      <span className="wgame">{win.game}</span>
                      <span className="wamt">+₹{win.amount}</span>
                    </div>
                  ))
                ) : (
                  <div className="witem"><span className="wuser">No live wins found</span><span className="wgame">Profitable casino bets will appear here</span></div>
                )}
              </div>
            </div>
          </div>

          <div className="sec-row">
            <div className="sec-title">All Live Games</div>
            <div className="search-box">
              <FaSearch />
              <input type="text" placeholder="Search games..." value={gameSearch} onChange={e => setGameSearch(e.target.value)} />
            </div>
          </div>

          {/* GAME GRID */}
          {filteredGames.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-[#0b1120] rounded-xl border border-[rgba(255,255,255,0.06)]">
              <FaSearch className="text-5xl text-white/10 mb-4" />
              <h3 className="text-lg font-bold text-white/80 uppercase tracking-widest mb-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>No Games Found</h3>
              <p className="text-sm text-white/50 max-w-sm">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="game-grid">
              {filteredGames.slice(0, displayLimit).map((game, idx) => {
                const info = getProviderIconInfo(game["Game Provider"] || game.provider || "");
                const isHot = idx % 5 === 0;
                const isLive = idx % 3 === 0 && !isHot;

                return (
                  <div key={`${game["Game UID"]}-${idx}`} className="gcard" onClick={() => handleGameClick(game)}>
                    <div className={`gthumb ${info.cls}`}>
                      {game.icon && <img loading="lazy" src={game.icon} alt={game["Game Name"]} />}
                      {!game.icon && (
                        <>
                          <div className="gicon">{info.ico}</div>
                          <div className="gshortname">{game["Game Name"]}</div>
                        </>
                      )}
                      <div className="gthumb-shade"></div>
                      <div className="gplay"><div className="gplay-btn"><FaPlay size={12} /></div></div>
                    </div>
                    <div className="ginfo">
                      <div className="gname" title={game["Game Name"]}>{game["Game Name"]}</div>
                      <div className="gmeta">
                        <span className="gprov">{game["Game Provider"] || game.provider || "Casino"}</span>
                        {isHot && <span className="gtag-hot">🔥 HOT</span>}
                        {isLive && <span className="gtag-live">● LIVE</span>}
                        {!isHot && !isLive && <span className="gtag-pop">POPULAR</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          {filteredGames.length > displayLimit && (
            <div ref={observerTarget} className="w-full flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#f0b429] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      {confirmPopup.show && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[100000] p-4 font-['Oxanium']">
          <div className="bg-[#0b1120] border border-[rgba(34,198,232,0.18)] p-8 rounded-xl max-w-sm w-full text-center relative overflow-hidden shadow-[0_24px_60px_rgba(14,32,64,0.45)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0e2040] via-[#1646d7] to-[#22c6e8]"></div>

            <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-4 border border-white/10 shadow-lg">
              <img src={confirmPopup.game?.icon || "/placeholder.svg"} alt="Game" className="w-full h-full object-cover" />
            </div>

            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
              {confirmPopup.error === "balance_error" ? "Insufficient Balance" :
                confirmPopup.error === "authorization_error" ? "Session Expired" :
                  confirmPopup.error ? "Game Unavailable" :
                    "Ready to Play?"}
            </h3>

            <p className="text-sm text-gray-400 mb-6 font-['Rajdhani']">
              {confirmPopup.error === "balance_error" ? "A minimum deposit is required to play this game." :
                confirmPopup.error === "authorization_error" ? "Please log in again to continue." :
                  confirmPopup.error ? `Error: ${confirmPopup.error}` :
                    `You are about to launch ${confirmPopup.game?.["Game Name"]}.`}
            </p>

            <div className="flex flex-col gap-3">
              {confirmPopup.error === "balance_error" ? (
                <button onClick={() => setConfirmPopup({ show: false, game: null, error: null })} className="bg-gradient-to-br from-[#0e2040] via-[#1646d7] to-[#22c6e8] text-white font-bold uppercase rounded-lg w-full justify-center py-2.5 shadow-[0_12px_28px_rgba(22,70,215,0.28)]">Add Funds</button>
              ) : confirmPopup.error === "authorization_error" ? (
                <button onClick={handleAuthError} className="bg-gradient-to-br from-[#0e2040] via-[#1646d7] to-[#22c6e8] text-white font-bold uppercase rounded-lg w-full justify-center py-2.5 shadow-[0_12px_28px_rgba(22,70,215,0.28)]">Log In Again</button>
              ) : confirmPopup.error ? (
                <button onClick={() => setConfirmPopup({ show: false, game: null, error: null })} className="bg-transparent border border-[#22c6e8] text-[#22c6e8] font-bold uppercase rounded-lg w-full justify-center py-2.5">Try Another</button>
              ) : (
                <button onClick={confirmGameOpen} className="bg-gradient-to-br from-[#0e2040] via-[#1646d7] to-[#22c6e8] text-white font-bold uppercase rounded-lg w-full justify-center py-2.5 shadow-[0_12px_28px_rgba(22,70,215,0.28)]">Confirm Play</button>
              )}
              <button onClick={() => setConfirmPopup({ show: false, game: null, error: null })} className="text-xs text-gray-500 font-bold uppercase hover:text-white mt-1 transition-colors">Cancel</button>
            </div>
          </div>
        </div>, document.body
      )}

      {confirmLoading && createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100000] flex flex-col items-center justify-center p-4 font-['Oxanium']">
          <div className="bg-[#0b1120] border border-[#22c6e8]/30 p-8 rounded-xl max-w-sm w-full text-center relative shadow-[0_24px_60px_rgba(14,32,64,0.45)]">
            <div className="mb-6 relative">
              <div className="w-20 h-20 rounded-xl overflow-hidden mx-auto border-2 border-[#22c6e8] relative z-10">
                <img src={confirmPopup.game?.icon || "/placeholder.svg"} alt="Game" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#22c6e8] rounded-full blur-[30px] opacity-20"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-6 tracking-widest uppercase">Launching...</h3>

            <div className="w-full bg-[#162035] rounded-full h-1.5 overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-[#0e2040] via-[#1646d7] to-[#22c6e8] transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <div className="text-[10px] text-[#22c6e8] font-bold tracking-widest uppercase">{Math.round(loadingProgress)}% Loaded</div>
          </div>
        </div>, document.body
      )}

    </div>
  );
};

export default CasinoPage;
