"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import { FaChevronLeft, FaChevronRight, FaArrowLeft, FaPlay, FaSearch, FaTimes } from "react-icons/fa"
import { apiPost } from "@/utils/apiFetch"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useColors } from '../../hooks/useColors'
import { FONTS } from '../../constants/theme'
import { useSite } from "../../context/SiteContext"
import { URL } from "../../utils/constants"
import { useGames } from "../../context/GameContext"

const GameSection = ({ title, games, id, layout = "slider", hideHeader = false }) => {
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
  const [popupSearch, setPopupSearch] = useState("")

  const popupParam = searchParams.get("show_all")
  const sectionId = id || (title ? title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") : "section")
  const gameList = Array.isArray(games) ? games : []
  const filteredPopupGames = gameList.filter((game) =>
    (game?.["Game Name"] || "").toLowerCase().includes(popupSearch.trim().toLowerCase())
  )

  useEffect(() => {
    if (popupParam === sectionId) {
      setShowPopup(true)
    } else {
      setShowPopup(false)
      setPopupSearch("")
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
            if (!imageUrl) return resolve();
            const img = new Image()
            // Ensure URL is absolute if it's a relative path from the API
            const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${URL}${imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl}`;
            img.src = fullUrl
            img.onload = resolve
            img.onerror = reject
          }),
      )
      await Promise.all(promises)
      setPreloadedImages(imageUrls)
    } catch (error) {
      // Preload error - images will load normally via browser when rendered
    }
  }

  const handleGameClick = (game) => {
    const authSecretKey = localStorage.getItem("auth_secret_key")
    if (!authSecretKey) {
      setShowLogin(true)
      return
    }
    // Update hash without scrolling yet, so it's in the history
    window.history.replaceState(null, null, `#${sectionId}`);
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
          // Base64 encode the URL to prevent issues with slashes and special characters in the route
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
      className="game-section relative w-full py-4 md:py-6 scroll-mt-24 md:scroll-mt-32"
    >
      {!hideHeader && (
        <div className="flex justify-between items-center gap-3 mb-4 md:mb-5 px-1 md:px-2">
          <h2 className="section-banner max-w-full" style={{ fontFamily: FONTS.head }}>
            <span>{title}</span>
          </h2>
          {layout !== "grid" && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center gap-1">
                <button
                  className={`nav-button prev-${sectionId} header-icon-btn !rounded-full !w-8 !h-8 flex items-center justify-center hover:scale-110 transition-all duration-300`}
                >
                  <FaChevronLeft size={12} />
                </button>
                <button
                  className={`nav-button next-${sectionId} header-icon-btn !rounded-full !w-8 !h-8 flex items-center justify-center hover:scale-110 transition-all duration-300`}
                >
                  <FaChevronRight size={12} />
                </button>
              </div>

              <button
                onClick={openPopup}
                className="see-all"
                aria-label="See All"
              >
                See All
              </button>
            </div>
          )}
        </div>
      )}

      {layout === "grid" ? (
        <div className="see-all-grid gap-3 md:gap-6 animate-fadeInUp">
          {games && Array.isArray(games) && games.map((game, index) => (
            <div
              key={index}
              className="flex flex-col group cursor-pointer"
              onClick={() => handleGameClick(game)}
              onMouseEnter={() => setHoveredGame(game["Game UID"])}
              onMouseLeave={() => setHoveredGame(null)}
            >
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden p-[1px] bg-gradient-to-br from-white/10 via-transparent to-white/5 transition-all duration-500 group-hover:from-brand/50 group-hover:to-brand/20 group-hover:shadow-[0_0_30px_rgba(29,78,216,0.4)] group-hover:-translate-y-1">
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
      ) : (
        <Swiper
          modules={[Navigation]}
          spaceBetween={10}
          slidesPerView={3.5}
          loop={games && games.length > 0}
          navigation={{
            prevEl: `.prev-${sectionId}`,
            nextEl: `.next-${sectionId}`,
          }}
          breakpoints={{
            320: { slidesPerView: 4.15, spaceBetween: 8 },
            480: { slidesPerView: 4.8, spaceBetween: 9 },
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
                <div className="relative aspect-[4/5] rounded-[14px] overflow-hidden bg-black/5 dark:bg-white/5 border border-transparent group-hover:border-brand/30 transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_15px_30px_-10px_rgba(29,78,216,0.3)]">
                  <img
                    className={`w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-110 ${loadingForGames === game["Game UID"] ? "opacity-50 blur-sm" : ""
                      }`}
                    src={game.icon || "/placeholder.svg"}
                    alt={game["Game Name"]}
                    onClick={() => handleGameClick(game)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2 sm:p-3 pointer-events-none">
                    <span className="text-black dark:text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate w-full" style={{ fontFamily: FONTS.ui }}>
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
      )}

      {showPopup &&
        createPortal(
          <div className="see-all-overlay">
            <div className="see-all-panel">
              <header className="see-all-topbar">
                <button onClick={closePopup} className="see-all-back" aria-label="Back to home">
                  <FaArrowLeft />
                  <span>Back</span>
                </button>

                <div className="see-all-title-block">
                  <span className="see-all-kicker">Premium Game Lobby</span>
                  <h2 style={{ fontFamily: FONTS.head }}>{title}</h2>
                </div>

                <div className="see-all-searchbox">
                  <FaSearch />
                  <input
                    value={popupSearch}
                    onChange={(event) => setPopupSearch(event.target.value)}
                    placeholder="Search games..."
                    aria-label="Search games"
                  />
                  {popupSearch && (
                    <button type="button" onClick={() => setPopupSearch("")} aria-label="Clear search">
                      <FaTimes />
                    </button>
                  )}
                </div>

                <div className="see-all-count">
                  <strong>{filteredPopupGames.length}</strong>
                  <span>Games</span>
                </div>
              </header>

              <main className="see-all-content">
                {filteredPopupGames.length > 0 ? (
                  <div className="see-all-lobby-grid">
                    {filteredPopupGames.map((game, index) => (
                      <button
                        key={`${game["Game UID"] || game["Game Name"]}-${index}`}
                        type="button"
                        className="see-all-lobby-card"
                        onClick={() => handleGameClick(game)}
                      >
                        <span className="see-all-card-image">
                          <img
                            src={game.icon || "/placeholder.svg"}
                            alt={game["Game Name"]}
                            className={loadingForGames === game["Game UID"] ? "is-loading" : ""}
                          />
                          <span className="see-all-card-play">
                            <FaPlay />
                          </span>
                        </span>
                        <span className="see-all-card-info">
                          <strong>{game["Game Name"]}</strong>
                          <small>Tap to play</small>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="see-all-empty">
                    <strong>No games found</strong>
                    <span>Try a different search term.</span>
                  </div>
                )}
              </main>
            </div>
          </div>,
          document.body,
        )}

      {confirmPopup.show && createPortal(
        <div className="game-launch-overlay">
          <div className="game-launch-card animate-fadeInUp">
            <div className="game-launch-play">
              <FaPlay />
            </div>

            <div>
              {confirmPopup.error === "balance_error" ? (
                <div className="space-y-3">
                  <h3 className="game-launch-title" style={{ fontFamily: FONTS.head }}>
                    Insufficient Balance
                  </h3>
                  <p className="game-launch-copy">
                    A minimum deposit of <span className="text-black dark:text-white font-bold">â‚¹100</span> is required to access this premium experience.
                  </p>
                </div>
              ) : confirmPopup.error === "authorization_error" ? (
                <div className="space-y-3">
                  <h3 className="game-launch-title" style={{ fontFamily: FONTS.head }}>
                    Session Expired
                  </h3>
                  <p className="game-launch-copy">
                    Your session has expired or you are not authorized to play this game. Please try logging in again.
                  </p>
                </div>
              ) : confirmPopup.error ? (
                <div className="space-y-3">
                  <h3 className="game-launch-title" style={{ fontFamily: FONTS.head }}>
                    Game Unavailable
                  </h3>
                  <p className="game-launch-copy">
                    This game is currently unavailable ({confirmPopup.error}). Please try another one.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="game-launch-title" style={{ fontFamily: FONTS.head }}>
                    READY TO WIN?
                  </h3>
                  <p className="game-launch-copy">
                    You are about to enter <span className="text-black dark:text-white font-bold">{confirmPopup.game?.["Game Name"]}</span>. Good luck!
                  </p>
                </div>
              )}
            </div>

            <div className="game-launch-actions">
              {confirmPopup.error === "balance_error" ? (
                <button
                  onClick={() => {
                    setConfirmPopup({ show: false, game: null, error: null })
                  }}
                  className="game-launch-primary"
                  style={{ fontFamily: FONTS.ui }}
                >
                  <span>Add Funds</span>
                </button>
              ) : confirmPopup.error === "authorization_error" ? (
                <button
                  onClick={handleAuthError}
                  className="game-launch-primary"
                  style={{ fontFamily: FONTS.ui }}
                >
                  <span>Log In Again</span>
                </button>
              ) : confirmPopup.error ? (
                <button
                  onClick={() => {
                    setConfirmPopup({ show: false, game: null, error: null });
                  }}
                  className="game-launch-primary"
                  style={{ fontFamily: FONTS.ui }}
                >
                  <span>Try Other Game</span>
                </button>
              ) : (
                <button
                  onClick={confirmGameOpen}
                  className="game-launch-primary"
                  style={{ fontFamily: FONTS.ui }}
                >
                  <span>Confirm Play</span>
                </button>
              )}

              <button
                onClick={() => setConfirmPopup({ show: false, game: null, error: null })}
                className="game-launch-secondary"
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
        <div className="game-launch-overlay">
          <div
            className="game-loading-card"
            style={{
              backgroundColor: `${COLORS.bg2}F2`,
              backgroundImage: 'radial-gradient(circle at top right, rgba(230, 160, 0, 0.05), transparent 40%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>

            <div>
              {confirmPopup.game && (
                <div>
                  <div className="game-loading-icon">
                    <div>
                      <img
                        src={confirmPopup.game.icon || "/placeholder.svg"}
                        alt={confirmPopup.game["Game Name"]}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h3
                    className="game-loading-title"
                    style={{ fontFamily: FONTS.head }}
                  >
                    {confirmPopup.game["Game Name"]}
                  </h3>
                  <div className="game-loading-status">
                    <i></i>
                    Initializing Elite Experience
                  </div>
                </div>
              )}
            </div>

            <div className="game-loading-progress">
              <div className="game-loading-bar">
                <div
                  className="game-loading-fill"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <div className="game-loading-meta">
                <span>Connection Status</span>
                <strong>{Math.round(loadingProgress)}%</strong>
              </div>
            </div>

            <div className="game-loading-steps">
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
                    ? "border-brand/40 bg-brand/10 text-brand scale-110 shadow-[0_0_15px_rgba(29,78,216,0.2)]"
                    : "border-black/5 dark:border-white/5 bg-gray-100 dark:bg-white/2"
                    }`}>
                    {loadingProgress > step.threshold ? (
                      <span className="text-[10px] font-bold">âœ“</span>
                    ) : (
                      <div className="w-1 h-1 bg-gray-100 dark:bg-white/10 rounded-full animate-ping"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="game-loading-tip">
              <strong>Pro Tip</strong>
              <p>Enable high performance mode in settings for the smoothest gameplay experience.</p>
            </div>
          </div>

          <div className="hidden">
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

export default GameSection;

