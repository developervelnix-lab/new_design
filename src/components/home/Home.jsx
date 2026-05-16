"use client"

import { useState, useEffect } from "react"
import { FaEye, FaArrowLeft } from "react-icons/fa"
import FrontScrollableCard from "./FrontScrollableCard"
import Navbar from "../navbar/Navbar"
import TrendingSlot from "./TrendingSlot"
import GamesDisplay from "./GameDisplay"
import GameProvider from "./GameProvider"
import Faq from "./Faq"
import MobileFooterNav from "../navbar/MobileFooterNav"
import Live from "./Live"
import CasinoLobby from "./CasinoLobby"
import Turbogames from "./Turbogames"
import FeaturesSection from "./FeaturesSection"
import PromotionSection from "./PromotionSection"
import NewsTicker from "./NewsTicker"
import Footer from "./Footer"
import HomeSearch from "./HomeSearch"
import ProviderSelection from "./ProviderSelection"
import { useColors } from '../../hooks/useColors'
import { FONTS } from '../../constants/theme'
import { useSite } from "../../context/SiteContext"
import { URL as BASE_URL } from "../../utils/constants"

function Home() {
  const COLORS = useColors()
  const { accountInfo, promoBanners, heroBanners, loading } = useSite()

  const [showToast, setShowToast] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkAuth = () => {
    const authSecretKey = localStorage.getItem("auth_secret_key")
    const wasAuthenticated = isAuthenticated
    const isNowAuthenticated = !!authSecretKey

    setIsAuthenticated(isNowAuthenticated)

    if (isNowAuthenticated && !wasAuthenticated) {
      setShowSuccessToast(true)
      setShowToast(false)
      setTimeout(() => setShowSuccessToast(false), 5000)
    } else if (!isNowAuthenticated && wasAuthenticated) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } else {
      setShowToast(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {

      const justLoggedIn = localStorage.getItem("just_logged_in") === "true"
      const authSecretKey = localStorage.getItem("auth_secret_key")
      const isLoggedIn = !!authSecretKey

      setIsAuthenticated(isLoggedIn)

      if (isLoggedIn) {
        if (justLoggedIn) {
          setShowSuccessToast(true)
          localStorage.removeItem("just_logged_in")
          setTimeout(() => setShowSuccessToast(false), 5000)
        }
      }
    }, 10)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "auth_secret_key") {
        checkAuth()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [isAuthenticated])

  useEffect(() => {
    document.body.classList.add("show-whatsapp")
    return () => document.body.classList.remove("show-whatsapp")
  }, [])

  useEffect(() => {
    // 1. Initial Trap: Push a hidden state into history without changing the visible URL
    if (!window.history.state || !window.history.state.isHome) {
      window.history.replaceState({ isHome: true, isAtTop: true }, "");
      // Push a second state so that clicking 'Back' has something to return to
      window.history.pushState({ isHome: true, isAtTop: false }, "");
    }

    const handlePopState = (event) => {
      // 2. Check if we returned to our 'isAtTop' state
      if (event.state && event.state.isAtTop) {
        if (window.scrollY > 300) {
          // 3. Scroll to top smoothly
          window.scrollTo({ top: 0, behavior: "smooth" });

          // 4. RE-TRAP: Put the 'scrolled down' state back so the NEXT back click exits
          window.history.pushState({ isHome: true, isAtTop: false }, "");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (window.location.hash && window.location.hash !== "#top") {
      const id = window.location.hash.substring(1)
      const element = document.getElementById(id)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" })
        }, 500)
      }
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen relative">
      {showToast && !isAuthenticated && <ToastMessage onClose={() => setShowToast(false)} />}
      {showSuccessToast && <SuccessToastMessage onClose={() => setShowSuccessToast(false)} />}

      <main className="flex-grow" style={{ backgroundColor: COLORS.bg }}>
        <Navbar externalAccountInfo={accountInfo} />

        {/* HERO BANNER SECTION */}
        <div className="px-0 md:px-0">
          <FrontScrollableCard banners={heroBanners} />
        </div>

        <NewsTicker />

        <div className="px-4 md:px-8 mt-2 md:mt-4">
          {/* BRANDING BANNER & SEARCH */}
          <div className="mb-3 md:mb-4 relative flex items-center" id="trending-slots">
            <div className="w-full">
              <TrendingSlot />
            </div>
            <div className="absolute right-4 md:right-8 z-[60]">
              <HomeSearch />
            </div>
          </div>

          {/* DYNAMIC GAME SECTIONS */}
          <div className="mb-3 md:mb-4">
            <ProviderSelection />
          </div>
          <div className="mb-3 md:mb-4">
            <Live />
          </div>
          <div className="mb-3 md:mb-4" id="casino-lobby">
            <CasinoLobby />
          </div>
          <div className="mb-3 md:mb-4">
            <GamesDisplay section="trending-games" />
          </div>
          <div className="mb-3 md:mb-4">
            <GamesDisplay section="slots" />
          </div>
          <div className="mb-3 md:mb-4" id="fantasy-games">
            <GamesDisplay section="fantasy" />
          </div>
          <div className="mb-3 md:mb-4" id="aviator">
            <Turbogames />
          </div>
          <div className="mb-3 md:mb-4">
            <GamesDisplay section="poker" />
          </div>
          <div className="mb-3 md:mb-4">
            <GamesDisplay section="fishing" />
          </div>
          <div className="mb-3 md:mb-4" id="promotions">
            <PromotionSection banners={promoBanners} />
          </div>

        </div>

        <div className="mb-4 md:mb-6">
          <GameProvider />
        </div>
      </main>

      <div className="px-4 md:px-8 mb-4 md:mb-6">
        <FeaturesSection />
      </div>
      <div className="px-4 md:px-8 mb-4 md:mb-6">
        <Faq />
      </div>
      <Footer accountInfo={accountInfo} />
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileFooterNav />
      </footer>

      <style>{`
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

function ToastMessage({ onClose }) {
  return (
    <div className="toast-message fixed top-8 left-1/2 transform -translate-x-1/2 p-4 bg-red-600 text-black dark:text-white flex justify-between items-center animate-slide-in rounded-lg shadow-lg w-[90%] md:w-[400px] z-[1000]">
      <span className="flex-1 text-center">Please login to play. Minimum deposit ₹100 required.</span>
      <button onClick={onClose} className="ml-4 text-black dark:text-white font-bold">
        &times;
      </button>
    </div>
  )
}

function SuccessToastMessage({ onClose }) {
  const COLORS = useColors()
  return (
    <div
      className="toast-message fixed top-8 left-1/2 transform -translate-x-1/2 p-4 text-black dark:text-white flex justify-between items-center animate-slide-in rounded-lg shadow-lg w-[90%] md:w-[400px] z-[1000]"
      style={{ backgroundColor: `${COLORS.brand}CC` }}
    >
      <span className="flex-1 text-center">Successfully logged in. Welcome!</span>
      <button onClick={onClose} className="ml-4 text-black dark:text-white font-bold">
        &times;
      </button>
    </div>
  )
}


export default Home
