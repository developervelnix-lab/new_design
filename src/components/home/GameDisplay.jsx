"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import { FaChevronLeft, FaChevronRight, FaEye, FaArrowLeft, FaPlay } from "react-icons/fa"
import { apiPost } from "@/utils/apiFetch"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useColors } from '../../hooks/useColors'
import { FONTS } from '../../constants/theme'
import { useSite } from "../../context/SiteContext"
import { useGames } from "../../context/GameContext"

import GameSection from "./GameSection"

const GamesDisplay = ({ section }) => {
  const { slots, casino, fishing, poker } = useGames();

  // Filter out lobby games from the general casino section
  const filteredCasino = casino?.filter(game => 
    !game["Game Name"]?.toLowerCase().includes("lobby")
  ) || []

  if (section === "trending-games") {
    return <GameSection id="trending-games" title="🔥 Trending Games" games={filteredCasino} />
  }

  if (section === "slots") {
    return <GameSection id="slots" title="🎮 Trending Slot" games={slots} />
  }

  if (section === "fishing") {
    return <GameSection id="fishing" title="🐟 Fishing" games={fishing} />
  }

  if (section === "poker") {
    return <GameSection id="poker" title="♤ Indian Poker Games" games={poker} />
  }

  if (section === "fantasy") {
    return <GameSection id="fantasy-games" title="🏆 Fantasy Games" games={poker} />
  }

  // Default: return all in the new requested order if no section specified
  return (
    <div className="games-display space-y-3">
      {" "}
      <GameSection id="trending-games" title="🔥 Trending Games" games={filteredCasino} />
      <GameSection id="slots" title="🎮 Trending Slot" games={slots} />
      <GameSection id="poker" title="♤ Indian Poker Games" games={poker} />
      <GameSection id="fishing" title="🐟 Fishing" games={fishing} />
    </div>
  )
}

export default GamesDisplay
