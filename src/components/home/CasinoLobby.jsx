"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { FaChevronLeft, FaChevronRight, FaEye, FaArrowLeft, FaPlay } from "react-icons/fa"
import { useNavigate, useSearchParams } from "react-router-dom"
import { apiPost } from "@/utils/apiFetch"
import { useColors } from '../../hooks/useColors'
import { FONTS } from '../../constants/theme'
import { useSite } from "../../context/SiteContext"
import { useGames } from "../../context/GameContext"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"

const GameSection = ({ title, games, id }) => {
  const COLORS = useColors()
  const { setShowLogin, refreshSiteData, accountInfo } = useSite()
  const [preloadedImages, setPreloadedImages] = useState([])
  const [loadingForGames, setLoadingForGames] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [confirmPopup, setConfirmPopup] = useState({ show: false, game: null, error: null })
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [hoveredGame, setHoveredGame] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const popupParam = searchParams.get("show_all")
  const sectionId = id || title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")

  useEffect(() => {
    if (popupParam === sectionId) {
      setShowPopup(true)
    } else {
      setShowPopup(false)
    }
  }, [popupParam, sectionId])

  const openPopup = () => {
    setSearchParams((prev) => {
      prev.set("show_all", sectionId)
      return prev
    })
  }

  const closePopup = () => {
    setSearchParams((prev) => {
      prev.delete("show_all")
      return prev
    })
  }

  useEffect(() => {
    if (games && Array.isArray(games)) {
      const images = games.map((game) => game.icon)
      preloadImages(images)
    }
  }, [games])

  // Effect to simulate loading progress
  useEffect(() => {
    if (confirmLoading) {
      setLoadingProgress(0)
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev + Math.random() * 15
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      return () => clearInterval(interval)
    } else if (loadingProgress > 0) {
      setLoadingProgress(100)
      const timeout = setTimeout(() => {
        setLoadingProgress(0)
      }, 500)

      return () => clearTimeout(timeout)
    }
  }, [confirmLoading])

  const preloadImages = async (imageUrls) => {
    try {
      const promises = imageUrls.map(
        (imageUrl) =>
          new Promise((resolve, reject) => {
            const img = new Image()
            img.src = imageUrl
            img.onload = resolve
            img.onerror = reject
          }),
      )
      await Promise.all(promises)
      setPreloadedImages(imageUrls)
    } catch (error) {
      console.error("Error preloading images:", error)
    }
  }

  const handleGameClick = (game) => {
    const authSecretKey = localStorage.getItem("auth_secret_key")
    if (!authSecretKey) {
      setShowLogin(true)
      return
    }
    setConfirmPopup({ show: true, game, error: null })
  }

  const confirmGameOpen = async () => {
    const game = confirmPopup.game
    setLoadingForGames(game["Game UID"])
    setConfirmLoading(true)

    try {
      const response = await apiPost("route-play-games", {
        GAME_NAME: game["Game Name"],
        GAME_UID: game["Game UID"],
      });

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()

      if (showPopup) {
        closePopup()
      }

      if (data.status_code === "balance_error") {
        setConfirmPopup({
          show: true,
          game: game,
          error: "balance_error",
        })
      } else if (data.status_code === "authorization_error" || data.status_code === "auth_error") {
        setConfirmPopup({
          show: true,
          game: game,
          error: "authorization_error",
        })
      } else if (data.error || !data.data?.game_url) {
        console.error("Error launching game:", data.status_code || data.error || "No game URL")
        setConfirmPopup({
          show: true,
          game: game,
          error: data.status_code || "unknown_error",
        })
      } else if (data.data?.game_url) {
        setTimeout(() => {
          // Base64 encode the URL
          const encodedUrl = btoa(unescape(encodeURIComponent(data.data.game_url)));
          navigate(`/game-url/${encodeURIComponent(encodedUrl)}/${encodeURIComponent(game["Game Name"])}`)
        }, 500)
      }
    } catch (error) {
      console.error("Error logging game click:", error)
      setConfirmPopup({
        show: true,
        game: game,
        error: "network_error",
      })
    } finally {
      setTimeout(() => {
        setLoadingForGames(null)
        setConfirmLoading(false)
      }, 500)
    }
  }

  function handleAuthError() {
    setConfirmPopup({ show: false, game: null, error: null });
    localStorage.removeItem("auth_secret_key");
    localStorage.removeItem("account_id");
    refreshSiteData();
    navigate("/");
    setShowLogin(true);
  }

  return (
    <div
      id={sectionId}
      className="game-section relative w-full px-4 py-5 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-black/5 dark:border-white/5 scroll-mt-24 md:scroll-mt-32"
      style={{
        backgroundColor: `${COLORS.bg2}EE`,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-1.5 h-full opacity-70"
        style={{ background: COLORS.brandGradient }}
      ></div>

      <div className="flex justify-between items-center mb-4 md:mb-6 gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <div
            className="h-3 md:h-5 w-1 rounded-full flex-shrink-0"
            style={{ background: COLORS.brandGradient }}
          ></div>
          <h2
            className="text-[11px] xs:text-sm sm:text-base md:text-lg font-black text-black dark:text-white tracking-[0.05em] uppercase leading-none whitespace-nowrap truncate"
            style={{ fontFamily: FONTS.head }}
          >
            {title}
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-white/5 rounded-full p-1 backdrop-blur-sm border border-black/10 dark:border-white/10">
            <button
              className={`nav-button prev-${sectionId} w-9 h-9 flex items-center justify-center rounded-full text-black/70 dark:text-white/70 hover:text-black dark:text-white hover:bg-gray-100 dark:bg-white/10 transition-all duration-300`}
            >
              <FaChevronLeft size={14} />
            </button>
            <div className="w-[1px] h-4 bg-gray-100 dark:bg-white/10 mx-1"></div>
            <button
              className={`nav-button next-${sectionId} w-9 h-9 flex items-center justify-center rounded-full text-black/70 dark:text-white/70 hover:text-black dark:text-white hover:bg-gray-100 dark:bg-white/10 transition-all duration-300`}
            >
              <FaChevronRight size={14} />
            </button>
          </div>

          <button
            onClick={openPopup}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold uppercase transition-all duration-500 shadow-lg hover:shadow-brand/20 active:scale-95 group overflow-hidden relative flex-shrink-0"
            style={{
              background: COLORS.brandGradient,
              fontFamily: FONTS.ui,
              letterSpacing: "0.05em",
            }}
            aria-label="See All"
          >
            <div className="absolute inset-0 bg-gray-100 dark:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FaEye size={10} className="sm:size-[14px] group-hover:scale-110 transition-transform duration-300" />
            <span className="whitespace-nowrap">See All</span>
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={10}
        slidesPerView={3.5}
        navigation={{
          prevEl: `.prev-${sectionId}`,
          nextEl: `.next-${sectionId}`,
        }}
        breakpoints={{
          320: { slidesPerView: 3.2, spaceBetween: 8 },
          480: { slidesPerView: 3.5, spaceBetween: 10 },
          768: { slidesPerView: 4.5, spaceBetween: 10 },
          1024: { slidesPerView: 6, spaceBetween: 10 },
          1280: { slidesPerView: 8, spaceBetween: 10 },
        }}
      >
        {games && Array.isArray(games) && games.map((game, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative group"
              onMouseEnter={() => setHoveredGame(game["Game UID"])}
              onMouseLeave={() => setHoveredGame(null)}
            >
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-black/10 dark:border-white/10 transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <img
                  className={`w-full h-full object-cover cursor-pointer transition-all duration-500 ${loadingForGames === game["Game UID"] ? "opacity-50 blur-sm" : ""
                    }`}
                  src={game.icon || "/placeholder.svg"}
                  alt={game["Game Name"]}
                  onClick={() => handleGameClick(game)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2 sm:p-3 pointer-events-none">
                  <span className="text-black dark:text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate w-full" style={{ fontFamily: FONTS.head }}>
                    {game["Game Name"]}
                  </span>
                </div>
              </div>
              {hoveredGame === game["Game UID"] && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="rounded-full p-2.5 sm:p-5 transform scale-90 group-hover:scale-110 transition-transform duration-300 shadow-xl"
                    style={{ background: COLORS.brandGradient }}
                  >
                    <FaPlay className="text-black dark:text-white ml-0.5 block sm:hidden" size={12} />
                    <FaPlay className="text-black dark:text-white ml-1 hidden sm:block" size={24} />
                  </div>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {showPopup && createPortal(
        <div className="fixed inset-0 bg-black z-[99999] overflow-y-auto animate-fadeIn flex flex-col">
          <div
            className="fixed inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `radial-gradient(circle at 50% -20%, ${COLORS.brand}44, transparent 70%), radial-gradient(circle at 0% 100%, ${COLORS.brand}22, transparent 50%), radial-gradient(circle at 100% 100%, ${COLORS.brand}22, transparent 50%)`,
            }}
          ></div>

          <div className="relative flex flex-col min-h-full backdrop-blur-[50px]">
            <div
              className="sticky top-0 z-[100] w-full border-b border-black/5 dark:border-white/5 shadow-2xl"
              style={{ backgroundColor: `${COLORS.bg2}A0` }}
            >
              <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-6">
                  <button
                    onClick={closePopup}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-100 dark:bg-white/10 text-black dark:text-white rounded-xl px-4 py-2 transition-all duration-300 border border-black/10 dark:border-white/10 shadow-lg active:scale-95 group"
                    aria-label="Go Back"
                  >
                    <FaArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ fontFamily: FONTS.ui }}>Back</span>
                  </button>
                  <div className="h-8 w-1 rounded-full opacity-80" style={{ background: COLORS.brandGradient }}></div>
                  <div>
                    <h2
                      className="text-lg md:text-xl font-black text-black dark:text-white tracking-[0.1em] uppercase leading-tight"
                      style={{ fontFamily: FONTS.head }}
                    >
                      {title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
                      <span className="text-[8px] md:text-[9px] text-black/40 dark:text-white/40 font-bold uppercase tracking-[0.2em]">
                        Premium Collection
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full max-w-[1920px] mx-auto px-4 md:px-6 py-6">
              <div className="see-all-grid gap-3 md:gap-6 animate-fadeInUp">
                {games?.map((game, index) => (
                  <div key={index} className="flex flex-col group cursor-pointer" onClick={() => handleGameClick(game)}>
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden p-[1px] bg-gradient-to-br from-white/10 via-transparent to-white/5 transition-all duration-500 group-hover:from-brand/50 group-hover:to-brand/20 group-hover:shadow-[0_0_30px_rgba(230,160,0,0.4)] group-hover:-translate-y-1">
                      <div className="relative w-full h-full rounded-[11px] overflow-hidden bg-gray-100 dark:bg-white/5">
                        <img
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${loadingForGames === game["Game UID"] ? "opacity-30 blur-sm" : ""
                            }`}
                          src={game.icon || "/placeholder.svg"}
                          alt={game["Game Name"]}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/5 opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div
                            className="p-3 rounded-full shadow-2xl transform scale-50 group-hover:scale-100 transition-all duration-500 hover:scale-110"
                            style={{ background: COLORS.brandGradient }}
                          >
                            <FaPlay className="text-black dark:text-white ml-0.5" size={12} />
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          <div className="backdrop-blur-md bg-black/10 dark:bg-black/40 rounded-lg p-1.5 border border-black/10 dark:border-white/10 text-center shadow-xl">
                            <p className="text-[9px] font-black text-black/90 dark:text-white/90 truncate uppercase tracking-tighter">
                              {game["Game Name"]}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="py-12 flex flex-col items-center justify-center gap-4 opacity-10">
              <div className="h-px w-40 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.8em] text-black dark:text-white">
                Experience Excellence
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}

      {confirmPopup.show && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 dark:bg-black/40 backdrop-blur-2xl z-[100000] transition-all duration-500 animate-fadeIn">
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
                  <h3
                    className="text-xl font-black text-brand tracking-tight uppercase"
                    style={{ fontFamily: FONTS.head }}
                  >
                    Insufficient Balance
                  </h3>
                  <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed px-2">
                    A minimum deposit of <span className="text-black dark:text-white font-bold">₹100</span> is required to access this premium experience.
                  </p>
                </div>
              ) : confirmPopup.error === "authorization_error" ? (
                <div className="space-y-3">
                  <h3
                    className="text-xl font-black text-red-500 tracking-tight uppercase"
                    style={{ fontFamily: FONTS.head }}
                  >
                    Session Expired
                  </h3>
                  <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed px-2">
                    Your session has expired or you are not authorized to play this game. Please try logging in again.
                  </p>
                </div>
              ) : confirmPopup.error ? (
                <div className="space-y-3">
                  <h3
                    className="text-xl font-black text-red-500 tracking-tight uppercase"
                    style={{ fontFamily: FONTS.head }}
                  >
                    Game Unavailable
                  </h3>
                  <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed px-2">
                    This game is currently unavailable ({confirmPopup.error}). Please try another one.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3
                    className="text-xl font-black text-black dark:text-white tracking-tight uppercase"
                    style={{ fontFamily: FONTS.head }}
                  >
                    READY TO WIN?
                  </h3>
                  <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed px-2">
                    You are about to enter <span className="text-black dark:text-white font-bold">{confirmPopup.game?.["Game Name"]}</span>. Good luck!
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-8">
              {confirmPopup.error === "balance_error" ? (
                <button
                  onClick={() => {
                    setConfirmPopup({ show: false, game: null, error: null })
                  }}
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
                  onClick={() => {
                    setConfirmPopup({ show: false, game: null, error: null });
                  }}
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

      {confirmLoading && createPortal(
        <div className="fixed inset-0 bg-black/10 dark:bg-black/40 backdrop-blur-2xl z-[100000] flex flex-col items-center justify-center transition-all duration-700 animate-fadeIn">
          <div
            className="w-full max-w-md px-8 py-10 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-black/10 dark:border-white/10 relative overflow-hidden text-center"
            style={{
              backgroundColor: `${COLORS.bg2}F2`,
              backgroundImage: 'radial-gradient(circle at top right, rgba(230, 160, 0, 0.05), transparent 40%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>

            <div className="relative z-10 mb-8">
              {confirmPopup.game && (
                <div className="flex flex-col items-center">
                  <div className="relative mb-6 group">
                    <div className="absolute -inset-4 bg-brand/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-black/10 dark:border-white/10 shadow-2xl transform transition-transform duration-700 hover:scale-105">
                      <img
                        src={confirmPopup.game.icon || "/placeholder.svg"}
                        alt={confirmPopup.game["Game Name"]}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                  <h3
                    className="text-2xl font-black text-black dark:text-white mb-2 tracking-wider uppercase"
                    style={{ fontFamily: FONTS.head }}
                  >
                    {confirmPopup.game["Game Name"]}
                  </h3>
                  <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-[0.2em] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-brand shadow-[0_0_10px_rgba(230,160,0,1)]"></span>
                    Initializing Elite Experience
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 px-4 mb-10">
              <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1 overflow-hidden backdrop-blur-sm border border-black/5 dark:border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out relative"
                  style={{
                    width: `${loadingProgress}%`,
                    background: COLORS.brandGradient,
                    boxShadow: `0 0 20px ${COLORS.brand}80`
                  }}
                >
                  <div className="absolute top-0 right-0 w-8 h-full bg-gray-100 dark:bg-white/40 blur-sm animate-shimmer"></div>
                </div>
              </div>
              <div className="flex justify-between mt-3 px-1">
                <span className="text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-widest">Connection Status</span>
                <span className="text-[10px] text-brand font-black italic">{Math.round(loadingProgress)}%</span>
              </div>
            </div>

            <div className="relative z-10 space-y-4 px-2 mb-10 text-left">
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

          <div className="mt-8 flex items-center gap-4 opacity-30">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/50"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black dark:text-white">{accountInfo?.service_site_name || 'Site'} Elite</span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/50"></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

const CasinoLobby = () => {
  const { casino_lobby, casino, turbo } = useGames()

  const excludeProviders = [
    'MAC88', '18Peaches', 'Veliplay', 'aviatrix', 'InOut Minigames',
    'Galaxsys', 'Smartsoft', '2J', 'turbogamesasia', 'Aura Gaming', 'India Lotto'
  ];

  // Define specific games to include as fallback if they aren't tagged in DB yet
  const specificGames = ["aviator", "go rush", "mines", "trump card"]

  // If casino_lobby is empty (e.g. initial load or not migrated), use the manual filter as a smart fallback
  const allPossibleGames = (casino_lobby && casino_lobby.length > 0)
    ? casino_lobby
    : [...(casino || []), ...(turbo || [])].filter((game, index, self) => {
      const name = game["Game Name"]?.toLowerCase() || ""
      const isLobby = name.includes("lobby")
      const isSpecific = specificGames.some(sg => name.includes(sg))
      return (isLobby || isSpecific) && self.findIndex(g => g["Game UID"] === game["Game UID"]) === index
    })

  // Final filter by provider
  const displayGames = allPossibleGames.filter(game => {
    const provider = game["Game Provider"] || game["provider"];
    return !excludeProviders.includes(provider);
  });

  return (
    <div className="games-display space-y-6 overflow-hidden">
      {" "}
      <GameSection id="casino-lobby" title="🔴 Casino (Provider Lobby)" games={displayGames} />
    </div>
  )
}

export default CasinoLobby
