import React, { useEffect, useState } from "react";
import { useGames } from "../../context/GameContext";
import GameCategoryLayout from "./GameCategoryLayout";

function CrashGamesPage() {
  const games = useGames();
  const loading = games.loading;
  const [crashGames, setCrashGames] = useState([]);

  useEffect(() => {
    if (!loading) {
      const allGames = Object.values(games).filter(Array.isArray).flat();

      const filtered = allGames.filter((game) => {
        const provider = (game["Game Provider"] || game.provider || "").toLowerCase();
        const gameName = (game["Game Name"] || "").toLowerCase();

        const matchesProvider =
          provider === "aviatrix" ||
          provider === "galaxsys" ||
          provider === "aura gaming" ||
          provider === "veliplay";

        const matchesName =
          gameName.includes("crash") ||
          gameName.includes("aviator") ||
          gameName.includes("spaceman") ||
          gameName.includes("jetx") ||
          gameName.includes("aviatrix") ||
          gameName.includes("zeppelin");

        return matchesProvider || matchesName;
      });

      setCrashGames(Array.from(new Map(filtered.map((item) => [item["Game UID"], item])).values()));
    }
  }, [games, loading]);

  return (
    <GameCategoryLayout
      title="Crash"
      icon="🚀"
      games={crashGames}
      loading={loading}
      sectionId="crash-collection"
      description="Fast rounds, rising multipliers, and instant-play crash titles collected in one sharp lobby."
    />
  );
}

export default CrashGamesPage;
