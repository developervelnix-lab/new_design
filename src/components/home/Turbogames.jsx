"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { FaChevronLeft, FaChevronRight, FaEye, FaArrowLeft, FaPlay } from "react-icons/fa"
import { useNavigate, useSearchParams } from "react-router-dom"
import { apiPost } from "@/utils/apiFetch"
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { useSite } from "../../context/SiteContext"
import { useGames } from "../../context/GameContext"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"

import GameSection from './GameSection';

const Turbogames = () => {
  const { turbo } = useGames();

  const excludeProviders = [
    'MAC88', '18Peaches', 'Veliplay', 'aviatrix', 'InOut Minigames',
    'Galaxsys', 'Smartsoft', '2J', 'turbogamesasia', 'Aura Gaming', 'India Lotto'
  ];

  const filteredTurbo = turbo?.filter(game => {
    const provider = game["Game Provider"] || game["provider"];
    return !excludeProviders.includes(provider);
  }) || [];

  return (
    <div className="games-display space-y-3 mt-3">
      {" "}
      <GameSection id="turbo" title="🚀 Turbo Games" games={filteredTurbo} />
    </div>
  )
}

export default Turbogames
