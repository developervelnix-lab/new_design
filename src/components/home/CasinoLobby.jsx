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

import GameSection from './GameSection';

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
