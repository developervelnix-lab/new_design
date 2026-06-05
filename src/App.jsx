/*
  Author: DevKilla
  Buy Code From: jinkteam.com
  Contact: @devkilla (Telegram)
*/

import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import Home from './components/home/Home';
import GameplayComponent from './components/GamePlayComponent';
import Transaction from './components/pages/Transaction';
import ProfitLossPage from './components/pages/ProfitLossPage';
import OpenBetPage from './components/pages/OpenBetPage';
import ChangePasswordPage from './components/pages/ChangePasswordPage';
import RulesAndRegulationPage from './components/pages/RulesAndRegulationPage';
import ExclusionPolicyPage from './components/pages/ExclusionPolicyPage';
import ResponsibleGamblingPage from './components/pages/ResponsibleGamblingPage';
import PrivacyPolicy from './components/sidebar-components/legal-complience/PrivacyPolicy';
import DepositPage from './components/pages/DepositPage';
import WithdrawPage from './components/pages/WithdrawPage';
import GifrCardPage from './components/pages/GifrCardPage';
import PromotionPage from './components/pages/PromotionPage';
import InviteAndEarnPage from './components/pages/InviteAndEarnPage';
import SupportPage from './components/pages/SupportPage';
import BonusDetailsPage from './components/pages/BonusDetailsPage';
import ActiveBonusPage from './components/pages/ActiveBonusPage';
import BonusPage from './components/pages/BonusPage';
import NotificationsPage from './components/pages/NotificationsPage';
import RoulettePage from './components/pages/RoulettePage';
import LotteryPage from './components/pages/LotteryPage';
import CrashGamesPage from './components/pages/CrashGamesPage';
import CasinoPage from './components/pages/CasinoPage';
import CategoryGamesPage from './components/pages/CategoryGamesPage';
import NotFound from './components/pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ThemeSynchronizer from './constants/ThemeSynchronizer';
import { useEffect } from 'react';
import { useSite, SiteProvider } from './context/SiteContext';
import { GameProvider } from './context/GameContext';
import { URL as BASE_URL } from './utils/constants';
import BroadcastModal from './components/common/BroadcastModal';
import MobileFooterNav from './components/navbar/MobileFooterNav';

