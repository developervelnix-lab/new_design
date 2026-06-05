import React, { useEffect, useState } from "react"
import { useGames } from "../../context/GameContext"
import GameCategoryLayout from "./GameCategoryLayout"

/**
 * CategoryGamesPage
 * Generic page for listing games filtered by category.
 *
 * Props:
 *  - title       {string}   Display title, e.g. "Blackjack"
 *  - icon        {string}   Emoji icon, e.g. "🃏"
 *  - sectionId   {string}   Unique DOM id for the game section
 *  - filterFn    {Function} (game) => boolean — returns true if game belongs here
 */
function CategoryGamesPage({ title, icon, sectionId, filterFn }) {
  const games = useGames()
  const loading = games.loading
  const [categoryGames, setCategoryGames] = useState([])

  useEffect(() => {
    if (!loading) {
      const allGames = Object.values(games).filter(Array.isArray).flat()
      const filtered = allGames.filter(filterFn)
      // Deduplicate by Game UID
      const unique = Array.from(
        new Map(filtered.map((item) => [item["Game UID"], item])).values()
      )
      setCategoryGames(unique)
    }
    // sectionId is a unique stable key per category route.
    // Adding it here ensures this effect re-runs when the user navigates
    // between category pages (React reuses the component instance since
    // all routes use CategoryGamesPage, so only props change, not the mount).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games, loading, sectionId])

  return (
    <GameCategoryLayout
      title={title}
      icon={icon}
      games={categoryGames}
      loading={loading}
      sectionId={sectionId}
      description={`Explore ${title.toLowerCase()} tables and instant-play picks in one clean lobby.`}
    />
  )
}

export default CategoryGamesPage
