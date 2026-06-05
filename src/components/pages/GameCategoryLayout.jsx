import React from "react";
import RanaHeader from "../home/ranamatch/RanaHeader";
import RanaFooter from "../home/ranamatch/RanaFooter";
import GameSection from "../home/GameSection";
import "../../assets/css/ranamatch.css";

function GameCategoryLayout({
  title,
  icon,
  games = [],
  loading,
  sectionId,
  description = "Browse a curated lobby of live tables, instant launches, and premium game picks.",
  eyebrow = "Premium Game Lobby",
}) {
  const gameList = Array.isArray(games) ? games : [];
  const providerCount = new Set(
    gameList
      .map((game) => game["Game Provider"] || game.provider)
      .filter(Boolean)
  ).size;

  return (
    <div className="rana-layout category-route flex flex-col min-h-screen relative">
      <RanaHeader />

      <main className="category-page-main flex-grow">
        <section className="category-hero">
          <div className="category-hero-copy">
            <span className="category-eyebrow">{eyebrow}</span>
            <h1>
              <span className="category-hero-icon">{icon}</span>
              {title}
              <small>Games</small>
            </h1>
            <p>{description}</p>
          </div>

          <div className="category-hero-stats" aria-label={`${title} lobby summary`}>
            <div>
              <strong>{loading ? "--" : gameList.length}</strong>
              <span>Games</span>
            </div>
            <div>
              <strong>{loading ? "--" : Math.max(providerCount, 1)}</strong>
              <span>Providers</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Access</span>
            </div>
          </div>
        </section>

        <section className="category-content-panel">
          {loading ? (
            <div className="category-loading">
              <i />
              <strong>Loading games</strong>
              <span>Preparing the {title.toLowerCase()} lobby...</span>
            </div>
          ) : (
            <>
              <GameSection
                title={`${icon} ${title} Games`}
                games={gameList}
                id={sectionId}
                layout="grid"
                hideHeader
              />

              {gameList.length === 0 && (
                <div className="category-empty">
                  <strong>No {title.toLowerCase()} games found</strong>
                  <span>Games added from the admin panel will appear here.</span>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <RanaFooter />
    </div>
  );
}

export default GameCategoryLayout;
