import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSite } from "../../../context/SiteContext";
import { useGames } from "../../../context/GameContext";
import { URL as BASE_URL } from "../../../utils/constants";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { apiGet, apiPost } from "../../../utils/apiFetch";
import RanaFooter from "./RanaFooter";
import Live from '../Live';
import CasinoLobby from '../CasinoLobby';
import GamesDisplay from '../GameDisplay';
import Turbogames from '../Turbogames';
import GameProvider from '../GameProvider';
import FeaturesSection from '../FeaturesSection';
import Faq from '../Faq';
import { FONTS } from '../../../constants/theme';
import { useColors } from '../../../hooks/useColors';
import { FaExpandAlt, FaTimes } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const MobileBigWinsStrip = () => {
  const [wins, setWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const tickerWins = wins.length > 0 ? [...wins, ...wins] : [];

  useEffect(() => {
    let isMounted = true;

    const loadWins = async () => {
      try {
        const response = await apiGet("route-big-wins", { LIMIT: "10" });
        const result = await response.json();

        if (isMounted) {
          setWins(result?.status_code === "success" && Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error("Failed to load mobile wins", error);
        if (isMounted) setWins([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadWins();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mobile-bigwins-strip" aria-label="Recent big wins">
      <div className="mobile-bigwins-label">
        <span>🎉</span>
        <strong>Big Wins</strong>
      </div>
      <div className="mobile-bigwins-row">
        {loading ? (
          <div className="mobile-win-pill is-empty">Loading live wins...</div>
        ) : tickerWins.length > 0 ? (
          <div className="mobile-bigwins-track">
          {tickerWins.map((win, index) => (
            <div className="mobile-win-pill" key={`${win.user}-${win.game}-${index}`}>
              <span className={`win-avatar gt-${(index % 4) + 1}`}>{win.avatar}</span>
              <span className="mobile-win-copy">
                <strong>{win.user}</strong>
                <small>{win.game}</small>
              </span>
              <b>+₹{win.amount}</b>
            </div>
          ))}
          </div>
        ) : (
          <div className="mobile-win-pill is-empty">Live wins will appear after profitable bets.</div>
        )}
      </div>
    </section>
  );
};

const RanaMainContent = () => {
  const COLORS = useColors();
  const { heroBanners, accountInfo, promoBanners, setShowLogin, setShowRegister } = useSite();
  const { casino } = useGames() || {};
  const navigate = useNavigate();
  const [activeOffer, setActiveOffer] = useState(null);
  const getSafeLogoUrl = (path) => {
    if (!path) return "/placeholder.svg";
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    return `${base}${path.startsWith('/') ? path : '/' + path}`;
  };
  const openOfferPreview = (promo) => {
    setActiveOffer({
      title: promo?.title || "Exclusive Elite Offer",
      image: getSafeLogoUrl(promo?.image_path),
    });
  };
  const closeOfferPreview = () => setActiveOffer(null);

  return (
    <main className="main-content">
      {/* Hero Banner Area */}
      <div className="hero-banner">
        {heroBanners && heroBanners.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop={heroBanners.length > 1}
            className="w-full h-full"
            style={{ width: '100%', height: '100%', borderRadius: '12px' }}
          >
            {heroBanners.map((banner, idx) => (
              <SwiperSlide key={idx} style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <a
                  href={banner.action_url || "#"}
                  className="block w-full h-full relative"
                  onClick={(e) => {
                    if (!banner.action_url || banner.action_url === "#") {
                      e.preventDefault();
                      if (!accountInfo?.account_id) {
                        setShowLogin(true);
                      }
                    }
                  }}
                >
                  <img
                    src={getSafeLogoUrl(banner.image_path)}
                    alt={banner.title || `Banner ${idx + 1}`}
                    className="hero-banner-img"
                  />
                  {banner.title && (
                    <div className="hero-content" style={{ zIndex: 10, position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div className="hero-badge">PREMIUM OFFER</div>
                      <h1 className="hero-title">{banner.title}</h1>
                      {banner.subtitle && <p className="hero-sub">{banner.subtitle}</p>}
                      <div className="hero-btns">
                        <button className="btn btn-brand" onClick={(e) => { e.stopPropagation(); !accountInfo?.account_id && setShowLogin(true); }}>Play Now</button>
                        <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); navigate("/promotion"); }}>View Promotions</button>
                      </div>
                    </div>
                  )}
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <>
            <div className="hero-bg-pattern"></div>
            <div className="hero-grid-lines"></div>
            <div className="hero-content">
              <div className="hero-badge">🔥 Welcome Offer</div>
              <h1 className="hero-title">
                GET <span className="accent">₹50,000</span><br />
                <span className="accent">BONUS</span>
              </h1>
              <p className="hero-sub">100% First Deposit Bonus + 50 Free Spins<br />on your favourite games</p>
              <div className="hero-btns">
                <button className="btn btn-brand" onClick={() => setShowRegister(true)}>Claim Bonus</button>
                <button className="btn btn-outline" onClick={() => !accountInfo?.account_id && setShowLogin(true)}>Explore Games</button>
              </div>
            </div>
            <div className="hero-art">
              <div className="hero-art-inner">🏏</div>
            </div>
          </>
        )}
      </div>

      <MobileBigWinsStrip />

      {/* Promo Strip */}
      <div className="promo-strip">
        <a href="#" className="promo-card">
          <div className="promo-icon">💰</div>
          <div className="promo-info">
            <div className="promo-label">First Deposit</div>
            <div className="promo-val">100% UP TO</div>
            <div className="promo-desc">₹20,000 bonus on first deposit</div>
          </div>
        </a>
        <a href="#" className="promo-card">
          <div className="promo-icon">🎁</div>
          <div className="promo-info">
            <div className="promo-label">Reload Bonus</div>
            <div className="promo-val">20% WEEKLY</div>
            <div className="promo-desc">Every Monday reload reward</div>
          </div>
        </a>
        <a href="#" className="promo-card">
          <div className="promo-icon">👥</div>
          <div className="promo-info">
            <div className="promo-label">Refer & Earn</div>
            <div className="promo-val">₹500 PER</div>
            <div className="promo-desc">Per friend referred & deposited</div>
          </div>
        </a>
      </div>

      {/* Dynamic Game Sections */}
      <Live />
      <CasinoLobby />
      <GamesDisplay section="trending-games" />
      <GamesDisplay section="slots" />
      <GamesDisplay section="fantasy" />
      <Turbogames />
      <GamesDisplay section="poker" />
      <GamesDisplay section="fishing" />

      {/* Elite Offers Section */}
      <section className="mt-7 px-4 md:px-0 w-full">
        <div className="elite-offers-head flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 px-1 md:px-2">
          <h2 className="section-banner max-w-full" style={{ fontFamily: FONTS.head }}>
            <span>Exclusive Elite Offers</span>
          </h2>
          <a href="/promotion" className="see-all">
            View All
          </a>
        </div>

        <div className="elite-offers-scroll-shell">
        <div className="elite-offers-grid">
        {promoBanners && promoBanners.length > 0 ? (
          [...promoBanners.slice(0, 2), ...promoBanners.slice(0, 2)].map((promo, index) => (
            <article
              key={index}
              className={`elite-offer-card group ${index >= promoBanners.slice(0, 2).length ? 'is-duplicate' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => openOfferPreview(promo)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openOfferPreview(promo);
                }
              }}
            >
              <img
                src={getSafeLogoUrl(promo.image_path)}
                alt={promo.title || "Promotion"}
                className="elite-offer-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="elite-offer-overlay"></div>
              <div className="elite-offer-shine"></div>
              <span className="elite-offer-badge">Elite</span>
              <button
                type="button"
                className="elite-offer-fullscreen"
                onClick={(event) => {
                  event.stopPropagation();
                  openOfferPreview(promo);
                }}
                aria-label="Open offer fullscreen"
              >
                <FaExpandAlt />
              </button>
            </article>
          ))
        ) : (
            <>
              {[
                { color: COLORS.brand },
                { color: '#22d3ee' },
              ].map((card, i) => (
                <div key={i} className="elite-offer-card elite-offer-empty" style={{ '--elite-accent': card.color }}>
                  <div className="elite-offer-empty-glow"></div>
                  <span className="elite-offer-badge">Elite</span>
                  <span className="elite-offer-empty-label">Offer coming soon</span>
                </div>
              ))}
            </>
          )}
        </div>
        </div>
      </section>

      {activeOffer && createPortal(
        <div className="elite-offer-viewer" role="dialog" aria-modal="true" aria-label="Promotion preview" onClick={closeOfferPreview}>
          <div className="elite-offer-viewer-glow"></div>
          <button type="button" className="elite-offer-viewer-close" onClick={closeOfferPreview} aria-label="Close preview">
            <FaTimes />
          </button>
          <div className="elite-offer-viewer-frame" onClick={(event) => event.stopPropagation()}>
            <div className="elite-offer-viewer-top">
              <span>Exclusive Elite Offer</span>
              <strong>{activeOffer.title}</strong>
            </div>
            <img src={activeOffer.image} alt={activeOffer.title} />
          </div>
        </div>,
        document.body
      )}

      {/* Game Providers Section */}
      <GameProvider />

      {/* Why Choose Us Section */}
      <FeaturesSection />

      {/* Frequently Asked Questions (FAQ) Section */}
      <Faq />

      <RanaFooter />
    </main>
  );
};

export default RanaMainContent;
