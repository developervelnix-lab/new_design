import React, { useEffect, useState } from "react";
import { useGames } from "../../context/GameContext";
import GameCategoryLayout from "./GameCategoryLayout";

function RoulettePage() {
  const games = useGames();
  const loading = games.loading;
  const [rouletteGames, setRouletteGames] = useState([]);

  useEffect(() => {
    if (!loading) {
      const allGames = Object.values(games).filter(Array.isArray).flat();
      const filtered = allGames.filter((game) =>
        game.is_roulette === 1 ||
        game["Game Name"]?.toLowerCase().includes("roulette")
      );

      setRouletteGames(Array.from(new Map(filtered.map((item) => [item["Game UID"], item])).values()));
    }
  }, [games, loading]);

  return (
    <GameCategoryLayout
      title="Roulette"
      icon="🎡"
      games={rouletteGames}
      loading={loading}
      sectionId="roulette-collection"
      description="Premium roulette tables, live wheel games, and quick casino picks with a cleaner lobby view."
    />
  );
}

export default RoulettePage;
