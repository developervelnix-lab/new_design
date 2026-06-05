import React, { useEffect, useState } from "react";
import { useGames } from "../../context/GameContext";
import GameCategoryLayout from "./GameCategoryLayout";

function LotteryPage() {
  const games = useGames();
  const loading = games.loading;
  const [lotteryGames, setLotteryGames] = useState([]);

  useEffect(() => {
    if (!loading) {
      const allGames = Object.values(games).filter(Array.isArray).flat();

      const filtered = allGames.filter((game) => {
        const provider = (game["Game Provider"] || game.provider || "").toLowerCase();
        const gameName = (game["Game Name"] || "").toLowerCase();
        const type = (game.type || game["Game Type"] || "").toLowerCase();
        const category = (game.category || game["Game Category"] || "").toLowerCase();
        const group = (game.group || game["Game Group"] || "").toLowerCase();
        const combined = `${provider} ${gameName} ${type} ${category} ${group}`;

        return (
          game.is_lottery === 1 ||
          game.is_lottery === "1" ||
          provider === "india lotto" ||
          provider === "indialotto" ||
          combined.includes("lotto") ||
          combined.includes("lottery") ||
          combined.includes("number game")
        );
      });

      setLotteryGames(Array.from(new Map(filtered.map((item) => [item["Game UID"], item])).values()));
    }
  }, [games, loading]);

  return (
    <GameCategoryLayout
      title="Lottery"
      icon="🎟️"
      games={lotteryGames}
      loading={loading}
      sectionId="lottery-collection"
      description="Lottery and number games arranged in a simple lobby with quick access and clear browsing."
    />
  );
}

export default LotteryPage;
