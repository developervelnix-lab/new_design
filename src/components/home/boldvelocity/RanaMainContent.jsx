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
import LiveToasts from './LiveToasts';
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
      <div className="hero">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="hero-banner hero-image-only">
            {heroBanners && heroBanners.length > 0 ? (
              <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                effect="fade"
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={heroBanners.length > 1}
                className="hero-image-slider"
              >
                {heroBanners.map((banner, idx) => (
                  <SwiperSlide key={idx}>
                    <a
                      href={banner.action_url || "#"}
                      className="hero-image-link"
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
                        className="hero-image-banner"
                      />
                    </a>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <img
                src="/banner/image.png"
                alt="Promotional banner"
                className="hero-image-banner"
              />
            )}
          </div>
          {/* Promo Metrics Strip */}
          <div className="promo-metrics-strip">
            <a href="#" className="metric-item">
              <div className="metric-val gold-gradient">100%</div>
              <div className="metric-label">First Deposit</div>
            </a>
            <div className="metric-divider"></div>
            <a href="#" className="metric-item">
              <div className="metric-val green-gradient">20%</div>
              <div className="metric-label">Reload Bonus</div>
            </a>
            <div className="metric-divider"></div>
            <a href="#" className="metric-item">
              <div className="metric-val red-gradient">₹500</div>
              <div className="metric-label">Refer & Earn</div>
            </a>
            <div className="metric-divider"></div>
            <a href="#" className="metric-item live-sports">
              <div className="metric-val white-glow">⚽ Live</div>
              <div className="metric-label">Sports</div>
            </a>
          </div>
        </div>

        {/* LIVE PANEL */}
        <div className="live-panel">
          <div className="live-header">
            <span className="live-tag">Live Now</span>
            <span className="event-count">94 events</span>
          </div>

          <div className="live-match">
            <div className="match-meta"><i className="ti ti-cricket"></i> IPL · T20 · Match 42</div>
            <div className="match-body">
              <div className="teams">
                <div className="team-name">Mumbai Indians</div>
                <div className="match-time">44.1 OVR ▸</div>
                <div className="team-name">Chennai Super Kings</div>
              </div>
              <div className="score-block">
                <div className="score">192/6</div>
                <div style={{ height: '2px' }}></div>
                <div className="score dim">Need 18</div>
              </div>
            </div>
            <div className="odds-row">
              <div className="odd"><span className="odd-type">MI WIN</span><span className="odd-val">1.58</span></div>
              <div className="odd"><span className="odd-type">DRAW</span><span className="odd-val">9.00</span></div>
              <div className="odd"><span className="odd-type">CSK WIN</span><span className="odd-val">2.45</span></div>
            </div>
          </div>

          <div className="live-match">
            <div className="match-meta"><i className="ti ti-ball-football"></i> EPL · Matchday 38</div>
            <div className="match-body">
              <div className="teams">
                <div className="team-name">Manchester City</div>
                <div className="match-time">72' ▸</div>
                <div className="team-name">Arsenal</div>
              </div>
              <div className="score-block">
                <div className="score">2</div>
                <div style={{ height: '2px' }}></div>
                <div className="score">1</div>
              </div>
            </div>
            <div className="odds-row">
              <div className="odd"><span className="odd-type">1</span><span className="odd-val">1.38</span></div>
              <div className="odd"><span className="odd-type">X</span><span className="odd-val">5.50</span></div>
              <div className="odd"><span className="odd-type">2</span><span className="odd-val">4.20</span></div>
            </div>
          </div>

          <div className="live-match">
            <div className="match-meta"><i className="ti ti-tennis"></i> ATP · Wimbledon · SF</div>
            <div className="match-body">
              <div className="teams">
                <div className="team-name">N. Djokovic</div>
                <div className="match-time">Set 3 ▸</div>
                <div className="team-name">C. Alcaraz</div>
              </div>
              <div className="score-block">
                <div className="score dim" style={{ fontSize: '12px' }}>6-3, 4-6</div>
                <div style={{ height: '4px' }}></div>
                <div className="score dim" style={{ fontSize: '12px' }}>3-6, 6-4</div>
              </div>
            </div>
            <div className="odds-row">
              <div className="odd"><span className="odd-type">DJOK</span><span className="odd-val">2.20</span></div>
              <div className="odd"><span className="odd-type">ALC</span><span className="odd-val">1.70</span></div>
            </div>
          </div>

          <div className="live-more">View all 94 live events →</div>
        </div>
      </div>

      <MobileBigWinsStrip />

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
      <LiveToasts />
    </main>
  );
};

export default RanaMainContent;