const RootLayout = () => {
  const location = useLocation();
  const excludedPaths = ['/', '/withdraw', '/deposit', '/transaction', '/betting-profit-loss'];
  const showFooterNav = !excludedPaths.includes(location.pathname) && !location.pathname.startsWith('/game');

  return (
    <>
      <ScrollRestoration />
      <BroadcastModal />
      <Outlet />
      {showFooterNav && <MobileFooterNav />}
    </>
  );
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/withdraw",
        element: (
          <ProtectedRoute>
            <WithdrawPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/bonus-details/:id",
        element: <BonusDetailsPage />,
      },
      {
        path: "/bonus-details",
        element: <BonusDetailsPage />,
      },
      {
        path: "/deposit",
        element: (
          <ProtectedRoute>
            <DepositPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/game/:gameName",
        element: (
          <ProtectedRoute>
            <GameplayComponent />
          </ProtectedRoute>
        ),
      },
      {
        path: "/game-url/:gameUrl/:gameName",
        element: (
          <ProtectedRoute>
            <GameplayComponent />
          </ProtectedRoute>
        ),
      },
      {
        path: "/transaction",
        element: (
          <ProtectedRoute>
            <Transaction />
          </ProtectedRoute>
        ),
      },
      {
        path: "/betting-profit-loss",
        element: (
          <ProtectedRoute>
            <ProfitLossPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/change-password",
        element: (
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/openbet",
        element: (
          <ProtectedRoute>
            <OpenBetPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/rules-regulation",
        element: <RulesAndRegulationPage />,
      },
      {
        path: "/exclusion",
        element: <ExclusionPolicyPage />,
      },
      {
        path: "/responsible-gambling",
        element: <ResponsibleGamblingPage />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/gifrcardreedom",
        element: (
          <ProtectedRoute>
            <GifrCardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/promotion",
        element: <PromotionPage />,
      },
      {
        path: "/bonus",
        element: <BonusPage />,
      },
      {
        path: "/active-bonus",
        element: (
          <ProtectedRoute>
            <ActiveBonusPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/inviteandearn",
        element: (
          <ProtectedRoute>
            <InviteAndEarnPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/support",
        element: <SupportPage />,
      },
      {
        path: "/notifications",
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/roulette",
        element: <RoulettePage />,
      },
      {
        path: "/lottery",
        element: <LotteryPage />,
      },
      {
        path: "/crash-games",
        element: <CrashGamesPage />,
      },
      {
        path: "/casino",
        element: <CasinoPage />,
      },
      {
        path: "/blackjack",
        element: <CategoryGamesPage
          title="Blackjack"
          icon="🃏"
          sectionId="blackjack-collection"
          filterFn={(g) => {
            const n = (g["Game Name"] || "").toLowerCase();
            const t = (g.type || "").toLowerCase();
            return n.includes("blackjack") || t.includes("blackjack");
          }}
        />,
      },
      {
        path: "/baccarat",
        element: <CategoryGamesPage
          title="Baccarat"
          icon="💎"
          sectionId="baccarat-collection"
          filterFn={(g) => {
            const n = (g["Game Name"] || "").toLowerCase();
            const t = (g.type || "").toLowerCase();
            return n.includes("baccarat") || t.includes("baccarat");
          }}
        />,
      },
      {
        path: "/dragon-tiger",
        element: <CategoryGamesPage
          title="Dragon Tiger"
          icon="🐯"
          sectionId="dragon-tiger-collection"
          filterFn={(g) => {
            const n = (g["Game Name"] || "").toLowerCase();
            const t = (g.type || "").toLowerCase();
            const c = n + " " + t;
            return c.includes("dragon") && c.includes("tiger");
          }}
        />,
      },
      {
        path: "/teen-patti",
        element: <CategoryGamesPage
          title="Teen Patti"
          icon="🎴"
          sectionId="teen-patti-collection"
          filterFn={(g) => {
            const n = (g["Game Name"] || "").toLowerCase();
            const t = (g.type || "").toLowerCase();
            const c = n + " " + t;
            return c.includes("teen patti") || c.includes("teenpatti");
          }}
        />,
      },
      {
        path: "/poker",
        element: <CategoryGamesPage
          title="Poker"
          icon="♠️"
          sectionId="poker-collection"
          filterFn={(g) => {
            const n = (g["Game Name"] || "").toLowerCase();
            const t = (g.type || "").toLowerCase();
            const c = n + " " + t;
            return c.includes("poker") || c.includes("holdem") || c.includes("hold em");
          }}
        />,
      },
      {
        path: "/game-shows",
        element: <CategoryGamesPage
          title="Game Shows"
          icon="📺"
          sectionId="game-shows-collection"
          filterFn={(g) => {
            const n = (g["Game Name"] || "").toLowerCase();
            const t = (g.type || "").toLowerCase();
            const c = n + " " + t;
            return c.includes("show") || c.includes("crazy time") || c.includes("monopoly") || c.includes("deal or no deal");
          }}
        />,
      },
      {
        path: "/andar-bahar",
        element: <CategoryGamesPage
          title="Andar Bahar"
          icon="🃏"
          sectionId="andar-bahar-collection"
          filterFn={(g) => {
            const n = (g["Game Name"] || "").toLowerCase();
            const t = (g.type || "").toLowerCase();
            const c = n + " " + t;
            return c.includes("andar") && c.includes("bahar");
          }}
        />,
      },
      {
        path: "/sic-bo",
        element: <CategoryGamesPage
          title="Sic Bo"
          icon="🎲"
          sectionId="sic-bo-collection"
          filterFn={(g) => {
            const n = (g["Game Name"] || "").toLowerCase();
            const t = (g.type || "").toLowerCase();
            const c = n + " " + t;
            return c.includes("sic bo") || c.includes("sicbo");
          }}
        />,
      },
      {
        path: "/lucky-7",
        element: <CategoryGamesPage
          title="Lucky 7"
          icon="🍀"
          sectionId="lucky-7-collection"
          filterFn={(g) => {
            const n = (g["Game Name"] || "").toLowerCase();
            const t = (g.type || "").toLowerCase();
            const c = n + " " + t;
            return c.includes("lucky 7") || c.includes("lucky seven") || c.includes("lucky7");
          }}
        />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ]
  }
]);

const BrandManager = () => {
  const { accountInfo } = useSite();

  useEffect(() => {
    if (accountInfo) {
      if (accountInfo.service_site_name) {
        document.title = accountInfo.service_site_name;
      }
      const brandingKey = `${accountInfo.service_site_name}|${accountInfo.service_site_logo}|${accountInfo.service_tagline}`;
      if (window.__lastPwaBranding === brandingKey) return;
      window.__lastPwaBranding = brandingKey;

      if (accountInfo.service_site_logo) {
        const logoPath = accountInfo.service_site_logo;
        const logoUrl = logoPath.startsWith('http') || logoPath.startsWith('data:')
          ? logoPath
          : (logoPath.startsWith('/') ? window.location.origin + logoPath : `${BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL}${logoPath.startsWith('/') ? logoPath : `/${logoPath}`}`);

        console.log("PWA Branding - Updating Manifest:", brandingKey);

        // Update Favicon and Apple Touch Icon with cache buster
        const cacheBuster = `?v=${Date.now()}`;
        const logoWithBuster = logoUrl + cacheBuster;

        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) favicon.href = logoWithBuster;

        const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
        if (appleIcon) appleIcon.href = logoWithBuster;

        // Dynamically update Manifest to ensure the browser's install prompt uses the backend logo
        const manifest = {
          id: "/",
          name: accountInfo.service_site_name || "Official Gaming Platform",
          short_name: (accountInfo.service_site_name || "Gaming").split(' ')[0],
          description: accountInfo.service_tagline?.replace(/<[^>]*>/g, '') || "Premium Gaming & Sports Betting Platform.",
          start_url: window.location.origin + "/",
          display: "standalone",
          background_color: "#000000",
          theme_color: "#E49C16",
          icons: [
            {
              src: window.location.origin + "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any"
            },
            {
              src: window.location.origin + "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any"
            },
            {
              src: window.location.origin + "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            },
            {
              src: logoUrl,
              sizes: "192x192 512x512",
              type: "image/png",
              purpose: "any"
            }
          ]
        };

        const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
        const manifestURL = window.URL.createObjectURL(blob);

        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
          manifestLink.setAttribute('href', manifestURL);
        }
      }
    }
  }, [accountInfo]);

  return null;
};

function App() {
  return (
    <SiteProvider>
      <GameProvider>
        <BrandManager />
        <ThemeSynchronizer />
        <RouterProvider router={appRouter} />
      </GameProvider>
    </SiteProvider>
  );
}

export default App;
