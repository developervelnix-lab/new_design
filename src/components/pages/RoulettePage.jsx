import React, { useEffect, useState } from "react"
import Navbar from "../navbar/Navbar"
import Footer from "../home/Footer"
import { useGames } from "../../context/GameContext"
import { useColors } from "../../hooks/useColors"
import { FONTS } from "../../constants/theme"
import GameSection from "../home/GameSection"

function RoulettePage() {
  const COLORS = useColors()
  const games = useGames()
  const loading = games.loading
  const [rouletteGames, setRouletteGames] = useState([])

  useEffect(() => {
    if (!loading) {
      // Flatten all categories into a single list to check for the flag
      const allGames = Object.values(games).filter(Array.isArray).flat()
      
      const filtered = allGames.filter((game) => 
        // 1. Check for manual flag from admin
        game.is_roulette === 1 || 
        // 2. Fallback: Check name for "roulette"
        game["Game Name"]?.toLowerCase().includes("roulette")
      )
      
      // Remove duplicates (by Game UID)
      const uniqueGames = Array.from(new Map(filtered.map(item => [item["Game UID"], item])).values())
      setRouletteGames(uniqueGames)
    }
  }, [games, loading])

  return (
    <div className="flex flex-col min-h-screen relative" style={{ backgroundColor: COLORS.bg }}>
      <Navbar />

      <main className="flex-grow">
        {/* Premium Header Section */}
        <div className="relative py-12 md:py-20 overflow-hidden mb-8">
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              background: `radial-gradient(circle at 20% 50%, ${COLORS.brand}44 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${COLORS.brand}44 0%, transparent 50%)` 
            }}
          />
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
            <h1 
              className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase italic"
              style={{ 
                fontFamily: FONTS.black,
                color: COLORS.text,
                textShadow: `0 0 20px ${COLORS.brand}44`
              }}
            >
              Exclusive <span style={{ color: COLORS.brand }}>Roulette</span>
            </h1>
            <p className="text-white/40 max-w-2xl mx-auto text-sm md:text-base font-medium">
              Join the wheel of fortune! Discover our top-tier collection of Roulette games, 
              hand-picked for the ultimate gaming experience.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
              <p className="text-white/40 font-black uppercase tracking-widest text-xs">Loading Games...</p>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <GameSection 
                title="🎰 Roulette Games" 
                games={rouletteGames} 
                id="roulette-collection"
                layout="grid"
              />
              
              {rouletteGames.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                  <p className="text-white/20 text-lg font-medium">No roulette games found.</p>
                  <p className="text-white/10 text-sm">Add games from the admin panel to see them here!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default RoulettePage
