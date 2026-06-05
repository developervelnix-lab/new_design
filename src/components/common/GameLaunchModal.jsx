import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaPlay } from 'react-icons/fa';
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { useNavigate } from 'react-router-dom';
import { URL as BASE_URL, API_URL } from "../../utils/constants";
import { useSite } from '../../context/SiteContext';

export default function GameLaunchModal({ show, game, error, onClose }) {
  const COLORS = useColors();
  const navigate = useNavigate();
  const { setShowLogin, refreshSiteData } = useSite();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [localError, setLocalError] = useState(error);

  const authSecretKey = localStorage.getItem("auth_secret_key");
  const userId = localStorage.getItem("account_id");

  const handleAuthError = () => {
    onClose();
    localStorage.removeItem("auth_secret_key");
    localStorage.removeItem("account_id");
    refreshSiteData();
    navigate("/");
    setShowLogin(true);
  };

  const confirmGameOpen = async () => {
    if (!game) return;
    setConfirmLoading(true);
    setLoadingProgress(0);

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const response = await fetch(`${API_URL}?Route=route-play-games&AuthToken=${encodeURIComponent(authSecretKey)}&USER_ID=${encodeURIComponent(userId)}`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Route: "route-play-games",
          AuthToken: authSecretKey,
        },
        body: JSON.stringify({
          USER_ID: userId,
          GAME_NAME: game["Game Name"],
          GAME_UID: game["Game UID"],
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setLoadingProgress(100);
      clearInterval(progressInterval);

      if (data.status_code === "success" && data.data?.game_url) {
        setTimeout(() => {
          const encodedUrl = btoa(unescape(encodeURIComponent(data.data.game_url)));
          navigate(`/game-url/${encodeURIComponent(encodedUrl)}/${encodeURIComponent(game["Game Name"])}`);
        }, 500);
      } else if (data.status_code === "balance_error") {
        setLocalError("balance_error");
        setConfirmLoading(false);
      } else if (data.status_code === "authorization_error" || data.status_code === "auth_error") {
        setLocalError("authorization_error");
        setConfirmLoading(false);
      } else {
        setLocalError(data.status_code || "unknown_error");
        setConfirmLoading(false);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setLocalError("network_error");
      setConfirmLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      {createPortal(
        <div className="game-launch-overlay">
          <div className="game-launch-card animate-fadeInUp">
            <div className="game-launch-play">
              <FaPlay />
            </div>

            <div>
              {localError === "balance_error" ? (
                <>
                  <h3 className="game-launch-title" style={{ fontFamily: FONTS.head }}>
                    Insufficient Balance
                  </h3>
                  <p className="game-launch-copy">
                    A minimum deposit of <span className="text-black dark:text-white font-bold">â‚¹100</span> is required to access this premium experience.
                  </p>
                </>
              ) : localError === "authorization_error" ? (
                <>
                  <h3 className="game-launch-title" style={{ fontFamily: FONTS.head }}>
                    Session Expired
                  </h3>
                  <p className="game-launch-copy">
                    Your session has expired or you are not authorized to play this game. Please try logging in again.
                  </p>
                </>
              ) : localError ? (
                <>
                  <h3 className="game-launch-title" style={{ fontFamily: FONTS.head }}>
                    Game Unavailable
                  </h3>
                  <p className="game-launch-copy">
                    This game is currently unavailable ({localError}). Please try another one.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="game-launch-title" style={{ fontFamily: FONTS.head }}>
                    READY TO WIN?
                  </h3>
                  <p className="game-launch-copy">
                    You are about to enter <strong>{game?.["Game Name"]}</strong>. Good luck!
                  </p>
                </>
              )}
            </div>

            <div className="game-launch-actions">
              {localError === "balance_error" ? (
                <button
                  onClick={() => { onClose(); }}
                  className="game-launch-primary"
                  style={{ fontFamily: FONTS.ui }}
                >
                  <span>Add Funds</span>
                </button>
              ) : localError === "authorization_error" ? (
                <button
                  onClick={handleAuthError}
                  className="game-launch-primary"
                  style={{ fontFamily: FONTS.ui }}
                >
                  <span>Log In Again</span>
                </button>
              ) : localError ? (
                <button
                  onClick={() => { onClose(); }}
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
                onClick={onClose}
                className="game-launch-secondary"
                style={{ fontFamily: FONTS.ui }}
              >
                {localError === "balance_error" ? "Close" : "Cancel"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {confirmLoading && createPortal(
        <div className="game-launch-overlay">
          <div className="game-loading-card">
            <div>
              {game && (
                <>
                  <div className="game-loading-icon">
                    <img src={game.icon || "/placeholder.svg"} alt={game["Game Name"]} />
                  </div>
                  <h3
                    className="game-loading-title"
                    style={{ fontFamily: FONTS.head }}
                  >
                    {game["Game Name"]}
                  </h3>
                  <div className="game-loading-status">
                    <i></i>
                    Initializing Elite Experience
                  </div>
                </>
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
                <div key={i} className={`game-loading-step ${loadingProgress > step.threshold ? "done" : ""}`}>
                  <span style={{ fontFamily: FONTS.ui }}>
                    {step.label}
                  </span>
                  <div className="game-loading-dot">
                    {loadingProgress > step.threshold ? "✓" : ""}
                  </div>
                </div>
              ))}
            </div>

            <div className="game-loading-tip">
              <strong>Pro Tip</strong>
              <p>Enable high performance mode in settings for the smoothest gameplay experience.</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

