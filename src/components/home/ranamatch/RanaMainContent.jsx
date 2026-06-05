import React, { useState } from 'react';
import { useSite } from "../../../context/SiteContext";
import { useGames } from "../../../context/GameContext";
import { URL as BASE_URL } from "../../../utils/constants";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { apiPost } from "../../../utils/apiFetch";
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
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const RanaMainContent = () => {
  const COLORS = useColors();
  const { heroBanners, accountInfo, promoBanners, setShowLogin, setShowRegister } = useSite();
  const { casino } = useGames() || {};
  const navigate = useNavigate();
  const getSafeLogoUrl = (path) => {
    if (!path) return "/placeholder.svg";
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    return `${base}${path.startsWith('/') ? path : '/' + path}`;
  };

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
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 px-1 md:px-2">
          <h2 className="section-banner max-w-full" style={{ fontFamily: FONTS.head }}>
            <span>Exclusive Elite Offers</span>
          </h2>
          <a href="/promotion" className="see-all">
            View All
          </a>
        </div>

        <div className="elite-offers-grid">
        {promoBanners && promoBanners.length > 0 ? (
          promoBanners.slice(0, 2).map((promo, index) => (
            <article key={index} className="elite-offer-card group">
              <img
                src={promo.image_path?.startsWith('http') ? promo.image_path : (promo.image_path?.startsWith('/') ? window.location.origin + promo.image_path : `${BASE_URL}${promo.image_path}`)}
                alt={promo.title || "Promotion"}
                className="elite-offer-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="elite-offer-overlay"></div>
              <div className="elite-offer-shine"></div>
              <span className="elite-offer-badge">Elite</span>
              <div className="elite-offer-action">
                <button className="elite-offer-btn" onClick={(e) => { e.stopPropagation(); if (!accountInfo?.account_id) { setShowLogin(true); } else { /* TODO: navigate to offer */ } }}>
                  Explore
                </button>
              </div>
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
                  <div className="elite-offer-action">
                    <button className="elite-offer-btn" onClick={() => !accountInfo?.account_id && setShowLogin(true)}>
                      Explore
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

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
