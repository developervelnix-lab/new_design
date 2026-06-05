import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useGames } from "../../context/GameContext";
import { useSite } from "../../context/SiteContext";
import { useColors } from "../../hooks/useColors";
import { FONTS } from "../../constants/theme";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "@/utils/apiFetch";
import { FaPlay, FaSearch, FaTimes } from "react-icons/fa";

import RanaHeader from "../home/ranamatch/RanaHeader";
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
      if(document.head.contains(link1)) document.head.removeChild(link1);
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
          
          flex: 1; display: flex; overflow: hidden; font-family: 'Rajdhani', sans-serif;
          background: var(--bg0); color: var(--hi);
        }
        
 

        /* SIDEBAR */
        .sidebar{width:220px;flex-shrink:0;background:var(--bg1);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--lo) transparent}
        .sidebar::-webkit-scrollbar{width:3px}
        .sidebar::-webkit-scrollbar-thumb{background:var(--lo);border-radius:3px}
        .s-head{font-family:'Oxanium',sans-serif;font-size:10px;font-weight:700;letter-spacing:.18em;color:var(--lo);padding:18px 16px 8px;text-transform:uppercase}
        .s-search{padding: 8px 16px 12px; border-bottom: 1px solid var(--border); margin-bottom: 8px;}
        .s-search input{width:100%; background:var(--bg0); border:1px solid var(--border); color:var(--hi); padding:8px 12px; border-radius:6px; font-family:'Rajdhani',sans-serif; font-size:12px; outline:none;}
        .s-search input:focus{border-color:var(--gold);}
        
        .s-item{display:flex;align-items:center;gap:9px;padding:8px 16px;cursor:pointer;border-left:2px solid transparent;transition:.15s;position:relative}
        .s-item:hover{background:var(--bg3)}
        .s-item.on{background:rgba(240,180,41,.05);border-left-color:var(--gold)}
        .s-ico{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;background:var(--bg0)}
        .s-name{font-family:'Oxanium',sans-serif;font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--mid);transition:.15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .s-item:hover .s-name,.s-item.on .s-name{color:var(--hi)}
        .s-item.on .s-name{color:var(--gold)}
        .s-ct{margin-left:auto;font-family:'Oxanium',sans-serif;font-size:9px;font-weight:700;color:var(--lo);background:var(--bg0);border:1px solid var(--border);padding:2px 6px;border-radius:20px;flex-shrink:0}
        .s-item.on .s-ct{background:rgba(240,180,41,.12);color:var(--gold);border-color:rgba(240,180,41,.25)}

        /* CONTENT */
        .content{flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:var(--lo) transparent;padding:24px 28px}
        .content::-webkit-scrollbar{width:4px}
        .content::-webkit-scrollbar-thumb{background:var(--lo);border-radius:3px}

        /* JACKPOT BAR */
        .jp-bar{background:linear-gradient(135deg,#0b1f0e,#142918);border:1px solid rgba(0,230,118,.15);border-radius:10px;padding:8px 18px;margin-bottom:16px;display:flex;align-items:center;gap:14px;position:relative;overflow:hidden}
        .jp-bar::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(0,230,118,.04) 1px,transparent 1px);background-size:20px 20px;pointer-events:none}
        .jp-label{font-family:'Oxanium',sans-serif;font-size:10px;font-weight:800;letter-spacing:.18em;color:var(--green) !important;text-transform:uppercase;flex-shrink:0;display:flex;align-items:center;gap:6px}
        .jp-sep{width:1px;background:rgba(0,230,118,.15);align-self:stretch;flex-shrink:0}
        .jp-val{font-family:'Exo 2',sans-serif;font-size:22px;font-weight:900;color:var(--green) !important;letter-spacing:-.02em;flex:1;text-align:center}
        .jp-btn{padding:7px 18px;background:linear-gradient(135deg,var(--green),#00b860);border:none;color:#000 !important;font-family:'Oxanium',sans-serif;font-size:10px;font-weight:800;letter-spacing:.12em;border-radius:6px;cursor:pointer;flex-shrink:0;transition:.2s}
        .jp-btn:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,230,118,.3)}

        /* CATEGORY PILLS */
        .cat-row{display:flex;gap:8px;margin-bottom:24px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
        .cat-row::-webkit-scrollbar{display:none}
        .cat-pill{flex-shrink:0;padding:8px 16px;border-radius:30px;border:1px solid var(--lo);background:none;color:var(--mid) !important;font-family:'Oxanium',sans-serif;font-size:11px;font-weight:700;letter-spacing:.07em;cursor:pointer;transition:.15s;display:flex;align-items:center;gap:8px}
        .cat-pill:hover{border-color:var(--mid);color:var(--hi) !important;}
        .cat-pill.on{background:rgba(240,180,41,.1);border-color:rgba(240,180,41,.4);color:var(--gold) !important;}

        /* SECTION ROW */
        .sec-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .sec-title{font-family:'Oxanium',sans-serif;font-size:14px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--hi) !important;display:flex;align-items:center;gap:8px}
        .sec-title::before{content:'';display:block;width:3px;height:16px;background:linear-gradient(180deg,var(--gold),var(--gold2));border-radius:2px}
        
        .search-box{position:relative;}
        .search-box input{background:var(--bg1); border:1px solid var(--border); color:var(--hi); padding:8px 14px 8px 32px; border-radius:6px; font-family:'Rajdhani',sans-serif; font-size:12px; outline:none; width:200px;}
        .search-box input:focus{border-color:var(--gold);}
        .search-box svg{position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--mid);}

        /* WINS STRIP */
        .wins-bar{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 18px;margin-bottom:24px;display:flex;align-items:center;gap:16px;overflow:hidden;position:relative;z-index:0;isolation:isolate;}
        .wins-bar-inner{flex:1;overflow:hidden;min-width:0;}
        .wins-label{font-family:'Oxanium',sans-serif;font-size:10px;font-weight:800;letter-spacing:.18em;color:var(--gold) !important;text-transform:uppercase;flex-shrink:0;white-space:nowrap;display:flex;align-items:center;gap:8px}
        .wins-label::after{content:'';width:1px;height:20px;background:var(--border)}
        .wins-scroll{display:flex;gap:24px;animation:wsroll 22s linear infinite;width:max-content;}
        @keyframes wsroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .witem{display:flex;align-items:center;gap:8px;flex-shrink:0}
        .wavatar{width:24px;height:24px;border-radius:50%;background:var(--bg0);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px}
        .wuser{font-family:'Oxanium',sans-serif;font-size:11px;font-weight:600;color:var(--mid) !important;}
        .wgame{font-family:'Rajdhani',sans-serif;font-size:11px;color:var(--lo) !important;}
        .wamt{font-family:'Oxanium',sans-serif;font-size:12px;font-weight:800;color:var(--green) !important;}

        /* GAME GRID */
        .game-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-bottom:32px}
        .gcard{border-radius:12px;overflow:hidden;position:relative;cursor:pointer;background:var(--bg1);border:1px solid var(--border);transition:.22s;animation:fadeUp .4s ease both}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .gcard:hover{transform:translateY(-4px);border-color:rgba(240,180,41,.28);box-shadow:0 12px 30px rgba(0,0,0,.5)}
        .gthumb{position:relative;aspect-ratio:4/3;overflow:hidden;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px; background-size: cover; background-position: center;}
        .gthumb img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity: 0.9;}
        .gcard:hover .gthumb img{opacity: 1; transform: scale(1.05); transition: all 0.3s;}
        .gthumb-shade{position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(0,0,0,.8) 100%);opacity:0;transition:.22s}
        .gcard:hover .gthumb-shade{opacity:1}
        .gplay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:.22s}
        .gcard:hover .gplay{opacity:1}
        .gplay-btn{width:44px;height:44px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-size:16px;transform:scale(.7);transition:.2s;color:#000;box-shadow:0 0 15px var(--gold);}
        .gcard:hover .gplay-btn{transform:scale(1)}
        .gicon{font-size:32px;transition:.3s;pointer-events:none; z-index:2;}
        .gcard:hover .gicon{transform:scale(1.1)}
        .gshortname{font-family:'Oxanium',sans-serif;font-size:9px;font-weight:600;color:rgba(255,255,255,.4);letter-spacing:.08em;pointer-events:none; z-index:2;}
        .ginfo{padding:10px 12px}
        .gname{font-family:'Oxanium',sans-serif;font-size:12px;font-weight:700;color:var(--hi);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .gmeta{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
        .gprov{font-family:'Rajdhani',sans-serif;font-size:11px;color:var(--mid)}
        .gtag-live{font-family:'Oxanium',sans-serif;font-size:9px;font-weight:800;letter-spacing:.06em;color:var(--red);background:rgba(255,23,68,.1);border:1px solid rgba(255,23,68,.22);padding:3px 6px;border-radius:4px}
        .gtag-hot{font-family:'Oxanium',sans-serif;font-size:9px;font-weight:800;color:var(--gold);background:rgba(240,180,41,.1);border:1px solid rgba(240,180,41,.22);padding:3px 6px;border-radius:4px}
        .gtag-pop{font-family:'Oxanium',sans-serif;font-size:9px;font-weight:800;color:var(--green);background:rgba(0,230,118,.08);border:1px solid rgba(0,230,118,.2);padding:3px 6px;border-radius:4px}

        /* BG COLORS */
        .c-ev{background:linear-gradient(150deg,#0c0818 0%,#1e0f4a 100%)}
        .c-pg{background:linear-gradient(150deg,#08122a 0%,#0e2a5c 100%)}
        .c-cr{background:linear-gradient(150deg,#140818 0%,#38083a 100%)}
        .c-ez{background:linear-gradient(150deg,#081410 0%,#0c3022 100%)}
        .c-sa{background:linear-gradient(150deg,#0a1020 0%,#0e2040 100%)}
        .c-rc{background:linear-gradient(150deg,#1a1000 0%,#3a2000 100%)}
      `}</style>

 

      <div className="casino-shell">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="s-head">Providers</div>
          <div className="s-search">
             <input type="text" placeholder="Search provider..." value={providerSearch} onChange={e => setProviderSearch(e.target.value)} />
          </div>
          
          <div className={`s-item ${activeProvider === 'all' ? 'on' : ''}`} onClick={() => setActiveProvider('all')}>
            <div className="s-ico c-sa" style={{fontSize: '11px'}}>ALL</div>
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

          {/* CATEGORY PILLS */}
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
                {type.icon} {type.label}
              </button>
            ))}
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
          <div className="bg-[#0b1120] border border-[rgba(255,255,255,0.1)] p-8 rounded-xl max-w-sm w-full text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-[#f0b429]"></div>
             
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
                   <button onClick={() => setConfirmPopup({ show: false, game: null, error: null })} className="bg-gradient-to-br from-[#f0b429] to-[#c8921a] text-black font-bold uppercase rounded-lg w-full justify-center py-2.5">Add Funds</button>
                ) : confirmPopup.error === "authorization_error" ? (
                   <button onClick={handleAuthError} className="bg-gradient-to-br from-[#f0b429] to-[#c8921a] text-black font-bold uppercase rounded-lg w-full justify-center py-2.5">Log In Again</button>
                ) : confirmPopup.error ? (
                   <button onClick={() => setConfirmPopup({ show: false, game: null, error: null })} className="bg-transparent border border-[#f0b429] text-[#f0b429] font-bold uppercase rounded-lg w-full justify-center py-2.5">Try Another</button>
                ) : (
                   <button onClick={confirmGameOpen} className="bg-gradient-to-br from-[#f0b429] to-[#c8921a] text-black font-bold uppercase rounded-lg w-full justify-center py-2.5">Confirm Play</button>
                )}
                <button onClick={() => setConfirmPopup({ show: false, game: null, error: null })} className="text-xs text-gray-500 font-bold uppercase hover:text-white mt-1 transition-colors">Cancel</button>
             </div>
          </div>
        </div>, document.body
      )}

      {confirmLoading && createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100000] flex flex-col items-center justify-center p-4 font-['Oxanium']">
           <div className="bg-[#0b1120] border border-[#f0b429]/30 p-8 rounded-xl max-w-sm w-full text-center relative">
              <div className="mb-6 relative">
                 <div className="w-20 h-20 rounded-xl overflow-hidden mx-auto border-2 border-[#f0b429] relative z-10">
                    <img src={confirmPopup.game?.icon || "/placeholder.svg"} alt="Game" className="w-full h-full object-cover" />
                 </div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#f0b429] rounded-full blur-[30px] opacity-20"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-6 tracking-widest uppercase">Launching...</h3>
              
              <div className="w-full bg-[#162035] rounded-full h-1.5 overflow-hidden mb-2">
                 <div className="h-full bg-[#f0b429] transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
              </div>
              <div className="text-[10px] text-[#f0b429] font-bold tracking-widest uppercase">{Math.round(loadingProgress)}% Loaded</div>
           </div>
        </div>, document.body
      )}

    </div>
  );
};

export default CasinoPage;
